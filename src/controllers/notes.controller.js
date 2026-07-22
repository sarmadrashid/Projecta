import ApiResponse from "../utils/api-response.js"
import asyncHandler from "../utils/async-handler.js"
import ApiError from "../utils/api-error.js"
import mongoose from "mongoose"
import { Note } from "../models/notes.models.js"
import { Project } from "../models/project.models.js"
import { Task } from "../models/task.models.js"

const getNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Project Id is invalid", [])
  }

  const notes = await Note.find({
    project: projectId,
  }).select("content createdBy project createdAt ")

  return res
    .status(200)
    .json(new ApiResponse(200, { notes }, "Notes fetched successfully"))
})

const getNoteById = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Project Id is invalid", [])
  }
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new ApiError(400, "Note Id is invalid", [])
  }

  const note = await Note.findOne({
    _id: noteId,
    project: projectId,
  })

  if (!note) {
    throw new ApiError(404, "Note not Found", [])
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { note }, "Note FetchedSuccessfully"))
})

const createNote = asyncHandler(async (req, res) => {
  const { content } = req.body
  const { projectId } = req.params
  if (!content) {
    throw new ApiError(400, "Content is required", [])
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Project Id is invalid", [])
  }

  const note = await Note.create({
    content: content,
    createdBy: req.user._id,
    project: projectId,
  })

  if (!note) {
    throw new ApiError(500, "Note creation failed", [])
  }

  return res
    .status(201)
    .json(new ApiResponse(201, note, "Note created successfully"))
})

const updateNote = asyncHandler(async (req, res) => {
  const { content: updatedContent } = req.body
  const { projectId, noteId } = req.params
  if (!updatedContent) {
    throw new ApiError(400, "Content is required", [])
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Project Id is invalid", [])
  }
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new ApiError(400, "Note Id is invalid", [])
  }

  const note = await Note.findOneAndUpdate(
    {
      _id: noteId,
      project: projectId,
    },
    {
      content: updatedContent,
    },
    {
      new: true,
    },
  )

  if (!note) {
    throw new ApiError(404, "note not found", [])
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note Updated Successfully"))
})

const deleteNote = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Project Id is invalid", [])
  }
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new ApiError(400, "Note Id is invalid", [])
  }

  const note = await Note.findOneAndDelete({
    _id: noteId,
    project: projectId,
  })

  if (!note) {
    throw new ApiError(404, "Note not Found", [])
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note Deleted Successfully"))
})

export { getNotes, getNoteById, createNote, updateNote, deleteNote }
