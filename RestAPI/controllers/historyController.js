const WatchHistory = require('../models/WatchHistory');
const Movie = require('../models/Movie');
exports.markMovieAsWatched = async (req, res) => {

  try {

    const { userId, movieId, watchedAt } = req.body;

    // evita duplicados
    const existing = await WatchHistory.findOne({
      userId,
      movieId
    });

    if (existing) {
      return res.status(400).json({
        message: "Movie already marked as watched"
      });
    }

    const history = new WatchHistory({
      userId,
      movieId,
      watchedAt: watchedAt || Date.now()
    });

    await history.save();

    res.status(201).json(history);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.updateWatchedDate = async (req, res) => {

  try {

    const { id } = req.params;
    const { watchedAt } = req.body;

    const updated = await WatchHistory.findByIdAndUpdate(
      id,
      { watchedAt },
      { new: true }
    ).populate('movieId');

    if (!updated) {
      return res.status(404).json({
        message: "History entry not found"
      });
    }

    res.json(updated);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.removeFromHistory = async (req, res) => {

  try {

    const { id } = req.params;

    await WatchHistory.findByIdAndDelete(id);

    res.json({
      message: "Removed from history"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};