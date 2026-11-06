const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

module.exports = mongoose.model("Project", projectSchema)

