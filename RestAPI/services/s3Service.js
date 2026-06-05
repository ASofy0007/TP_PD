const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({ region: process.env.AWS_REGION });

async function uploadFile(fileName, fileBuffer, mimeType) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  }));
}

async function getFileUrl(fileName) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
  });
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
}

async function getUsersFromS3() {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: "users.json",
    });
    const response = await s3.send(command);
    const body = await response.Body.transformToString();
    return JSON.parse(body);
  } catch (err) {
    console.error('Erro ao ler S3:', err.message);
    return [];
  }
}

async function saveUsersToS3(users) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: "users.json",
    Body: JSON.stringify(users),
    ContentType: "application/json",
  }));
}

module.exports = { uploadFile, getFileUrl, getUsersFromS3, saveUsersToS3 };