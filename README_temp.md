# GeoJSON Data Management

## Directory Structure

```
data/geojson/
├── 2025/                    # Latest administrative boundaries (ver20250401)
│   ├── korea-provinces-2025.json      (5.7 MB, 17 features)
│   ├── korea-cities-2025.json         (12 MB, 252 features)
│   ├── korea-townships-2025.json      (34 MB, 3,554 features)
│   └── chuncheon-boundary.json        (86 KB, 1 feature)
└── README.md               # This file
```

## Data Source

- **Repository**: https://github.com/vuski/admdongkor
- **Version**: ver20250401 (March 10, 2025)
- **Original file**: `HangJeongDong_ver20250401.geojson` (33 MB)
- **Processing tool**: mapshaper

## File Descriptions

### 1. korea-provinces-2025.json
- **Level**: 시도 (Province/Metropolitan City)
- **Features**: 17
- **Size**: 5.7 MB
- **Usage**: Main map view for character creation starting location
- **Deploy**: ✅ Include in `client/public/`

### 2. korea-cities-2025.json
- **Level**: 시군구 (City/County/District)
- **Features**: 252
- **Size**: 12 MB
- **Usage**: Detailed city boundaries for starting location selection
- **Deploy**: ✅ Include in `client/public/`

### 3. korea-townships-2025.json
- **Level**: 읍면동 (Township/Village/Neighborhood)
- **Features**: 3,554
- **Size**: 34 MB
- **Usage**: Future feature for district-level gameplay
- **Deploy**: ⚠️ Optional - Only deploy when needed (too large for initial release)

### 4. chuncheon-boundary.json
- **Level**: Single city boundary (Chuncheon)
- **Features**: 1
- **Size**: 86 KB
- **Usage**: Specific boundary for Chuncheon (Gangwon starting location)
- **Deploy**: ✅ Include in `client/public/`

## Data Processing Commands

All data is generated from the original township-level GeoJSON using mapshaper.

### Prerequisites
```bash
pnpm add -D mapshaper
```

### Download Original Data
```bash
curl -L -o temp_adm_data.geojson \
  "https://raw.githubusercontent.com/vuski/admdongkor/master/ver20250401/HangJeongDong_ver20250401.geojson"
```

### Generate Province Level (시도)
```bash
npx mapshaper temp_adm_data.geojson \
  -each "sido_cd=adm_cd.substr(0,2)" \
  -dissolve sido_cd copy-fields=adm_nm \
  -o data/geojson/2025/korea-provinces-2025.json
```

### Generate City Level (시군구)
```bash
npx mapshaper temp_adm_data.geojson \
  -each "sigungu_cd=adm_cd.substr(0,5)" \
  -dissolve sigungu_cd copy-fields=adm_nm \
  -o data/geojson/2025/korea-cities-2025.json
```

### Copy Township Level (읍면동)
```bash
cp temp_adm_data.geojson data/geojson/2025/korea-townships-2025.json
```

### Extract Chuncheon City
```bash
npx mapshaper data/geojson/2025/korea-cities-2025.json \
  -filter "adm_nm.indexOf('춘천') > -1" \
  -o data/geojson/2025/chuncheon-boundary.json
```

### Cleanup
```bash
rm temp_adm_data.geojson
```

## Deployment Strategy

### Development (Local)
All files available in `data/geojson/2025/` for testing.

### Production Deployment
Copy required files to `client/public/`:

```bash
# Essential files (recommended for initial release)
cp data/geojson/2025/korea-provinces-2025.json client/public/
cp data/geojson/2025/korea-cities-2025.json client/public/
cp data/geojson/2025/chuncheon-boundary.json client/public/

# Optional: Townships (only when needed)
# cp data/geojson/2025/korea-townships-2025.json client/public/
```

### Git Strategy
- ✅ **Commit to git**: `data/geojson/` folder (source of truth)
- ✅ **Commit to git**: `client/public/*.json` (deployed files)
- 📝 **Document**: Keep generation commands in this README

**Rationale**:
- Data is version-controlled and reproducible
- Small enough for git (52 MB total, well under GitHub's 100 MB limit)
- No need for Git LFS or external storage

## Future Optimizations

### Option 1: Format Conversion
Convert to more efficient formats:
- **TopoJSON**: 60-80% size reduction
- **Protocol Buffers**: Binary format, faster parsing
- **Mapbox Vector Tiles**: Progressive loading

### Option 2: CDN Hosting
Host large files (townships) on CDN:
- AWS S3 + CloudFront
- Vercel Blob Storage
- Supabase Storage

### Option 3: Dynamic Loading
Load boundaries on-demand based on:
- Zoom level
- User location
- Game phase

## Administrative Code Structure

Korean administrative divisions use 8-digit codes:

```
adm_cd: 11110101
        └┬┘└┬─┘└┬┘
         │  │   └─ Township (읍면동) - 3 digits
         │  └───── City/District (시군구) - 3 digits
         └──────── Province (시도) - 2 digits
```

**Examples**:
- `11` = Seoul
- `11110` = Seoul Jongno-gu
- `11110101` = Seoul Jongno-gu Cheongun-dong
- `51` = Gangwon Province
- `51110` = Chuncheon City

## Data Updates

To update to newer administrative boundary data:

1. Check for new versions: https://github.com/vuski/admdongkor
2. Download latest version
3. Create new directory: `data/geojson/YYYYMM/`
4. Run generation commands (see above)
5. Update `client/lib/constants/map.ts` if region names changed
6. Test with InteractiveKoreaMap component
7. Update this README with new version info

## Related Documentation

- [Administrative Boundaries 2025](../../docs/30-administrative-boundaries-2025.md)
- [Map System Constants](../../client/lib/constants/map.ts)
- [mapshaper documentation](https://github.com/mbloch/mapshaper)
- [GeoJSON specification](https://geojson.org/)

## License

GeoJSON data is sourced from [admdongkor](https://github.com/vuski/admdongkor).
Please check the repository for license information.

---

**Last Updated**: 2025-11-07
**Data Version**: ver20250401 (March 10, 2025)
