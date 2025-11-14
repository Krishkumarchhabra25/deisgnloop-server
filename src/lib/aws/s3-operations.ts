// lib/aws/s3-operations.ts
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./s3-client";

// Types for better type safety
interface UploadResult {
  url: string;
  key: string;
}

interface S3UploadOptions {
  file: Buffer;
  fileName: string;
  contentType: string;
  folder?: string; // e.g., 'images', 'videos', 'documents'
}

// Fallback bucket (matches the bucket name in your current policy)
const FALLBACK_BUCKET = "deisgnloop-bucket";
// Prefer env var if present, otherwise fall back to the policy bucket
const BUCKET = (process.env.AWS_S3_BUCKET && process.env.AWS_S3_BUCKET.trim()) || FALLBACK_BUCKET;
const REGION = process.env.AWS_REGION || "us-east-1";

if (!process.env.AWS_S3_BUCKET) {
  console.warn(
    `WARNING: AWS_S3_BUCKET is not set. Falling back to bucket from policy: "${FALLBACK_BUCKET}".`
  );
}
console.info("S3 config:", { BUCKET, REGION });

/**
 * Build public S3 URL for the object. Handles us-east-1 special host.
 */
const buildS3Url = (bucket: string, region: string, key: string) => {
  const encodedKey = encodeURIComponent(key).replace(/%2F/g, "/");
  if (!region || region === "us-east-1") {
    return `https://${bucket}.s3.amazonaws.com/${encodedKey}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
};

// Upload with better organization
export const uploadToS3 = async ({
  file,
  fileName,
  contentType,
  folder = "uploads"
}: S3UploadOptions): Promise<UploadResult | null> => {
  try {
    if (!file || !fileName) {
      throw new Error("uploadToS3 requires file buffer and fileName");
    }

    const key = folder ? `${folder.replace(/^\/+|\/+$/g, "")}/${fileName}` : fileName;

    console.info("S3 Upload - Bucket:", BUCKET, "Region:", REGION, "Key:", key);

    const params = {
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);

    const status = data.$metadata?.httpStatusCode ?? 0;
    if (status < 200 || status >= 300) {
      console.error("S3 upload returned non-success status", data.$metadata);
      throw new Error("Upload failed");
    }

    const url = buildS3Url(BUCKET, REGION, key);

    return { url, key };
  } catch (err) {
    console.error("S3 Upload Error:", err);
    return null;
  }
};

// Get presigned URL (better than direct access)
export const getPresignedUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    if (!key) throw new Error("getPresignedUrl requires key");

    console.info("S3 Presign - Bucket:", BUCKET, "Region:", REGION, "Key:", key);

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (err) {
    console.error("Presigned URL Error:", err);
    return null;
  }
};

// Delete object
export const deleteFromS3 = async (key: string): Promise<boolean> => {
  try {
    if (!key) throw new Error("deleteFromS3 requires key");

    console.info("S3 Delete - Bucket:", BUCKET, "Key:", key);

    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const data = await s3Client.send(command);
    const status = data.$metadata?.httpStatusCode ?? 0;
    return status === 204 || (status >= 200 && status < 300);
  } catch (err) {
    console.error("S3 Delete Error:", err);
    return false;
  }
};

// Get object stream (for downloading)
export const getObjectStream = async (key: string) => {
  try {
    if (!key) throw new Error("getObjectStream requires key");

    console.info("S3 GetObject - Bucket:", BUCKET, "Key:", key);

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const data = await s3Client.send(command);
    return data.Body;
  } catch (err) {
    console.error("S3 Get Object Error:", err);
    return null;
  }
};
