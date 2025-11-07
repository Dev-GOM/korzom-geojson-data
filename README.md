# GitHub Repository Setup Guide

## 1. Create New Repository

### Via GitHub Web UI

1. Go to https://github.com/new
2. Fill in repository details:
   - **Repository name**: `korzom-geojson-data`
   - **Description**: `GeoJSON boundary data for KORZOM game (Korea administrative divisions)`
   - **Visibility**: ✅ Public (important for raw URL access)
   - **Initialize**: ❌ Do NOT add README, .gitignore, or license yet

3. Click "Create repository"

### Via GitHub CLI (Alternative)

```bash
gh repo create korzom-geojson-data --public --description "GeoJSON boundary data for KORZOM game"
```

## 2. Initialize and Push Data

```bash
# Navigate to data/geojson directory
cd data/geojson

# Initialize git repository
git init

# Add README
cp GITHUB_SETUP.md README.md

# Create initial structure
mkdir -p 2025

# Add all files
git add .

# Initial commit
git commit -m "feat: Add Korea administrative boundaries (ver20250401)

- Province level (17 features, 5.7 MB)
- City/District level (252 features, 12 MB)
- Township level (3,554 features, 34 MB)
- Chuncheon city boundary (1 feature, 86 KB)

Source: https://github.com/vuski/admdongkor ver20250401
Last updated: March 10, 2025"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/korzom-geojson-data.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 3. Verify Raw URLs

After pushing, verify the following URLs work:

### Province Level
```
https://raw.githubusercontent.com/YOUR_USERNAME/korzom-geojson-data/main/2025/korea-provinces-2025.json
```

### City Level
```
https://raw.githubusercontent.com/YOUR_USERNAME/korzom-geojson-data/main/2025/korea-cities-2025.json
```

### Township Level
```
https://raw.githubusercontent.com/YOUR_USERNAME/korzom-geojson-data/main/2025/korea-townships-2025.json
```

### Chuncheon Boundary
```
https://raw.githubusercontent.com/YOUR_USERNAME/korzom-geojson-data/main/2025/chuncheon-boundary.json
```

Test in browser or curl:
```bash
curl -I https://raw.githubusercontent.com/YOUR_USERNAME/korzom-geojson-data/main/2025/korea-provinces-2025.json
```

Should return `200 OK` with `Content-Type: text/plain` or `application/json`

## 4. Update Main Project

After creating the repository, update the main korzom project:

### A. Add environment variable

**`.env.local`** (for development):
```env
NEXT_PUBLIC_GEOJSON_BASE_URL=https://raw.githubusercontent.com/YOUR_USERNAME/korzom-geojson-data/main/2025
```

**`.env.example`** (template):
```env
# GeoJSON Data Repository
NEXT_PUBLIC_GEOJSON_BASE_URL=https://raw.githubusercontent.com/YOUR_USERNAME/korzom-geojson-data/main/2025
```

### B. Update client code

The API utility (`client/lib/api/geojson.ts`) will automatically use this URL.

### C. Remove local files

Remove large files from `client/public/` (keep in data/geojson for backup):
```bash
# In main korzom project
cd client/public
rm korea-cities-2025.json
rm korea-townships-2025.json

# Keep only essential small files for fallback
# - korea-provinces-2025.json (5.7 MB - manageable)
# - chuncheon-boundary.json (86 KB - tiny)
```

### D. Update .gitignore

```bash
echo "# Large GeoJSON files (hosted externally)" >> .gitignore
echo "client/public/korea-cities-2025.json" >> .gitignore
echo "client/public/korea-townships-2025.json" >> .gitignore
```

## 5. Repository Settings (Optional)

### Enable GitHub Pages
If you want a nice landing page:
1. Go to repository Settings → Pages
2. Source: Deploy from branch
3. Branch: main, folder: / (root)
4. Add index.html with data catalog

### Add Topics
Add relevant topics to help discoverability:
- `geojson`
- `korea`
- `administrative-boundaries`
- `gis-data`
- `map-data`

### Add License
Recommended: MIT or ODC-By (Open Data Commons Attribution)
```bash
# In data/geojson directory
echo "MIT License" > LICENSE
git add LICENSE
git commit -m "docs: Add MIT license"
git push
```

## 6. Testing in Development

Update your local `.env.local`:
```env
NEXT_PUBLIC_GEOJSON_BASE_URL=https://raw.githubusercontent.com/YOUR_USERNAME/korzom-geojson-data/main/2025
```

Restart Next.js dev server:
```bash
pnpm stop:client
pnpm start:client
```

Visit http://localhost:58031/character/create and verify map loads correctly.

## 7. Production Deployment

For production (Vercel/Netlify), add environment variable:

**Vercel**:
```bash
vercel env add NEXT_PUBLIC_GEOJSON_BASE_URL
# Enter value: https://raw.githubusercontent.com/YOUR_USERNAME/korzom-geojson-data/main/2025
```

**Netlify**:
Site settings → Environment variables → Add variable
- Key: `NEXT_PUBLIC_GEOJSON_BASE_URL`
- Value: `https://raw.githubusercontent.com/YOUR_USERNAME/korzom-geojson-data/main/2025`

## Benefits

✅ **Smaller main repository**: 52 MB removed from korzom repo
✅ **Free CDN**: GitHub raw content is CDN-cached globally
✅ **Independent versioning**: Update map data without touching main code
✅ **Easy updates**: Push new GeoJSON → instantly available
✅ **No bandwidth costs**: GitHub provides hosting
✅ **Multiple versions**: Support /2025, /2026 folders for data updates

## Troubleshooting

### 403 Forbidden
- Repository must be public
- Check URL is correct (raw.githubusercontent.com, not github.com)

### CORS Issues
- GitHub raw URLs support CORS by default
- If issues persist, add proxy in Next.js API routes

### Slow Loading
- GitHub CDN cache takes ~5 minutes for first access
- After that, it's very fast globally

### Cache Issues
- GitHub caches for 5 minutes
- To force refresh: append `?t={timestamp}` to URL
- Or use commit hash in URL: `/main/` → `/commit-hash/`

## Maintenance

### Updating Data

```bash
# In data/geojson directory
cd 2025

# Replace files with new data
cp /path/to/new/data/*.json .

# Commit and push
git add .
git commit -m "feat: Update to ver20250501"
git push
```

Changes appear immediately (after CDN cache expires in 5 minutes).

### Adding New Versions

```bash
# Create new version folder
mkdir 2026
cp 2025/*.json 2026/

# Update and commit
git add 2026
git commit -m "feat: Add 2026 administrative boundaries"
git push
```

Update main project's NEXT_PUBLIC_GEOJSON_BASE_URL to point to /2026.

---

**Created**: 2025-11-07
**Main Project**: https://github.com/YOUR_USERNAME/korzom
