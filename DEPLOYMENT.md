# EasyPanel Deployment Guide

## Configuration

### Source Settings
- **Source Type**: GitHub
- **Owner**: ddm21
- **Repository**: image-splitter-api
- **Branch**: main
- **Build Path**: `/` ✅ (This is correct)

### Required Environment Variables

You **must** configure these environment variables in EasyPanel for the app to start:

#### Production Required
```bash
NODE_ENV=production
API_KEY=your-secure-api-key-here
```

#### Optional (with defaults)
```bash
PORT=3000
MAX_FILE_SIZE_MB=32
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=*
DEFAULT_SPLIT_DIRECTION=vertical
DEFAULT_SPLIT_BLOCKS=4
DEFAULT_OUTPUT_FORMAT=same
DEFAULT_QUALITY=90
DEFAULT_OVERLAP=0
DEFAULT_IMAGE_SOURCE=url
DEFAULT_OUTPUT_TYPE=binary
LOG_LEVEL=info
```

#### If using ImgBB for URL output
```bash
IMGBB_API_KEY=your_imgbb_api_key
IMGBB_EXPIRATION=0
```

## Common Issues

### 502 Bad Gateway
**Cause**: Missing `API_KEY` environment variable in production.

**Solution**: Add `API_KEY` environment variable in EasyPanel settings.

### Port Issues
EasyPanel will automatically assign a port via the `PORT` environment variable. The Dockerfile is already configured to handle this.

## Testing After Deployment

Once deployed, test these endpoints:

1. **Health Check**:
   ```bash
   curl https://your-app.easypanel.host/health
   ```
   Expected response: `{"status":"ok"}`

2. **API Test** (with your API key):
   ```bash
   curl -X POST https://your-app.easypanel.host/api/split \
     -H "x-api-key: your-api-key" \
     -H "Content-Type: application/json" \
     -d '{
       "imageUrl": "https://example.com/image.jpg",
       "splitBlocks": 4,
       "direction": "vertical"
     }'
   ```

## Deployment Steps

1. ✅ Configure GitHub source (already done)
2. ⚠️ Add environment variables (especially `API_KEY`)
3. Save and deploy
4. Check logs for any startup errors
5. Test `/health` endpoint
