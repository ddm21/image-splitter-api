import axios from 'axios';
import FormData from 'form-data';
import { ImgBBUploadResponse } from '../types';
import { config } from '../config';

export class ImgBBService {
    private static readonly API_URL = 'https://api.imgbb.com/1/upload';

    static async uploadImage(
        imageBuffer: Buffer,
        filename: string = 'image'
    ): Promise<{
        url: string;
        width: number;
        height: number;
        size: number;
        expiration: string;
    }> {
        const apiKey = config.imgbb.apiKey;

        if (!apiKey || apiKey === 'your_imgbb_api_key_here') {
            throw new Error(
                'ImgBB API key not configured. Please set IMGBB_API_KEY in your environment variables.'
            );
        }

        try {
            const formData = new FormData();
            formData.append('image', imageBuffer.toString('base64'));
            formData.append('name', filename);

            // Add expiration if configured
            if (config.imgbb.expiration > 0) {
                formData.append('expiration', config.imgbb.expiration.toString());
            }

            const response = await axios.post<ImgBBUploadResponse>(
                `${this.API_URL}?key=${apiKey}`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: 30000,
                }
            );

            if (!response.data.success) {
                throw new Error('ImgBB upload failed: API returned success=false');
            }

            const { data } = response.data;

            return {
                url: data.url,
                width: parseInt(data.width, 10),
                height: parseInt(data.height, 10),
                size: data.size,
                expiration: data.expiration,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    throw new Error('ImgBB upload failed: Invalid image data or API key');
                }
                if (error.response?.status === 403) {
                    throw new Error('ImgBB upload failed: Invalid or expired API key');
                }
                if (error.code === 'ECONNABORTED') {
                    throw new Error('ImgBB upload timeout');
                }
                throw new Error(`ImgBB upload failed: ${error.message}`);
            }
            throw error;
        }
    }

    static async uploadMultiple(
        images: Buffer[],
        baseFilename: string = 'chunk'
    ): Promise<Array<{
        url: string;
        width: number;
        height: number;
        size: number;
        expiration: string;
    }>> {
        const uploadPromises = images.map((buffer, index) =>
            this.uploadImage(buffer, `${baseFilename}-${index}`)
        );

        try {
            return await Promise.all(uploadPromises);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to upload images to ImgBB: ${error.message}`);
            }
            throw error;
        }
    }
}
