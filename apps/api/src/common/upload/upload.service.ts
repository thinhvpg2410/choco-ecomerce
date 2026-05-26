import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('cloudinary.cloudName'),
      api_key: this.configService.get('cloudinary.apiKey'),
      api_secret: this.configService.get('cloudinary.apiSecret'),
    });
  }

  private validateImage(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('Không có file nào được tải lên');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Định dạng file không hợp lệ. Chỉ chấp nhận: JPG, PNG, WEBP, GIF`,
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Tối đa cho phép: 5MB`,
      );
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<string> {
    this.validateImage(file);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `chocoshop/${folder}`,
          resource_type: 'image',
          quality: 'auto:good',
          fetch_format: 'auto',
          transformation: [{ width: 1920, height: 1080, crop: 'limit' }],
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            return reject(
              new InternalServerErrorException(
                'Tải ảnh lên thất bại, vui lòng thử lại',
              ),
            );
          }
          resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error) => {
        if (error) {
          reject(
            new InternalServerErrorException(
              'Xóa ảnh thất bại, vui lòng thử lại',
            ),
          );
        } else {
          resolve();
        }
      });
    });
  }
}
