const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  discordID: {
    type: String,
    required: true,
  },
  discordUsername: {
    type: String,
    required: true,
  },
  discordAvatar: {
    type: String,
    required: false
  },
  discordDiscriminator: {
    type: String,
    required: true,
  },
  lastFMUsername: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rank: {
    type: String,
    required: false
  },
  streamCount: {
    type: Number,
    default: 0,
    required: true
  },
  tickets: {
    type: Number,
    required: false
  },
  negativeTickets: {
    type: Number,
    default: 0,
    required: false
  },
  winningTickets: {
    type: Number,
    default: 0,
    required: false
  }
})

module.exports = mongoose.model('User', UserSchema)
