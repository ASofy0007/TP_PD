const { uploadFile, getFileUrl, getUsersFromS3 } = require("../services/s3Service.js");

async function upload(req, res) {
  try {
    const { originalname, buffer, mimetype } = req.file;
    await uploadFile(originalname, buffer, mimetype);
    res.json({ success: true, fileName: originalname });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getFile(req, res) {
  try {
    const url = await getFileUrl(req.params.fileName);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUsersS3(req, res) {
  try {
    const users = await getUsersFromS3();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { upload, getFile, getUsersS3 };