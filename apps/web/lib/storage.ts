import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

// We do not throw an error at the top level to allow the build to succeed without env variables,
// but we will throw it when functions are called if they are missing.
const getS3Client = () => {
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Missing R2 storage credentials in environment variables.");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

/**
 * Generates a presigned URL for a client to upload a file directly to R2.
 */
export async function generateUploadPresignedUrl(fileName: string, contentType: string): Promise<{ url: string; key: string }> {
  const s3 = getS3Client();
  const uniqueId = crypto.randomUUID();
  const key = `uploads/${uniqueId}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 600 }); // Valid for 10 minutes

  return { url, key };
}

/**
 * Generates a presigned URL for a client to download a file directly from R2.
 */
export async function generateDownloadPresignedUrl(storageKey: string, expiresInSeconds = 3600): Promise<string> {
  const s3 = getS3Client();
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: storageKey,
  });

  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

/**
 * Deletes a file from R2.
 */
export async function deleteObject(storageKey: string): Promise<void> {
  const s3 = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: storageKey,
  });

  await s3.send(command);
}
