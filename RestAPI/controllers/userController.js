const User = require('../models/User');
const WatchHistory = require('../models/WatchHistory');
const { getUsersFromS3, saveUsersToS3 } = require("../services/s3Service");

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

    console.log('A guardar no S3...');
    const allUsers = await getUsersFromS3();
    allUsers.push({ _id: user._id, name: user.name, email: user.email });
    await saveUsersToS3(allUsers);
    console.log('Guardado no S3 com sucesso!');

    res.status(201).json(user);
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, name } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      if (!name) {
        return res.status(400).json({
          needsName: true,
          message: "Name required to create user"
        });
      }

      user = await User.create({
        email,
        name
      });
      
      console.log('A guardar no S3...');
      const allUsers = await getUsersFromS3();
      allUsers.push({ _id: user._id, name: user.name, email: user.email });
      await saveUsersToS3(allUsers);
      console.log('Guardado no S3 com sucesso!');
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await User.findByIdAndUpdate(
      id,
      { name: req.body.name },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
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

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    await WatchHistory.deleteMany({
      userId: id
    });

    res.json({
      message: "User deleted"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};