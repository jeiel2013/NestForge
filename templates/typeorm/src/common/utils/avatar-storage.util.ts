import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const avatarStorage = diskStorage({
    destination: './uploads/avatars',
    filename: (_req, file, callback) => {
        const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
        callback(null, uniqueName);
    },
});

export function avatarFileFilter(
    _req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        callback(
            new BadRequestException('Unsupported image format (use PNG, JPEG, or WEBP)'),
            false,
        );
        return;
    }

    callback(null, true);
}

export const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
