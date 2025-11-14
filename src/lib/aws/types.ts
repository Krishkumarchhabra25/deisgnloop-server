// lib/aws/aws-types.ts

export interface UploadResult {
  url: string;
  key: string;
}

export interface S3UploadOptions {
  file: Buffer;
  fileName: string;
  contentType: string;
  folder?: string;
}

export interface PresignedUrlOptions {
  key: string;
  expiresIn?: number;
}

export enum S3Folders {
  PROFILE_PHOTOS = 'profile-photos',
  POSTS = 'posts',
  THUMBNAILS = 'thumbnails',
  DOCUMENTS = 'documents',
  VIDEOS = 'videos',
}