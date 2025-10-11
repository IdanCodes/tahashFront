import { Schema } from "mongoose";
import { PackedResult } from "../../interfaces/packed-result";

export const packedResultSchema = new Schema<PackedResult>(
  {
    penalty: Number,
    extraArgs: Object,
    centis: Number,
  },
  {
    _id: false,
  },
);
