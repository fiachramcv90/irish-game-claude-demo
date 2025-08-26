# Deployment Guide

This application is automatically deployed to Vercel using GitHub Actions.

## Deployment Setup

### Prerequisites

- Vercel account connected to your GitHub
- Vercel CLI installed (optional for manual deployments)

### Required GitHub Secrets

Add the following secrets to your GitHub repository settings:

1. **VERCEL_TOKEN**: Your Vercel personal access token
   - Go to [Vercel Settings > Tokens](https://vercel.com/account/tokens)
   - Create a new token and copy it

2. **VERCEL_ORG_ID**: Your Vercel organization/team ID
   - Found in your Vercel dashboard or `.vercel/project.json` after linking

3. **VERCEL_PROJECT_ID**: Your project ID
   - Found in your Vercel dashboard or `.vercel/project.json` after linking

### Automatic Deployments

The CI/CD pipeline automatically deploys:

- **Preview Deployments**: Created for all pull requests
- **Production Deployments**: Created when code is merged to `main` branch

### Manual Deployment

To deploy manually using Vercel CLI:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Build Configuration

- **Framework**: Vite (React + TypeScript)
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Install Command**: `npm ci`

### Environment Variables

No environment variables are currently required for the application to run.

### Vercel Configuration

The `vercel.json` file includes:

- Static file caching for assets (1 year)
- SPA routing fallback to index.html
- Security headers (XSS protection, content sniffing protection)
- Production environment variables

### Deployment Status

- ✅ Preview deployments on pull requests
- ✅ Production deployments on main branch merges
- ✅ Security headers configured
- ✅ Asset optimization and caching
- ✅ SPA routing support

### URLs

- **Production**: Will be provided after first deployment
- **Preview**: Generated for each PR (available in PR comments)

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all tests pass locally first
2. **Missing Secrets**: Ensure all required GitHub secrets are configured
3. **Permission Errors**: Verify Vercel token has correct permissions

### Getting Help

If deployment fails:

1. Check the GitHub Actions logs
2. Verify all secrets are correctly configured
3. Test the build locally with `npm run build`
4. Contact team lead for Vercel access issues
