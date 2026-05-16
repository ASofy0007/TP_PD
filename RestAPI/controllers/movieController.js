const Movie = require('../models/Movie');

exports.getMovies = async (req, res) => {

  try {

    const movies = await Movie.find();

    res.json(movies);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.createMovie = async (req, res) => {

  try {

    const movie = new Movie(req.body);

    await movie.save();

    res.status(201).json(movie);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.updateMovie = async (req, res) => {
  try {
    const updated = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.deleteMovie = async (req, res) => {

  try {

    await Movie.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Movie deleted'
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};