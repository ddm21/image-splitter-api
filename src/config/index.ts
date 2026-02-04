import dotenv from 'dotenv';
import { SplitDirection, ImageSource, OutputType, ImageFormat } from '../types';

dotenv.config();

export const config = {
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
    },

    defaults: {
        splitDirection: (process.env.DEFAULT_SPLIT_DIRECTION as SplitDirection) || SplitDirection.VERTICAL,
        splitBlocks: parseInt(process.env.DEFAULT_SPLIT_BLOCKS || '4', 10),
        outputFormat: (process.env.DEFAULT_OUTPUT_FORMAT as ImageFormat) || ImageFormat.SAME,
        quality: parseInt(process.env.DEFAULT_QUALITY || '90', 10),
        overlap: parseInt(process.env.DEFAULT_OVERLAP || '0', 10),
        imageSource: (process.env.DEFAULT_IMAGE_SOURCE as ImageSource) || ImageSource.URL,
        outputType: (process.env.DEFAULT_OUTPUT_TYPE as OutputType) || OutputType.BINARY,
    },

    imgbb: {
        apiKey: process.env.IMGBB_API_KEY || '',
        expiration: parseInt(process.env.IMGBB_EXPIRATION || '0', 10),
    },

    security: {
        apiKey: process.env.API_KEY || '',
        maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '32', 10),
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        allowedOrigins: process.env.ALLOWED_ORIGINS || '*',
    },

    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },
};

export const validateConfig = (): void => {
    const errors: string[] = [];

    if (config.server.port < 1 || config.server.port > 65535) {
        errors.push('PORT must be between 1 and 65535');
    }

    if (config.defaults.quality < 1 || config.defaults.quality > 100) {
        errors.push('DEFAULT_QUALITY must be between 1 and 100');
    }

    if (config.defaults.overlap < 0) {
        errors.push('DEFAULT_OVERLAP must be non-negative');
    }

    if (config.security.maxFileSizeMB < 1) {
        errors.push('MAX_FILE_SIZE_MB must be at least 1');
    }

    if (!config.security.apiKey && config.server.nodeEnv === 'production') {
        errors.push('API_KEY is required in production environment');
    }

    if (errors.length > 0) {
        throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
};
