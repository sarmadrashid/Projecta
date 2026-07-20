import mongoose, { Schema } from "mongoose"

const projectSchema = new Schema(
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
    createdBy: {
      type: Schema.Types.ObjectID,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)
projectSchema.index({
  createdBy: 1,
})
export const Project = mongoose.model("Project", projectSchema)
