# Publishing Guide for @retro/n8n-mcp-server

## Current Status

The package is ready to publish but GitHub Actions are not triggering because:
1. The repository appears to be private or has Actions disabled
2. You're not logged in to NPM locally

## Option 1: Fix GitHub Actions (Recommended)

1. **Make repository public** (if it's private):
   - Go to https://github.com/DrBalls/retro-n8n-mcp/settings
   - Scroll to "Danger Zone"
   - Click "Change visibility" → "Make public"

2. **Enable GitHub Actions**:
   - Go to https://github.com/DrBalls/retro-n8n-mcp/settings/actions
   - Select "Allow all actions and reusable workflows"
   - Save

3. **Verify NPM_TOKEN**:
   - Go to https://github.com/DrBalls/retro-n8n-mcp/settings/secrets/actions
   - Ensure NPM_TOKEN is set with a valid token

4. **Trigger workflow**:
   ```bash
   git tag -f v0.1.3
   git push origin v0.1.3 --force
   ```

## Option 2: Publish Locally

1. **Login to NPM**:
   ```bash
   npm login
   # Enter your username, password, and email
   # This will save credentials locally
   ```

2. **Publish the package**:
   ```bash
   cd /home/wes/retro-n8n-mcp
   npm publish --access public
   ```

3. **Verify publication**:
   ```bash
   npm view @retro/n8n-mcp-server
   ```

## Option 3: Use NPM Token Directly

1. **Get an NPM token**:
   - Login to npmjs.com
   - Go to Access Tokens
   - Generate new token (Publish)

2. **Publish with token**:
   ```bash
   cd /home/wes/retro-n8n-mcp
   NPM_TOKEN=your_token_here npm publish --access public
   ```

## Quick Commands

```bash
# Check if package exists
npm view @retro/n8n-mcp-server version 2>/dev/null || echo "Not published"

# Dry run to test
npm publish --dry-run

# Force publish (if version exists)
npm publish --access public --force
```

## Troubleshooting

- **E403**: Package name might be taken or you lack permissions
- **E404**: Not logged in or wrong registry
- **E422**: Version already exists (bump version in package.json)

## Success Checklist

- [ ] Package builds without errors (`npm run build`)
- [ ] Dry run succeeds (`npm publish --dry-run`)
- [ ] Either GitHub Actions enabled OR logged in to NPM
- [ ] NPM token has publish permissions
- [ ] Package name is available

Current version ready to publish: **0.1.3**