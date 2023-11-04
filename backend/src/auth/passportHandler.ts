import passport from "passport";
import passportLocal from "passport-local";
import passportJwt from "passport-jwt";
import passportGoogle from "passport-google-oauth20";
import { Account } from "../models/account";
import {
  JWT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "../util/secrets";

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const GoogleStrategy = passportGoogle.Strategy;

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    (username: string, password: string, done) => {
      Account.findOne(
        { username: username.toLowerCase() },
        (err: Error, user: any) => {
          if (err) return done(err);
          if (!user)
            return done(undefined, false, {
              message: `username ${username} not found.`,
            });

          user.comparePassword(password, (err: Error, isMatch: boolean) => {
            if (err) return done(err);
            if (isMatch) return done(undefined, user);
            return done(undefined, false, {
              message: "Invalid username or password.",
            });
          });
        }
      );
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    (jwtToken: any, done) => {
      Account.findOne({ email: jwtToken.username }, (err: Error, user: any) => {
        if (err) return done(err, false);
        if (user) return done(undefined, user, jwtToken);
        else return done(undefined, false);
      });
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      done(undefined, profile);
    }
  )
);
