const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { startCronJobs } = require("./services/cronService");
const { sendSMSNotification } = require("./services/snsService");
const User = require("./models/User");

const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION });

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

app.get("/test-sms", async (req, res) => {
  const result = await dynamo.send(new ScanCommand({
    TableName: "Users",
    Select: "COUNT"
  }));

  const count = result.Count;
  if (count > 0) {
    await sendSMSNotification("Alerta: Não existem utilizadores na aplicação!");
    res.json({ sent: true, reason: "0 utilizadores" });
  } else {
    res.json({ sent: false, reason: `${count} utilizadores existentes` });
  }
});

app.use('/movies', movieRoutes);
app.use('/users', userRoutes);
app.use('/history', historyRoutes);
if (s3Routes) app.use("/api/files", s3Routes);

startCronJobs();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});