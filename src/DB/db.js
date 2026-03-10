import mongoose from "mongoose"

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}`,
    )
    console.log(
      " ✅ Database connected successfully: " +
        connectionInstance.connection.host,
    )
  } catch (error) {
    console.log(` ❌ MongoDB Connection Error: ${error}`)
    process.exit(1)
  }
}

export default connectDB
