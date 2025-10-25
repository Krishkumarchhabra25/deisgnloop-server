// controllers/upload.controller.ts
import { Request, Response } from 'express';
import { uploadToS3, deleteFromS3 } from '../../lib/aws/s3-operations';
import { getContentType, validateFileType } from '../../utils/fileValidator';
import { Multer } from 'multer';

// Extend Request type to include file from multer
interface MulterRequest extends Request {
    file?: any;
}

export const uploadImage = async (req: MulterRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validateFileType(req.file.mimetype, allowedTypes)) {
            return res.status(400).json({ error: 'Invalid file type' });
        }
        
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const contentType = getContentType(req.file.mimetype);
        
        const result = await uploadToS3({
            file: req.file.buffer,
            fileName,
            contentType,
            folder: 'images'
        });
        
        if (!result) {
            return res.status(500).json({ error: 'Upload failed' });
        }
        
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};