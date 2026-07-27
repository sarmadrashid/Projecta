import multer from "multer"
import path from "path"
import ApiError from "../utils/api-error.js"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, "public/images")
    } else if (file.mimetype.startsWith("application/pdf")) {
      cb(null, "public/pdfs")
    } else {
      cb(new ApiError(400, "Invalid file type"), false)
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.fieldname
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

export const upload = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024,
    files: 5,
  },
})
