import mongoose, { Schema, Types } from "mongoose"
import { AvailableTaskStatuses, TaskStatusEnum } from "../constant.js"

const subtaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    task: {
      type: Schema.Types.ObjectID,
      ref: "Task",
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectID,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)
subtaskSchema.index({
  task: 1,
})
export const SubTask = mongoose.model("SubTask", subtaskSchema)
