import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

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

async function run() {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: 'uploads/',
  });
  const res = await s3Client.send(command);
  console.log((res.Contents || []).map(i => i.Key));
}
run();
