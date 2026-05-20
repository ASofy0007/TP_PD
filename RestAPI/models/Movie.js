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
  }

});

module.exports = mongoose.model('Movie', MovieSchema);
