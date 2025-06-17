# GitHub Actions Setup Guide

This guide explains how to set up GitHub Actions for automated CI/CD and NPM publishing.

## 📋 Prerequisites

1. **NPM Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **NPM Access Token**: Generate a token for publishing
3. **GitHub Repository**: Admin access to configure secrets

## 🔐 Setting Up GitHub Secrets

### 1. Generate NPM Token

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Click your profile icon → **Access Tokens**
3. Click **Generate New Token** → **Classic Token**
4. Select type: **Automation**
5. Name it: `github-actions-publish`
6. Copy the token (starts with `npm_`)

### 2. Add Token to GitHub

1. Go to your repository: https://github.com/DrBalls/retro-n8n-mcp
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - Name: `NPM_TOKEN`
   - Value: Your NPM token (npm_...)

## 🚀 Using the Workflows

### Continuous Integration (CI)

The CI workflow runs automatically on:
- Every push to `master` or `production`
- Every pull request
- Manual trigger via GitHub Actions tab

**What it does:**
- ✅ Runs tests on Node.js 18 and 20
- ✅ Type checking and linting
- ✅ Builds the project
- ✅ Security scanning
- ✅ Validates production branch cleanliness

### Publishing to NPM

Two ways to publish:

#### Option 1: Tag-based Release (Recommended)

```bash
# On master branch, after merging to production
git checkout production
git pull origin production

# Create and push a version tag
git tag v1.0.1
git push origin v1.0.1
```

The workflow will automatically:
1. Run all tests
2. Build the project
3. Publish to NPM
4. Create a GitHub release with changelog

#### Option 2: Manual Release

1. Go to **Actions** tab in GitHub
2. Select **Publish to NPM** workflow
3. Click **Run workflow**
4. Enter version (e.g., `1.0.1`)
5. Select `production` branch
6. Click **Run workflow**

## 📊 Workflow Status Badges

Add these badges to your README:

```markdown
![CI](https://github.com/DrBalls/retro-n8n-mcp/workflows/CI/badge.svg)
![npm version](https://badge.fury.io/js/@retro%2Fn8n-mcp-server.svg)
```

## 🔧 Workflow Configuration

### Environment Variables

The workflows use these environment variables:
- `NODE_AUTH_TOKEN`: NPM authentication (from secrets)
- `GITHUB_TOKEN`: Automatically provided by GitHub

### Customization Options

Edit `.github/workflows/publish.yml` to:
- Change Node.js versions
- Add pre-release support
- Customize changelog generation
- Add Slack/Discord notifications

## 📝 Release Process

### Recommended Release Flow

1. **Development on master**
   ```bash
   git checkout master
   # Make changes, commit, test
   git push origin master
   ```

2. **Prepare production**
   ```bash
   git checkout production
   git merge master
   ./scripts/prepare-production.sh  # If needed
   git add -A
   git commit -m "chore: prepare production build"
   git push origin production
   ```

3. **Create release**
   ```bash
   # Decide version number (follow semver)
   # Patch: 1.0.0 → 1.0.1 (bug fixes)
   # Minor: 1.0.0 → 1.1.0 (new features)
   # Major: 1.0.0 → 2.0.0 (breaking changes)
   
   git tag v1.0.1
   git push origin v1.0.1
   ```

4. **Monitor release**
   - Check Actions tab for workflow progress
   - Verify NPM package: https://www.npmjs.com/package/@retro/n8n-mcp-server
   - Check GitHub release was created

## 🚨 Troubleshooting

### NPM Publishing Fails

1. **Authentication Error**
   - Verify NPM_TOKEN secret is set correctly
   - Ensure token hasn't expired
   - Check token has publish permissions

2. **Version Conflict**
   - Version already exists on NPM
   - Use a new version number

3. **Build Errors**
   - Check CI workflow passed on production branch
   - Ensure `npm run build` works locally

### Workflow Not Triggering

1. **Tag Format**
   - Must match pattern: `v*.*.*`
   - Examples: `v1.0.0`, `v2.1.3`, `v0.1.0-beta`

2. **Branch Protection**
   - Ensure workflows are allowed on production branch
   - Check branch protection rules

## 📈 Best Practices

1. **Always test on master first** - CI must pass before merging
2. **Use semantic versioning** - Major.Minor.Patch
3. **Write good commit messages** - They appear in changelog
4. **Tag from production branch** - Ensures clean releases
5. **Monitor the Actions tab** - Watch for failures
6. **Keep NPM token secure** - Rotate periodically

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [Workflow Status](https://github.com/DrBalls/retro-n8n-mcp/actions)