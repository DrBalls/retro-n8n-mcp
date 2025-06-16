# Branch Strategy

## Branches

### `master` (Development)
The main development branch containing:
- All source code and tests
- Development tools and configurations
- Task management system (.taskmaster)
- IDE configurations (.roo, .cursor, etc.)
- Comprehensive documentation
- Test coverage reports
- Development scripts

### `production` (Clean Build)
Production-ready branch containing only:
- Compiled distribution (`dist/`)
- Source files (`src/`)
- Production documentation (`docs/`, `examples/`)
- Essential config files (`.env.example`, `package.json`)
- License and README

## Workflow

1. **Development**: All work happens on `master`
2. **Testing**: Run full test suite on `master`
3. **Production Build**: 
   - Checkout `production` branch
   - Merge from `master`
   - Run cleanup script (removed after use)
   - Commit clean build
4. **Deployment**: Deploy from `production` branch only

## Switching Between Branches

```bash
# For development work
git checkout master

# For production deployment
git checkout production

# Update production from master
git checkout production
git merge master
# Then manually clean up or use a cleanup script
```

## Important Notes

- Never develop directly on `production` branch
- Always test thoroughly on `master` before merging
- The `production` branch is optimized for npm publishing and deployment
- Keep sensitive development tools and docs only in `master`