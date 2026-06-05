const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const sns = new SNSClient({ region: process.env.AWS_REGION });

async function sendSMSNotification(message) {
  try {
    const command = new PublishCommand({
      Message: message,
      PhoneNumber: process.env.ADMIN_PHONE,
    });
    await sns.send(command);
    console.log("SMS enviado com sucesso!");
  } catch (err) {
    console.error("Erro ao enviar SMS:", err.message);
  }
}

module.exports = { sendSMSNotification };