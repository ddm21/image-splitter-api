export enum ImageSource {
    URL = 'url',
    BINARY = 'binary'
}

export enum SplitType {
    BLOCKS = 'blocks',
    FIXED = 'fixed'
}

export enum SplitDirection {
    VERTICAL = 'vertical',
    HORIZONTAL = 'horizontal'
}

export enum OutputType {
    URL = 'url',
    BINARY = 'binary'
}

export enum ImageFormat {
    SAME = 'same',
    PNG = 'png',
    JPEG = 'jpeg',
    JPG = 'jpg',
    WEBP = 'webp'
}

export interface SplitRequest {
    image_source: ImageSource;
    image_data: string; // URL or base64 string
    split_type: SplitType;
    split_value: number; // Number of blocks or fixed dimension in pixels
    overlap?: number; // Overlap in pixels
    direction?: SplitDirection;
    output_format?: ImageFormat;
    quality?: number; // 1-100
    output_type?: OutputType;
}

export interface ImageChunkBinary {
    index: number;
    data: string; // base64
    width: number;
    height: number;
    size: number;
    format: string;
}

export interface ImageChunkURL {
    index: number;
    url: string;
    width: number;
    height: number;
    size: number;
    expiration: string;
}

export interface SplitMetadata {
    original_dimensions: {
        width: number;
        height: number;
    };
    total_chunks: number;
    split_type: SplitType;
    direction: SplitDirection;
}

export interface SplitResponseBinary {
    success: boolean;
    chunks: ImageChunkBinary[];
    metadata: SplitMetadata;
}

export interface SplitResponseURL {
    success: boolean;
    chunks: ImageChunkURL[];
    metadata: SplitMetadata;
}

export interface ImgBBUploadResponse {
    data: {
        id: string;
        title: string;
        url_viewer: string;
        url: string;
        display_url: string;
        width: string;
        height: string;
        size: number;
        time: string;
        expiration: string;
        image: {
            filename: string;
            name: string;
            mime: string;
            extension: string;
            url: string;
        };
        thumb: {
            filename: string;
            name: string;
            mime: string;
            extension: string;
            url: string;
        };
        medium?: {
            filename: string;
            name: string;
            mime: string;
            extension: string;
            url: string;
        };
        delete_url: string;
    };
    success: boolean;
    status: number;
}

export interface ProcessedImage {
    buffer: Buffer;
    width: number;
    height: number;
    format: string;
    size: number;
}
