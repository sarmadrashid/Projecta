import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"
dotenv.config({
  path: ".env",
})
import fs from "fs/promises"
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    })

    await fs.unlink(localFilePath)

    return {
      url: response.secure_url,
      publicId: response.public_id,
    }
  } catch (error) {
    try {
      await fs.unlink(localFilePath)
    } catch {}

    throw error
  }
}
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return

  await cloudinary.uploader.destroy(publicId)
}
const deleteMultipleFromCloudinary = async (attachments = []) => {
  for (const attachment of attachments) {
    try {
      await deleteFromCloudinary(attachment.publicId)
    } catch (error) {
      console.error(`Failed to delete ${attachment.publicId}`, error.message)
    }
  }
}
export {
  uploadOnCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
}
