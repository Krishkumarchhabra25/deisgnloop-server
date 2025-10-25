// lib/aws/s3-operations.ts
import { 
    PutObjectCommand, 
    GetObjectCommand, 
    DeleteObjectCommand,
    S3Client 
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

// Upload with better organization
export const uploadToS3 = async ({
    file,
    fileName,
    contentType,
    folder = 'uploads'
}: S3UploadOptions): Promise<UploadResult | null> => {
    try {
        const key = folder ? `${folder}/${fileName}` : fileName;
        
        const params = {
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key,
            Body: file,
            ContentType: contentType,
        };
        
        const command = new PutObjectCommand(params);
        const data = await s3Client.send(command);
        
        if (data.$metadata.httpStatusCode !== 200) {
            throw new Error('Upload failed');
        }
        
        const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        
        return { url, key };
    } catch (err) {
        console.error('S3 Upload Error:', err);
        return null;
    }
};

// Get presigned URL (better than direct access)
export const getPresignedUrl = async (
    key: string, 
    expiresIn: number = 3600
): Promise<string | null> => {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key,
        });
        
        const url = await getSignedUrl(s3Client, command, { expiresIn });
        return url;
    } catch (err) {
        console.error('Presigned URL Error:', err);
        return null;
    }
};

// Delete object
export const deleteFromS3 = async (key: string): Promise<boolean> => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key,
        });
        
        const data = await s3Client.send(command);
        return data.$metadata.httpStatusCode === 204;
    } catch (err) {
        console.error('S3 Delete Error:', err);
        return false;
    }
};

// Get object stream (for downloading)
export const getObjectStream = async (key: string) => {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key,
        });
        
        const data = await s3Client.send(command);
        return data.Body;
    } catch (err) {
        console.error('S3 Get Object Error:', err);
        return null;
    }
};