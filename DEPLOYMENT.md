# Deployment Guide

This document provides instructions for deploying the SDGE Rate Explorer to production.

## Prerequisites

- Node.js 18+ and npm
- Git

## Production Build

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (Optional)

Copy the example environment file and customize as needed:

```bash
cp .env.example .env
```

Available variables:
- `VITE_BASE_PATH` - Base path for the application (default: `/sdge-rate-explorer/`)
- `VITE_DATA_URL` - URL for the rates JSON file (default: `/rates.json`)
- `VITE_DEV_MODE` - Enable development features (default: `false`)

### 3. Build for Production

```bash
npm run build
```

This command:
- Runs TypeScript compiler (`tsc -b`)
- Builds optimized production bundle with Vite
- Outputs to `dist/` directory

### 4. Verify Build

Check the build output:

```bash
npm run preview
```

Then open http://localhost:4173 in your browser.

## Deployment Options

### GitHub Pages (Current Setup)

The repository is configured to deploy to GitHub Pages automatically.

**Automatic Deployment:**

```bash
npm run deploy
```

This command:
1. Runs `npm run build` (via `predeploy` script)
2. Deploys the `dist/` folder to the `gh-pages` branch
3. GitHub Pages serves the content at https://joelmlevin.github.io/sdge-rate-explorer/

**Manual Steps:**
1. Ensure your `package.json` has the correct `homepage` URL
2. Run `npm run deploy`
3. Wait a few minutes for GitHub Pages to update
4. Visit your site

### Custom Domain

If deploying to a custom domain:

1. Update `.env` to set `VITE_BASE_PATH=/`
2. Configure your DNS to point to your hosting provider
3. Follow your hosting provider's deployment instructions

### Netlify

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Set environment variables in Netlify dashboard
4. Deploy

### Vercel

1. Import your GitHub repository to Vercel
2. Configure project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Static Hosting (AWS S3, Cloudflare Pages, etc.)

1. Build the project: `npm run build`
2. Upload the contents of the `dist/` folder to your hosting service
3. Configure the service to serve `index.html` for all routes (SPA routing)
4. Ensure `rates.json` is accessible at the root or configured path

## Important Files

- **`dist/index.html`** - Main HTML file
- **`dist/rates.json`** - Rate data (6.8 MB, optimized)
- **`dist/assets/`** - JavaScript and CSS bundles

## Production Checklist

Before deploying to production:

- [x] Remove all debug `console.log` statements
- [x] Update `package.json` metadata (name, version, description)
- [x] Update `index.html` with proper title and meta tags
- [x] Verify all linting passes: `npm run lint`
- [x] Verify build succeeds: `npm run build`
- [x] Test production build locally: `npm run preview`
- [x] Verify Error Boundary works correctly
- [x] Check bundle size is reasonable
- [x] Run security scan (CodeQL)
- [ ] Test on mobile devices
- [ ] Test accessibility features
- [ ] Verify all routes work correctly
- [ ] Test with different data files (if applicable)

## Bundle Size

Current production bundle (gzipped):
- **HTML:** ~0.65 KB
- **CSS:** ~2.37 KB
- **JavaScript:** ~91 KB
- **Data (rates.json):** ~6.8 MB

Total: ~7 MB (mostly data)

## Performance Optimization

The application includes several optimizations:
- Code splitting with Vite
- Lazy loading of routes
- In-memory caching of rate data
- Optimized JSON format (82% smaller than original CSV)
- Production builds are minified and tree-shaken

## Troubleshooting

### Build Fails

1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf dist && rm -rf .vite`
3. Check Node version: `node --version` (should be 18+)

### Routes Not Working After Deploy

If using a static host, ensure it's configured for SPA routing:
- All routes should serve `index.html`
- Some hosts require a `_redirects` or `vercel.json` configuration

### Rate Data Not Loading

1. Check browser console for errors
2. Verify `rates.json` is in the correct location
3. Check CORS settings if loading from different domain
4. Verify the file size (should be ~6.8 MB)

## Monitoring

After deployment, monitor:
- Page load time (should be < 2 seconds)
- JavaScript errors in browser console
- User feedback on data accuracy
- Analytics (if implemented)

## Rollback

If issues arise after deployment:

**GitHub Pages:**
```bash
git checkout <previous-commit>
npm run deploy
```

**Other Platforms:**
Most hosting providers support rollback to previous deployments through their dashboard.

## Security

- All rate data is public information
- No authentication required
- No user data collected
- HTTPS enabled by default on GitHub Pages
- Regular dependency updates recommended: `npm audit`

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: Joel Levin
- Repository: https://github.com/joelmlevin/sdge-rate-explorer
