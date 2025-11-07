# Korea Administrative Boundaries 2025

GeoJSON boundary files created from [vuski/admdongkor](https://github.com/vuski/admdongkor) ver20250401.

All files generated using [mapshaper](https://github.com/mbloch/mapshaper) with proper dissolve operations.

## Files

### Main Boundary Files

| File | Features | Description | Size |
|------|----------|-------------|------|
| `korea-provinces-2025.json` | 17 | Province/Metropolitan city level (시도) | 5.7 MB |
| `korea-cities-2025.json` | 252 | City/District level (시군구) | 11 MB |
| `korea-townships-2025.json` | 3,554 | Township/Village level (읍면동) | 34 MB |
| `chuncheon-boundary.json` | 1 | Chuncheon city boundary | 87 KB |

### Individual City Files

`cities/` directory contains 252 individual city boundary files:
- Format: `{시도명}-{시군구명}.json`
- Example: `강원특별자치도-춘천시.json`
- Each file contains a single FeatureCollection with one feature

## Properties

Each feature includes:

```json
{
  "adm_nm": "강원특별자치도 춘천시",
  "sigungu_cd": "51110"
}
```

### Province Files
- `adm_nm`: Province name (e.g., "서울특별시")
- `sido_cd`: Province code (e.g., "11")

### City Files
- `adm_nm`: Full city name (e.g., "강원특별자치도 춘천시")
- `sigungu_cd`: City code (e.g., "51110")

### Township Files
- `adm_nm`: Full administrative name (e.g., "강원특별자치도 춘천시 신북읍")
- `adm_cd`: Administrative code (8 digits)
- `adm_cd2`: Administrative agency code (10 digits)
- `sgg`: City code (5 digits)
- `sido`: Province code (2 digits)
- `sidonm`: Province name
- `sggnm`: City name

## How Files Were Created

```bash
# 1. Download original data
gh repo clone vuski/admdongkor --depth=1

# 2. Create provinces (dissolve by province)
npx mapshaper korea-townships-2025.json \
  -dissolve sido copy-fields=sidonm \
  -each 'adm_nm=sidonm,sido_cd=sido' \
  -filter-fields adm_nm,sido_cd \
  -o korea-provinces-2025.json format=geojson

# 3. Create cities (dissolve by city)
npx mapshaper korea-townships-2025.json \
  -dissolve sgg copy-fields=sidonm,sggnm \
  -each 'adm_nm=sidonm+" "+sggnm,sigungu_cd=sgg' \
  -filter-fields adm_nm,sigungu_cd \
  -o korea-cities-2025.json format=geojson

# 4. Extract Chuncheon
npx mapshaper korea-cities-2025.json \
  -filter 'adm_nm.indexOf("춘천") > -1' \
  -o chuncheon-boundary.json format=geojson

# 5. Split cities into individual files
node split-cities.js
```

## Usage

### Via GitHub Raw URL

```javascript
// Fetch provinces
const provinces = await fetch(
  'https://raw.githubusercontent.com/Dev-GOM/korzom-geojson-data/main/2025/korea-provinces-2025.json'
).then(r => r.json());

// Fetch specific city
const chuncheon = await fetch(
  'https://raw.githubusercontent.com/Dev-GOM/korzom-geojson-data/main/2025/cities/강원특별자치도-춘천시.json'
).then(r => r.json());
```

### Via npm package (if published)

```bash
npm install @korzom/geojson-data
```

```javascript
import { fetchProvinces, fetchCity } from '@korzom/geojson-data';

const provinces = await fetchProvinces();
const chuncheon = await fetchCity('강원특별자치도-춘천시');
```

## Source Data

- **Repository**: [vuski/admdongkor](https://github.com/vuski/admdongkor)
- **Version**: ver20250401
- **File**: `HangJeongDong_ver20250401.geojson`
- **Last Updated**: March 10, 2025
- **Coordinate System**: WGS84 (EPSG:4326)
- **Encoding**: UTF-8

## License

Same as source data from [vuski/admdongkor](https://github.com/vuski/admdongkor).

## Related

- Main Project: [korzom](https://github.com/Dev-GOM/korzom)
- Data Source: [vuski/admdongkor](https://github.com/vuski/admdongkor)
- Tool Used: [mapshaper](https://github.com/mbloch/mapshaper)
