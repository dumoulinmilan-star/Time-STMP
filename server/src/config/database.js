const mongoose = require("mongoose")

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing from the server .env file.")
  }

  await mongoose.connect(mongoUri)
  console.log("Connected to MongoDB")
}

module.exports = connectDatabase

