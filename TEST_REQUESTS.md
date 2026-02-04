## Test API Requests

> **Note:** All API requests require the `x-api-key` header with your API key (set in `.env` file as `API_KEY`).

### Test 1: Health Check
```bash
curl http://localhost:3000/health \
  -H "x-api-key: your-secret-api-key-here"
```

### Test 2: Split Image - Binary Output (Blocks)
```bash
curl -X POST http://localhost:3000/api/split \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-here" \
  -d '{
    "image_source": "url",
    "image_data": "https://picsum.photos/1200/3000",
    "split_type": "blocks",
    "split_value": 4,
    "output_type": "binary"
  }'
```

### Test 3: Split Image - Fixed Dimension with Overlap
```bash
curl -X POST http://localhost:3000/api/split \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-here" \
  -d '{
    "image_source": "url",
    "image_data": "https://picsum.photos/800/2400",
    "split_type": "fixed",
    "split_value": 600,
    "overlap": 50,
    "direction": "vertical",
    "output_format": "png",
    "quality": 85,
    "output_type": "binary"
  }'
```

### Test 4: Horizontal Split
```bash
curl -X POST http://localhost:3000/api/split \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-here" \
  -d '{
    "image_source": "url",
    "image_data": "https://picsum.photos/3000/800",
    "split_type": "blocks",
    "split_value": 3,
    "direction": "horizontal",
    "output_type": "binary"
  }'
```

### Test 5: URL Output (requires ImgBB API key)
```bash
curl -X POST http://localhost:3000/api/split \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-here" \
  -d '{
    "image_source": "url",
    "image_data": "https://picsum.photos/1000/2000",
    "split_type": "blocks",
    "split_value": 2,
    "output_type": "url"
  }'
```

### Test 6: Binary Input
```bash
# First, convert an image to base64
# Then use it in the request:
curl -X POST http://localhost:3000/api/split \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-here" \
  -d '{
    "image_source": "binary",
    "image_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
    "split_type": "blocks",
    "split_value": 2,
    "output_type": "binary"
  }'
```

## Expected Responses

### Success Response (Binary):
```json
{
  "success": true,
  "chunks": [
    {
      "index": 0,
      "data": "base64_encoded_image...",
      "width": 1200,
      "height": 750,
      "size": 45678,
      "format": "jpeg"
    }
  ],
  "metadata": {
    "original_dimensions": { "width": 1200, "height": 3000 },
    "total_chunks": 4,
    "split_type": "blocks",
    "direction": "vertical"
  }
}
```

### Success Response (URL):
```json
{
  "success": true,
  "chunks": [
    {
      "index": 0,
      "url": "https://i.ibb.co/xxx/chunk-0.png",
      "width": 1000,
      "height": 1000,
      "size": 45678,
      "expiration": "0"
    }
  ],
  "metadata": {
    "original_dimensions": { "width": 1000, "height": 2000 },
    "total_chunks": 2,
    "split_type": "blocks",
    "direction": "vertical"
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "message": "Validation error: ..."
  }
}
```
