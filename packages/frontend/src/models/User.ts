import bcrypt from "bcrypt";
import {
  prop,
  ReturnModelType,
  getModelForClass,
  modelOptions,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

class User {
  @prop()
  public name?: string;

  @prop({ unique: true, required: true })
  public email?: string;

  @prop()
  public password?: string;

  @prop()
  emailVerified?: Date;

  @prop()
  image?: string;

  get id() {
    return (this as any)._id;
  }

  /**
   * Return a hashed version of a password
   */
  public static async generatePasswordHash(passwd: string) {
    return bcrypt.hash(passwd, 1);
  }

  /**
   * Attempt to authenticate a user
   */
  public static async auth(
    this: ReturnModelType<typeof User>,
    email?: string,
    password?: string
  ) {
    if (typeof email !== "string" || typeof password !== "string") {
      return null;
    }

    const user = await this.findOne({ email: new RegExp(email.trim(), "i") });
    if (user && user.password) {
      const authenticated = await bcrypt.compare(password, user.password);
      if (authenticated) {
        return user;
      }
    }
    return null;
  }
}

export default (mongoose.models["User"] ??
  getModelForClass(User)) as ReturnModelType<typeof User, {}>;
