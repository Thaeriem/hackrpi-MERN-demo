import { Document, Schema, Model, model } from "mongoose";

export interface IData extends Document {
  data_id: string;
  name: string;
  attributes: string[];
}

export const dataSchema: Schema = new Schema({
  data_id: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  attributes: [
    {
      type: String,
    },
  ],
});

export const Data: Model<IData> = model<IData>("Data", dataSchema);
