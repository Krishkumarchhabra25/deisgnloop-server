// utils/urlGenerator.ts

/**
 * Generates a unique filename with timestamp and random string
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
  
  // Clean the filename - remove special characters
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  
  return `${cleanName}-${timestamp}-${randomString}.${extension}`;
};

/**
 * Generates S3 URL from bucket, region and key
 */
export const generateS3Url = (key: string): string => {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

/**
 * Extracts S3 key from full S3 URL
 */
export const extractS3KeyFromUrl = (url: string): string | null => {
  try {
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const urlPattern = `https://${bucket}.s3.${region}.amazonaws.com/`;
    
    if (url.startsWith(urlPattern)) {
      return url.replace(urlPattern, '');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting S3 key:', error);
    return null;
  }
};

/**
 * Validates if a URL is from our S3 bucket
 */
export const isValidS3Url = (url: string): boolean => {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  const urlPattern = `https://${bucket}.s3.${region}.amazonaws.com/`;
  
  return url.startsWith(urlPattern);
};