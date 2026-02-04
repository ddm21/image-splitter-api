import { z } from 'zod';
import { ImageSource, SplitType, SplitDirection, OutputType, ImageFormat } from '../types';

export const splitRequestSchema = z.object({
    image_source: z.nativeEnum(ImageSource),
    image_data: z.string().min(1, 'image_data is required'),
    split_type: z.nativeEnum(SplitType),
    split_value: z.number().int().positive('split_value must be a positive integer'),
    overlap: z.number().int().nonnegative('overlap must be non-negative').optional().default(0),
    direction: z.nativeEnum(SplitDirection).optional().default(SplitDirection.VERTICAL),
    output_format: z.nativeEnum(ImageFormat).optional().default(ImageFormat.SAME),
    quality: z.number().int().min(1).max(100, 'quality must be between 1 and 100').optional().default(90),
    output_type: z.nativeEnum(OutputType).optional().default(OutputType.BINARY),
});

export type ValidatedSplitRequest = z.infer<typeof splitRequestSchema>;

export const validateSplitRequest = (data: unknown): ValidatedSplitRequest => {
    return splitRequestSchema.parse(data);
};
