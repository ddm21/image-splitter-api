# Image Splitter API

A powerful backend API for splitting images into multiple chunks with flexible configuration options. Supports both URL and binary inputs/outputs with optional ImgBB hosting integration.

## Features

- ✅ **Flexible Input**: Accept images via URL or base64 binary data
- ✅ **Multiple Split Types**: 
  - Block-based splitting (equal chunks)
  - Fixed dimension splitting
- ✅ **Overlap Support**: Configure pixel overlap between chunks
- ✅ **Direction Control**: Vertical or horizontal splitting
- ✅ **Format Conversion**: PNG, JPEG, JPG, WebP support
- ✅ **Quality Control**: Adjustable quality (1-100)
- ✅ **Flexible Output**: Binary (base64) or URL (via ImgBB)
- ✅ **Docker Ready**: Easy deployment with Docker
- ✅ **Rate Limiting**: Built-in API protection
- ✅ **Error Handling**: Comprehensive error messages

## Quick Start

### Local Development

1. **Clone and install dependencies**
```bash
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Docker Deployment

1. **Build Docker image**
```bash
docker build -t image-splitter-api .
```

2. **Run container**
```bash
docker run -p 3000:3000 --env-file .env image-splitter-api
```

## API Documentation

### Endpoints

#### Health Check
```
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Image Splitter API is running",
  "timestamp": "2026-02-04T09:30:00.000Z"
}
```

#### Split Image
```
POST /api/split
```

**Request Body:**
```json
{
  "image_source": "url",
  "image_data": "https://example.com/image.jpg",
  "split_type": "blocks",
  "split_value": 5,
  "overlap": 10,
  "direction": "vertical",
  "output_format": "png",
  "quality": 90,
  "output_type": "url"
}
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `image_source` | `"url"` \| `"binary"` | Yes | - | Source type of the image |
| `image_data` | `string` | Yes | - | URL or base64 encoded image |
| `split_type` | `"blocks"` \| `"fixed"` | Yes | - | Splitting method |
| `split_value` | `number` | Yes | - | Number of blocks or fixed dimension in pixels |
| `overlap` | `number` | No | `0` | Overlap in pixels between chunks |
| `direction` | `"vertical"` \| `"horizontal"` | No | `"vertical"` | Split direction |
| `output_format` | `"same"` \| `"png"` \| `"jpeg"` \| `"jpg"` \| `"webp"` | No | `"same"` | Output image format |
| `quality` | `number` (1-100) | No | `90` | Output image quality |
| `output_type` | `"url"` \| `"binary"` | No | `"binary"` | Output format |

**Response (URL output):**
```json
{
  "success": true,
  "chunks": [
    {
      "index": 0,
      "url": "https://i.ibb.co/xxx/chunk-0.png",
      "width": 1000,
      "height": 600,
      "size": 45678,
      "expiration": "0"
    }
  ],
  "metadata": {
    "original_dimensions": { "width": 1000, "height": 3000 },
    "total_chunks": 5,
    "split_type": "blocks",
    "direction": "vertical"
  }
}
```

**Response (Binary output):**
```json
{
  "success": true,
  "chunks": [
    {
      "index": 0,
      "data": "base64_encoded_image_data...",
      "width": 1000,
      "height": 600,
      "size": 45678,
      "format": "png"
    }
  ],
  "metadata": {
    "original_dimensions": { "width": 1000, "height": 3000 },
    "total_chunks": 5,
    "split_type": "blocks",
    "direction": "vertical"
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DEFAULT_SPLIT_DIRECTION` | Default split direction | `vertical` |
| `DEFAULT_SPLIT_BLOCKS` | Default number of blocks | `4` |
| `DEFAULT_OUTPUT_FORMAT` | Default output format | `same` |
| `DEFAULT_QUALITY` | Default quality | `90` |
| `DEFAULT_OVERLAP` | Default overlap | `0` |
| `IMGBB_API_KEY` | ImgBB API key (required for URL output) | - |
| `IMGBB_EXPIRATION` | ImgBB expiration in seconds (0 = never) | `0` |
| `MAX_FILE_SIZE_MB` | Maximum file size | `32` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` |

## Examples

### Example 1: Split image into 4 equal blocks
```bash
curl -X POST http://localhost:3000/api/split \
  -H "Content-Type: application/json" \
  -d '{
    "image_source": "url",
    "image_data": "https://example.com/image.jpg",
    "split_type": "blocks",
    "split_value": 4,
    "output_type": "binary"
  }'
```

### Example 2: Split with fixed 3000px chunks and 50px overlap
```bash
curl -X POST http://localhost:3000/api/split \
  -H "Content-Type: application/json" \
  -d '{
    "image_source": "url",
    "image_data": "https://example.com/image.jpg",
    "split_type": "fixed",
    "split_value": 3000,
    "overlap": 50,
    "output_type": "url"
  }'
```

### Example 3: Horizontal split with format conversion
```bash
curl -X POST http://localhost:3000/api/split \
  -H "Content-Type: application/json" \
  -d '{
    "image_source": "binary",
    "image_data": "data:image/png;base64,iVBORw0KG...",
    "split_type": "blocks",
    "split_value": 3,
    "direction": "horizontal",
    "output_format": "webp",
    "quality": 85,
    "output_type": "binary"
  }'
```

## Deployment

### Cloud Run (Google Cloud)

1. Build and push to Container Registry:
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/image-splitter-api
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy image-splitter-api \
  --image gcr.io/YOUR_PROJECT_ID/image-splitter-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars IMGBB_API_KEY=your_key_here
```

### Custom Server

1. Build the application:
```bash
npm run build
```

2. Start with PM2:
```bash
pm2 start dist/index.js --name image-splitter-api
```

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

Common error codes:
- `400` - Bad request (validation errors, invalid image)
- `429` - Too many requests (rate limit exceeded)
- `500` - Internal server error

## License

ISC
