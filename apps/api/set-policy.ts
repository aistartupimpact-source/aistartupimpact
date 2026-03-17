import { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand } from "@aws-sdk/client-s3";

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

async function makeBucketPublic() {
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: `arn:aws:s3:::${bucketName}/*`
      }
    ]
  };

  try {
    const data = await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(policy)
      })
    );
    console.log("Success attaching policy:", data);
  } catch (err: any) {
    console.log("Error attaching policy:", err.message);
  }
}

makeBucketPublic();
