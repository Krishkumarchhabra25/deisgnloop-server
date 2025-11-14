// utils/file-validator.ts
export const getContentType = (mimetype: string): string => {
    const contentTypeMap: Record<string, string> = {
        'image/jpeg': 'image/jpeg',
        'image/jpg': 'image/jpeg',
        'image/png': 'image/png',
        'image/gif': 'image/gif',
        'video/mp4': 'video/mp4',
        'video/mkv': 'video/x-matroska',
        'application/pdf': 'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    
    return contentTypeMap[mimetype] || 'application/octet-stream';
};

export const validateFileType = (
    mimetype: string, 
    allowedTypes: string[]
): boolean => {
    return allowedTypes.includes(mimetype);
};