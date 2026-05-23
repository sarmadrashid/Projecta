import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(express.json({ limit: "200kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
)

app.get("/", (req, res) => {
  res.send("Hello, World!")
})
// routes

import healthcheckRoutes from "./routes/healthcheck.routes.js"

app.use("/api/v1/healthcheck", healthcheckRoutes)

import authRoutes from "./routes/auth.routes.js"

app.use("/api/v1/auth", authRoutes)

export { app }
