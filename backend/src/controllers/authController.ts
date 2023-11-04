import { NextFunction, Request, Response } from "express";
import passport from "passport";
import "../auth/passportHandler";

export class AuthController {
  public authenticateJWT(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("jwt", (err: any, user: any, info: any) => {
      if (err) { console.log(err); console.log(info); }
      if (err || !user)
        return res.status(401).json({ status: "error", code: "unauthorized" });
      else {
        req.params.email = user.email;
        req.params.salt = user.salt;
        next();
      }
    })(req, res, next);
  }
}
