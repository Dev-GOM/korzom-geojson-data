#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const BASE_DIR = path.join(__dirname, '2025');

// Number of parallel conversions
const PARALLEL_LIMIT = 10;

console.log('🚀 Starting GeoJSON to TopoJSON conversion...\n');
console.log(`⚡ Running ${PARALLEL_LIMIT} conversions in parallel\n`);

/**
 * Convert a single GeoJSON file to TopoJSON (async)
 */
async function convertFile(sourcePath, targetPath) {
  try {
    // Ensure target directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Convert using mapshaper
    await execAsync(
      `npx -y mapshaper "${sourcePath}" -o format=topojson "${targetPath}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    return { success: true, sourcePath, targetPath };
  } catch (error) {
    return { success: false, sourcePath, targetPath, error: error.message };
  }
}

/**
 * Process files in parallel batches
 */
async function processBatch(files, batchSize) {
  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(({ sourcePath, targetPath, displayName, index, total }) => {
        // Skip if already exists
        if (fs.existsSync(targetPath)) {
          console.log(`[${index}/${total}] ⊘ ${displayName} (exists)`);
          skipped++;
          return Promise.resolve({ status: 'skipped' });
        }

        console.log(`[${index}/${total}] 🔄 ${displayName}`);
        return convertFile(sourcePath, targetPath).then(result => {
          if (result.success) {
            console.log(`[${index}/${total}] ✓ ${displayName}`);
            converted++;

            // Delete original GeoJSON after successful conversion
            try {
              fs.unlinkSync(sourcePath);
              console.log(`[${index}/${total}] 🗑️  Deleted: ${path.basename(sourcePath)}`);
            } catch (err) {
              // Ignore delete errors
            }
          } else {
            console.log(`[${index}/${total}] ✗ ${displayName} - ${result.error}`);
            failed++;
          }
          return result;
        });
      })
    );
  }

  return { converted, skipped, failed };
}

/**
 * Convert cities folder (252 files) - Parallel processing
 * Save in province folders: cities/강원특별자치도/강릉시.topojson
 */
async function convertCities() {
  console.log('📍 Converting cities (252 files)...\n');

  const citiesDir = path.join(BASE_DIR, 'cities');
  const files = fs.readdirSync(citiesDir).filter(f => f.endsWith('.json') && !f.endsWith('.topojson'));

  const fileList = files.map((file, index) => {
    const basename = path.basename(file, '.json');

    // Split by '-' to get province and city
    // Example: "강원특별자치도-강릉시" -> ["강원특별자치도", "강릉시"]
    const parts = basename.split('-');

    if (parts.length >= 2) {
      const province = parts[0];
      const city = parts.slice(1).join('-'); // Handle cases with multiple dashes

      const provinceDir = path.join(citiesDir, province);

      return {
        sourcePath: path.join(citiesDir, file),
        targetPath: path.join(provinceDir, `${city}.topojson`),
        displayName: `${province}/${city}`,
        index: index + 1,
        total: files.length
      };
    } else {
      // Fallback for files without '-'
      return {
        sourcePath: path.join(citiesDir, file),
        targetPath: path.join(citiesDir, `${basename}.topojson`),
        displayName: basename,
        index: index + 1,
        total: files.length
      };
    }
  });

  const result = await processBatch(fileList, PARALLEL_LIMIT);

  console.log(`\n✅ Cities: ${result.converted} converted, ${result.skipped} skipped, ${result.failed} failed\n`);
  return result;
}

/**
 * Convert townships folder (3,554 files) - Parallel processing
 */
async function convertTownships() {
  console.log('📍 Converting townships (3,554 files)...\n');

  const townshipsDir = path.join(BASE_DIR, 'townships');
  const fileList = [];

  // Get all provinces (시도)
  const provinces = fs.readdirSync(townshipsDir).filter(f => {
    const stat = fs.statSync(path.join(townshipsDir, f));
    return stat.isDirectory();
  });

  provinces.forEach(province => {
    const provinceDir = path.join(townshipsDir, province);

    // Get all cities (시군구)
    const cities = fs.readdirSync(provinceDir).filter(f => {
      const stat = fs.statSync(path.join(provinceDir, f));
      return stat.isDirectory();
    });

    cities.forEach(city => {
      const cityDir = path.join(provinceDir, city);
      const files = fs.readdirSync(cityDir).filter(f => f.endsWith('.json') && !f.endsWith('.topojson'));

      files.forEach(file => {
        const basename = path.basename(file, '.json');
        fileList.push({
          sourcePath: path.join(cityDir, file),
          targetPath: path.join(cityDir, `${basename}.topojson`),
          displayName: `${province}/${city}/${basename}`,
          index: fileList.length + 1,
          total: 3554
        });
      });
    });
  });

  const result = await processBatch(fileList, PARALLEL_LIMIT);

  console.log(`\n✅ Townships: ${result.converted} converted, ${result.skipped} skipped, ${result.failed} failed\n`);
  return result;
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  try {
    // Convert cities
    const citiesResult = convertCities();

    // Convert townships
    const townshipsResult = convertTownships();

    // Summary
    const totalConverted = citiesResult.converted + townshipsResult.converted;
    const totalSkipped = citiesResult.skipped + townshipsResult.skipped;
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('========================================');
    console.log('✅ Conversion Complete!');
    console.log('========================================');
    console.log(`  Total converted: ${totalConverted}`);
    console.log(`  Total skipped:   ${totalSkipped}`);
    console.log(`  Total time:      ${totalTime}s`);
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

main();
