import { Document, Schema, Model, model, Error } from "mongoose";
import bcrypt from "bcrypt";

export interface IAccount extends Document {
  username: string;
  password: string;
  salt: string;
  email: string;
  displayName: string;
}

export const accountSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: String,
});

accountSchema.methods.comparePassword = function (
  candidatePassword: string,
  callback: any
) {
  const user = this as IAccount;
  bcrypt.compare(
    candidatePassword,
    user.password,
    (err: Error, isMatch: boolean) => {
      callback(err, isMatch);
    }
  );
};

export const Account: Model<IAccount> = model<IAccount>(
  "Account",
  accountSchema
);
