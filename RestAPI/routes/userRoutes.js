const express = require('express');
const router = express.Router();

const {
  getUsers,
  createUser,
  loginUser,
  getUserHistory,
  updateUser,
  deleteUser
} = require('../controllers/userController');

router.get('/', getUsers);

router.post('/', createUser);

router.post('/login', loginUser);

router.get('/:id/history', getUserHistory);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

module.exports = router;

