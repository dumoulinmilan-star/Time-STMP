const mongoose = require("mongoose")

const timeEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0.25,
    max: 24,
    validate: {
      validator: (hours) => Number.isInteger(hours * 4),
      message: "Hours must use 0.25 increments."
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
}, { timestamps: true })

module.exports = mongoose.model("TimeEntry", timeEntrySchema)
