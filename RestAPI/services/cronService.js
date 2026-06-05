const cron = require("node-cron");
const { sendSMSNotification } = require("./snsService");
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION });

function startCronJobs() {
  cron.schedule("0 9 * * *", async () => {
    console.log("Cron job a correr...");

    const result = await dynamo.send(new ScanCommand({
      TableName: "Users",
      Select: "COUNT"
    }));

    if (result.Count > 0) {
      await sendSMSNotification("Note: Existem utilizadores na aplicação!");
    }
  });

  console.log("Cron jobs iniciados!");
}

module.exports = { startCronJobs };