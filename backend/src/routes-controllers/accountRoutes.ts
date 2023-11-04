import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import passport from "passport";
import "../auth/passportHandler";
import { Account, IAccount } from "../models/account";
import { JWT_SECRET } from "../util/secrets";

function validateInputs(body: any, fields: any) {
  const fields_arr = Object.keys(fields);
  const body_arr = Object.keys(body);
  if (body_arr.length != fields_arr.length) return false;
  if (!body_arr.every((key) => fields_arr.includes(key))) return false;
  if (!fields_arr.every((key) => body_arr.includes(key))) return false;
  return true;
}

async function checkValidAccount(
  name: string,
  email: string
): Promise<IAccount> {
  const user = await Account.findOne({
    $or: [{ username: name }, { email: email }],
  });
  return new Promise((resolve) => {
    if (user) resolve(user);
  });
}

async function createAccount(body: any) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(body.password, salt);

  await Account.create({
    username: body.username,
    password: hashedPassword,
    salt: salt,
    email: body.email,
    displayName: body.displayName,
    plan: "none",
    hasTrial: false,
    endDate: undefined,
    org_id: "",
    room_ids: [],
  });

  return jwt.sign({ username: body.email, scope: body.scope }, JWT_SECRET);
}

function authLocal(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("local", (err: Error, user: any) => {
    // no async/await because passport works only with callback ..
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ status: "error", code: "unauthorized" });
    else {
      const token = jwt.sign({ username: user.email }, JWT_SECRET);
      res.status(200).send({ token: token });
    }
  })(req, res, next);
}

export function authGoogle(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
}

export function receiveGoogle(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("google", async (err: Error, profile: any) => {
    if (err) return next(err);
    req.body.username = profile.email || profile.emails[0].value;
    if (!req.body.username)
      return res
        .status(400)
        .json({ status: "error", code: "no email attached to account" });

    const user = await checkValidAccount(req.body.username, req.body.username);
    if (!user) {
      req.body.password = profile.id;
      req.body.displayName = profile._json.name;
      req.body.email = req.body.username;

      createAccount(req.body)
        .then((token: any) => {
          const string = encodeURIComponent(token);
          res.redirect("http://localhost:8080/oauth?token=" + string);
        })
        .catch(() => {
          res.redirect("http://localhost:8080/oauth?token=error");
        });
    } else {
      const token = jwt.sign({ username: user.email }, JWT_SECRET);

      const string = encodeURIComponent(token);
      res.redirect("http://localhost:8080/oauth?token=" + string);
    }
  })(req, res, next);
}

export class AccountController {
  public async registerAccount(req: Request, res: Response): Promise<void> {
    const template = { username: "", password: "", email: "" };
    if (!validateInputs(req.body, template)) {
      res.status(400).json({ status: "error", code: "invalid fields" });
      return;
    }
    const valid = await checkValidAccount(
      req.body.username as string,
      req.body.email as string
    );

    if (valid) {
      res.status(400).json({ status: "error", code: "invalid request" });
      return;
    }
    req.body.displayName = "";
    const token = await createAccount(req.body);
    res.status(201).send({ token: token });
  }

  public authAccount(req: Request, res: Response, next: NextFunction) {
    return authLocal(req, res, next);
  }

  public async updateAccount(req: Request, res: Response): Promise<void> {
    const user_email = req.params.email;
    // input validation
    const template = { username: "", password: "", displayName: "" };
    if (!validateInputs(req.body, template)) {
      res.status(400).json({ status: "error", code: "invalid fields" });
      return;
    }
    // check duplicate username
    const username = req.body.username || "";
    const user = await Account.findOne({ email: user_email });

    // if username is same as old username no problem

    if (user && user.username != username) {
      const valid = await checkValidAccount(username, "");
      if (valid) {
        res.status(400).json({ status: "error", code: "invalid request" });
        return;
      }
    }

    req.body.password = bcrypt.hashSync(req.body.password, req.params.salt);

    Account.findOneAndUpdate({ email: user_email }, req.body).then(() => {
      res.status(200).json({ status: res.status, code: "account updated!" });
    });
  }
}
