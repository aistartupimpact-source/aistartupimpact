import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const accountId = "181ee96d4bd0440cedf88f0ae2d77913";
const accessKeyId = "63ff5f1bc34d23f086efed79b25eec4d";
const secretAccessKey = "91428aafa5ca6c754be217f0d1a8b186b0e3a9d4681fc0d379e42b032db65334";
const bucketName = "aistartupimpact-media";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function setCors() {
  try {
    const data = await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
              AllowedOrigins: ["http://localhost:3000", "http://localhost:3001"],
              ExposeHeaders: ["ETag"],
              MaxAgeSeconds: 3000
            },
          ],
        },
      })
    );
    console.log("Success", data);
  } catch (err) {
    console.log("Error", err);
  }
}

setCors();
