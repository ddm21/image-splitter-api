import axios from 'axios';
import sharp from 'sharp';
import { ImageSource } from '../types';
import { config } from '../config';

export class ImageLoader {
    static async loadImage(source: ImageSource, data: string): Promise<Buffer> {
        if (source === ImageSource.URL) {
            return await this.loadFromURL(data);
        } else {
            return await this.loadFromBinary(data);
        }
    }

    private static async loadFromURL(url: string): Promise<Buffer> {
        try {
            // Validate URL format
            new URL(url);

            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000,
                maxContentLength: config.security.maxFileSizeMB * 1024 * 1024,
                headers: {
                    'User-Agent': 'ImageSplitterAPI/1.0',
                },
            });

            if (!response.data) {
                throw new Error('No data received from URL');
            }

            return Buffer.from(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.code === 'ENOTFOUND') {
                    throw new Error('Invalid URL or host not found');
                }
                if (error.response?.status === 404) {
                    throw new Error('Image not found at the provided URL');
                }
                if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout while fetching image');
                }
                throw new Error(`Failed to fetch image: ${error.message}`);
            }
            throw error;
        }
    }

    private static async loadFromBinary(base64Data: string): Promise<Buffer> {
        try {
            // Remove data URI prefix if present (e.g., "data:image/png;base64,")
            const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');

            const buffer = Buffer.from(base64String, 'base64');

            if (buffer.length === 0) {
                throw new Error('Invalid base64 data: empty buffer');
            }

            // Check file size
            const sizeMB = buffer.length / (1024 * 1024);
            if (sizeMB > config.security.maxFileSizeMB) {
                throw new Error(`Image size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed size (${config.security.maxFileSizeMB}MB)`);
            }

            return buffer;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to decode base64 image: ${error.message}`);
            }
            throw error;
        }
    }

    static async validateImage(buffer: Buffer): Promise<{ width: number; height: number; format: string }> {
        try {
            const metadata = await sharp(buffer).metadata();

            if (!metadata.width || !metadata.height) {
                throw new Error('Unable to determine image dimensions');
            }

            if (!metadata.format) {
                throw new Error('Unable to determine image format');
            }

            // Validate supported formats
            const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff', 'bmp'];
            if (!supportedFormats.includes(metadata.format.toLowerCase())) {
                throw new Error(`Unsupported image format: ${metadata.format}`);
            }

            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Image validation failed: ${error.message}`);
            }
            throw error;
        }
    }
}
