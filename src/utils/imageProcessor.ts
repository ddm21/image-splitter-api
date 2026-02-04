import sharp from 'sharp';
import { SplitType, SplitDirection, ImageFormat, ProcessedImage } from '../types';
import { ImageLoader } from './imageLoader';

interface SplitConfig {
    splitType: SplitType;
    splitValue: number;
    overlap: number;
    direction: SplitDirection;
    outputFormat: ImageFormat;
    quality: number;
}

interface ChunkInfo {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class ImageProcessor {
    static async splitImage(
        imageBuffer: Buffer,
        config: SplitConfig
    ): Promise<ProcessedImage[]> {
        // Validate and get image metadata
        const metadata = await ImageLoader.validateImage(imageBuffer);
        const { width, height, format: originalFormat } = metadata;

        // Calculate chunk positions
        const chunks = this.calculateChunks(width, height, config);

        // Process each chunk
        const processedChunks: ProcessedImage[] = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const processedChunk = await this.extractChunk(
                imageBuffer,
                chunk,
                config.outputFormat === ImageFormat.SAME ? originalFormat : config.outputFormat,
                config.quality
            );
            processedChunks.push(processedChunk);
        }

        return processedChunks;
    }

    private static calculateChunks(
        width: number,
        height: number,
        config: SplitConfig
    ): ChunkInfo[] {
        const chunks: ChunkInfo[] = [];
        const isVertical = config.direction === SplitDirection.VERTICAL;
        const totalSize = isVertical ? height : width;
        const fixedSize = isVertical ? width : height;

        if (config.splitType === SplitType.BLOCKS) {
            // Equal blocks splitting
            const numBlocks = config.splitValue;
            const baseChunkSize = Math.floor(totalSize / numBlocks);
            const remainder = totalSize % numBlocks;

            let currentPosition = 0;

            for (let i = 0; i < numBlocks; i++) {
                // Distribute remainder pixels across first chunks
                const chunkSize = baseChunkSize + (i < remainder ? 1 : 0);
                const actualChunkSize = chunkSize + (i < numBlocks - 1 ? config.overlap : 0);

                if (isVertical) {
                    chunks.push({
                        x: 0,
                        y: currentPosition,
                        width: fixedSize,
                        height: Math.min(actualChunkSize, totalSize - currentPosition),
                    });
                } else {
                    chunks.push({
                        x: currentPosition,
                        y: 0,
                        width: Math.min(actualChunkSize, totalSize - currentPosition),
                        height: fixedSize,
                    });
                }

                currentPosition += chunkSize;
            }
        } else {
            // Fixed dimension splitting
            const fixedDimension = config.splitValue;
            let currentPosition = 0;

            while (currentPosition < totalSize) {
                const remainingSize = totalSize - currentPosition;
                const chunkSize = Math.min(fixedDimension, remainingSize);
                const actualChunkSize = currentPosition + chunkSize < totalSize
                    ? chunkSize + config.overlap
                    : chunkSize;

                if (isVertical) {
                    chunks.push({
                        x: 0,
                        y: currentPosition,
                        width: fixedSize,
                        height: Math.min(actualChunkSize, totalSize - currentPosition),
                    });
                } else {
                    chunks.push({
                        x: currentPosition,
                        y: 0,
                        width: Math.min(actualChunkSize, totalSize - currentPosition),
                        height: fixedSize,
                    });
                }

                currentPosition += chunkSize;
            }
        }

        return chunks;
    }

    private static async extractChunk(
        imageBuffer: Buffer,
        chunk: ChunkInfo,
        outputFormat: string,
        quality: number
    ): Promise<ProcessedImage> {
        try {
            let sharpInstance = sharp(imageBuffer).extract({
                left: chunk.x,
                top: chunk.y,
                width: chunk.width,
                height: chunk.height,
            });

            // Apply format conversion
            const format = outputFormat.toLowerCase();
            switch (format) {
                case 'png':
                    sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
                    break;
                case 'jpeg':
                case 'jpg':
                    sharpInstance = sharpInstance.jpeg({ quality });
                    break;
                case 'webp':
                    sharpInstance = sharpInstance.webp({ quality });
                    break;
                default:
                    // Keep original format
                    break;
            }

            const buffer = await sharpInstance.toBuffer();
            const metadata = await sharp(buffer).metadata();

            return {
                buffer,
                width: metadata.width || chunk.width,
                height: metadata.height || chunk.height,
                format: metadata.format || format,
                size: buffer.length,
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to extract chunk: ${error.message}`);
            }
            throw error;
        }
    }
}
