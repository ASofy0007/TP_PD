const express = require('express');
const router = express.Router();

const {
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  markAsWatched
} = require('../controllers/movieController');

router.get('/', getMovies);

router.post('/', createMovie);

router.put('/:id', updateMovie);

router.delete('/:id', deleteMovie);

router.put('/:id/watch', markAsWatched);

module.exports = router;