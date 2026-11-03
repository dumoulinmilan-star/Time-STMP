const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model("Session", sessionSchema)

