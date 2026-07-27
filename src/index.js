import dotenv from "dotenv"
dotenv.config({
  path: ".env",
})
import { app } from "./app.js"
import connectDB from "./DB/db.js"

const port = process.env.PORT
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  })
  .catch((error) => {
    console.log("Failed to connect to the database", error)
    process.exit(1)
  })
