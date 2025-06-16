# Production Deployment Guide

This guide explains how to deploy the n8n MCP Server to production environments.

## Branch Strategy

- **`master` branch**: Development version with all tools, tests, and documentation
- **`production` branch**: Clean production build with only essential files

## Deployment Options

### 1. NPM Package Deployment

```bash
# From production branch
npm version patch  # or minor/major
npm publish
```

### 2. Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY dist/ ./dist/
COPY docs/ ./docs/
COPY examples/ ./examples/
COPY LICENSE README.md ./

# Set environment
ENV NODE_ENV=production

# Run the server
CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t n8n-mcp-server:latest .
docker run -d \
  -e N8N_API_URL=https://your-n8n.com \
  -e N8N_API_KEY=your-key \
  n8n-mcp-server:latest
```

### 3. Direct Server Deployment

For deployment to a VPS or cloud server:

```bash
# Clone production branch
git clone -b production https://github.com/your-repo/n8n-mcp-server.git
cd n8n-mcp-server

# Install production dependencies only
npm ci --only=production

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run with PM2 (recommended)
npm install -g pm2
pm2 start dist/index.js --name n8n-mcp-server
pm2 save
pm2 startup
```

### 4. Serverless Deployment

For AWS Lambda or similar:

1. Create a wrapper for the MCP server
2. Package with dependencies
3. Deploy using serverless framework

## Environment Variables

Required environment variables for all deployment methods:

```env
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key-here

# Optional
N8N_API_TIMEOUT=30000
N8N_MAX_REQUESTS_PER_SECOND=10
N8N_MAX_CONCURRENT_REQUESTS=5
```

## Security Considerations

1. **API Key Storage**: Use environment variables or secrets management
2. **Network Security**: Restrict access to trusted IPs if possible
3. **Rate Limiting**: Configure based on your n8n instance capacity
4. **Monitoring**: Set up logging and monitoring for production use

## Monitoring

### Health Check Endpoint

The server includes a health check tool that can be monitored:

```bash
# Check server health
curl http://localhost:3000/health
```

### Logging

Production logs are written to stdout/stderr. Configure your deployment platform to capture and store these logs.

### Metrics

Key metrics to monitor:
- API request rate
- Error rate
- Response times
- Memory usage
- CPU usage

## Updating Production

To update the production deployment:

```bash
# Switch to master branch for development
git checkout master
git pull origin master

# Make changes, test thoroughly
npm test

# Merge to production
git checkout production
git merge master

# Run production preparation
./scripts/prepare-production.sh

# Commit and push
git add -A
git commit -m "chore: update production build"
git push origin production

# Deploy using your chosen method
```

## Rollback Procedure

If issues occur in production:

```bash
# Find the last working commit
git log --oneline -10

# Revert to previous version
git checkout <commit-hash>

# Or use git revert for specific commits
git revert <problematic-commit>

# Redeploy
```

## Performance Optimization

1. **Enable Caching**: Set cache environment variables
2. **Connection Pooling**: Built-in for API requests
3. **Resource Limits**: Configure based on server capacity
4. **Load Balancing**: Run multiple instances if needed

## Troubleshooting

### Common Issues

1. **Connection Errors**: Verify N8N_API_URL is accessible
2. **Authentication Failures**: Check API key permissions
3. **Performance Issues**: Monitor rate limits and adjust
4. **Memory Leaks**: Restart periodically or investigate with profiling

### Debug Mode

For production debugging without exposing development tools:

```bash
NODE_ENV=production DEBUG=n8n-mcp:* node dist/index.js
```

## Support

For production support:
- Check the documentation in `/docs`
- Review examples in `/examples`
- File issues on GitHub (use master branch for reproduction)