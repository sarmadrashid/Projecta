import mongoose, { Schema } from "mongoose"

const noteSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  { timestamps: true },
)
noteSchema.index({
  project: 1,
  createdAt: -1,
})

export const Note = mongoose.model("Note", noteSchema)
