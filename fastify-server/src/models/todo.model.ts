import { Schema, model } from "mongoose";

interface ITodo {
  title: string;
  body: string;
  category: string;
  subCategory: string;
  completed: boolean;
}

const todoSchema = new Schema<ITodo>(
  {
    title: {
      type: String,
      required: [true, "Title should not be empty!"],
      unique: true,
    },
    body: {
      type: String,
      required: [true, "Body should not be empty!"],
      unique: false,
    },
    category: {
      type: String,
      required: [true, "Category should not be empty!"],
      unique: false,
    },
    subCategory: {
      type: String,
      required: [true, "Sub Category should not be empty!"],
      unique: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Todo = model<ITodo>("Todo", todoSchema);
