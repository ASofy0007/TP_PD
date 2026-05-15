const User = require('../models/User');
const Movie = require('../models/Movie');

exports.getUsers = async (req, res) => {

  try {

    const users = await User.find();

    res.json(users);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.createUser = async (req, res) => {

  try {

    const user = new User(req.body);

    await user.save();

    res.status(201).json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.getUserHistory = async (req, res) => {

  try {

    const movies = await Movie.find({
      userId: req.params.id,
      watched: true
    });

    res.json(movies);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};