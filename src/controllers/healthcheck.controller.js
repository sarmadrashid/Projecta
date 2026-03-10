import ApiResponse from "../utils/api-response.js"
import asyncHandler from "../utils/async-handler.js"
const healthcheck = asyncHandler((req, res) => {
  res.status(200).json(new ApiResponse(200, "API is healthy"))
})

export { healthcheck }
