const User = require('../models/User');
const WatchHistory = require('../models/WatchHistory');

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

exports.loginUser = async (req, res) => {

  try {

    const { email, name } = req.body;

    let user = await User.findOne({ email });

    if (!user) {

      user = new User({
        email,
        name: name || "User"
      });

      await user.save();
    }

    res.json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.getUserHistory = async (req, res) => {

  try {

    const history = await WatchHistory.find({
      userId: req.params.id
    }).populate('movieId');

    res.json(history);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};