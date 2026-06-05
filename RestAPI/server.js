const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const movieRoutes = require('./routes/movieRoutes');
const userRoutes = require('./routes/userRoutes');
const historyRoutes = require('./routes/historyRoutes');

let s3Routes;
try {
  s3Routes = require('./routes/s3Routes');
  console.log('s3Routes loaded OK');
} catch (err) {
  console.error('Erro ao carregar s3Routes:', err.message);
}

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Movies API running');
});

app.use('/movies', movieRoutes);
app.use('/users', userRoutes);
app.use('/history', historyRoutes);
if (s3Routes) app.use("/api/files", s3Routes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});