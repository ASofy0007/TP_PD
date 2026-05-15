const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  genre: {
    type: String,
    required: true
  },

  releaseYear: {
    type: Number
  },

  watched: {
    type: Boolean,
    default: false
  },

  watchedAt: {
    type: Date
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', MovieSchema);