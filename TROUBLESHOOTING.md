# Troubleshooting Guide

## Common Issues

### 1. 502 Bad Gateway Error

**Symptoms**: App URL returns 502 error

**Causes**:
- Missing required environment variables
- App failed to start
- Port configuration issue

**Solutions**:
1. Check EasyPanel logs for startup errors
2. Verify `API_KEY` environment variable is set
3. Ensure `NODE_ENV=production` is set
4. Check that the app is listening on the correct port

### 2. Health Check Returns HTML Instead of JSON

**Symptoms**: `/health` endpoint returns HTML "Not Found" page

**Causes**:
- App not running
- Reverse proxy routing issue
- Wrong base URL

**Solutions**:
1. Verify app is deployed and running in EasyPanel
2. Check EasyPanel logs for errors
3. Ensure the GitHub repository is up to date
4. Trigger a manual redeploy in EasyPanel

### 3. API Requests Return 401 Unauthorized

**Symptoms**: POST requests to `/api/split` return 401

**Causes**:
- Missing `x-api-key` header
- Incorrect API key

**Solutions**:
1. Include the header: `-H "x-api-key: your-api-key"`
2. Verify the API key matches the one set in EasyPanel environment variables
3. Check that the API key doesn't have extra spaces or quotes

### 4. API Requests Return 400 Bad Request

**Symptoms**: POST requests return validation errors

**Causes**:
- Incorrect request body format
- Missing required fields
- Invalid enum values

**Solutions**:
1. Verify all required fields are present:
   - `image_source`: must be `"url"` or `"binary"`
   - `image_data`: URL string or base64 data
   - `split_type`: must be `"blocks"` or `"fixed"`
   - `split_value`: positive integer
2. Check optional fields use valid enum values:
   - `direction`: `"vertical"` or `"horizontal"`
   - `output_type`: `"url"` or `"binary"`
   - `output_format`: `"same"`, `"png"`, `"jpeg"`, `"jpg"`, or `"webp"`

### 5. URL Output Returns Error

**Symptoms**: Requests with `"output_type": "url"` fail

**Causes**:
- Missing ImgBB API key

**Solutions**:
1. Add `IMGBB_API_KEY` environment variable in EasyPanel
2. Get a free API key from https://api.imgbb.com/
3. Use `"output_type": "binary"` if you don't need URL hosting

## Testing Checklist

After deploying to EasyPanel:

- [ ] Health check works: `curl https://your-app.easypanel.host/health`
- [ ] Returns JSON: `{"status":"ok"}`
- [ ] API endpoint accessible with API key
- [ ] Image splitting works with binary output
- [ ] (Optional) URL output works if ImgBB configured

## EasyPanel Deployment Checklist

- [ ] GitHub repository connected
- [ ] Branch set to `main`
- [ ] Build path set to `/`
- [ ] Environment variables configured:
  - [ ] `NODE_ENV=production`
  - [ ] `API_KEY=<your-secure-key>`
  - [ ] (Optional) `IMGBB_API_KEY=<your-imgbb-key>`
- [ ] App deployed successfully
- [ ] Logs show no errors
- [ ] Health endpoint returns 200 OK

## Viewing Logs in EasyPanel

1. Go to your app in EasyPanel dashboard
2. Click on "Logs" tab
3. Look for:
   - `✓ Configuration validated successfully`
   - `🖼️ Image Splitter API Server`
   - `Status: Running`
   - `Port: <assigned-port>`

If you see errors about missing API_KEY or configuration validation failures, add the missing environment variables and redeploy.
