import mongoose, { Schema, Types } from "mongoose"
import { AvailableTaskStatuses, TaskStatusEnum } from "../constant.js"
const taskSchema = new Schema(
  {
    title: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    project: {
      type: Schema.Types.ObjectID,
      ref: "Project",
      required: true,
    },
    status: {
      type: String,
      enum: AvailableTaskStatuses,
      default: TaskStatusEnum.TO_DO,
      required: true,
    },
    attachment: {
      types: [
        {
          url: String,
          mimetype: String,
          size: Number,
        },
      ],
      default: [],
    },
    assignedTo: {
      type: Schema.Types.ObjectID,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectID,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Task = mongoose.model("Task", taskSchema)
