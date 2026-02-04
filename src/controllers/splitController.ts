import { Request, Response, NextFunction } from 'express';
import { validateSplitRequest } from '../validators/splitRequest';
import { ImageLoader } from '../utils/imageLoader';
import { ImageProcessor } from '../utils/imageProcessor';
import { ImgBBService } from '../services/imgbbService';
import { AppError } from '../middleware/errorHandler';
import {
    OutputType,
    ImageChunkBinary,
    ImageChunkURL,
    SplitResponseBinary,
    SplitResponseURL,
} from '../types';

export const splitImageController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Validate request
        const validatedRequest = validateSplitRequest(req.body);

        // Load image
        const imageBuffer = await ImageLoader.loadImage(
            validatedRequest.image_source,
            validatedRequest.image_data
        );

        // Validate image
        const originalMetadata = await ImageLoader.validateImage(imageBuffer);

        // Split image
        const processedChunks = await ImageProcessor.splitImage(imageBuffer, {
            splitType: validatedRequest.split_type,
            splitValue: validatedRequest.split_value,
            overlap: validatedRequest.overlap,
            direction: validatedRequest.direction,
            outputFormat: validatedRequest.output_format,
            quality: validatedRequest.quality,
        });

        // Prepare metadata
        const metadata = {
            original_dimensions: {
                width: originalMetadata.width,
                height: originalMetadata.height,
            },
            total_chunks: processedChunks.length,
            split_type: validatedRequest.split_type,
            direction: validatedRequest.direction,
        };

        // Handle output type
        if (validatedRequest.output_type === OutputType.URL) {
            // Upload to ImgBB
            const uploadResults = await ImgBBService.uploadMultiple(
                processedChunks.map((chunk) => chunk.buffer),
                'chunk'
            );

            const chunks: ImageChunkURL[] = uploadResults.map((result, index) => ({
                index,
                url: result.url,
                width: processedChunks[index].width,
                height: processedChunks[index].height,
                size: result.size,
                expiration: result.expiration,
            }));

            const response: SplitResponseURL = {
                success: true,
                chunks,
                metadata,
            };

            res.status(200).json(response);
        } else {
            // Return binary data
            const chunks: ImageChunkBinary[] = processedChunks.map((chunk, index) => ({
                index,
                data: chunk.buffer.toString('base64'),
                width: chunk.width,
                height: chunk.height,
                size: chunk.size,
                format: chunk.format,
            }));

            const response: SplitResponseBinary = {
                success: true,
                chunks,
                metadata,
            };

            res.status(200).json(response);
        }
    } catch (error) {
        // Handle validation errors from Zod
        if (error instanceof Error && error.name === 'ZodError') {
            next(new AppError(`Validation error: ${error.message}`, 400));
            return;
        }

        // Handle other errors
        if (error instanceof Error) {
            next(new AppError(error.message, 400));
            return;
        }

        next(new AppError('An unexpected error occurred', 500));
    }
};

export const healthCheckController = (
    _req: Request,
    res: Response
): void => {
    res.status(200).json({
        success: true,
        message: 'Image Splitter API is running',
        timestamp: new Date().toISOString(),
    });
};
