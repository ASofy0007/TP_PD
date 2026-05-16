const express = require('express');
const router = express.Router();

const {
  markMovieAsWatched,
  updateWatchedDate,
  removeFromHistory
} = require('../controllers/historyController');

router.post('/watch', markMovieAsWatched);

router.put('/:id', updateWatchedDate);

router.delete('/:id', removeFromHistory);

module.exports = router;