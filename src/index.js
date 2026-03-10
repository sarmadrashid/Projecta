import { app } from "./app.js"
import dotenv from "dotenv"
import connectDB from "./DB/db.js"
dotenv.config({
  path: ".env",
})

const port = process.env.PORT || 8000
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  })
  .catch((error) => {
    console.log("Failed to connect to the database", error)
  })
