/**
 * PNG圧縮ツール
 *
 * 使用方法:
 *   npx tsx scripts/compress-png.ts [options] [path]
 *
 * オプション:
 *   --quality <n>   圧縮品質 1-100 (デフォルト: 80)
 *   --effort <n>    圧縮レベル 1-10 (デフォルト: 6)
 *   --dry-run       実際には圧縮せず、対象ファイルの一覧表示のみ
 *   --backup        圧縮前にバックアップを作成 (.bak)
 *
 * 例:
 *   npx tsx scripts/compress-png.ts                    # assets/images内のPNGを圧縮
 *   npx tsx scripts/compress-png.ts ./my-folder        # 指定フォルダ内のPNGを圧縮
 *   npx tsx scripts/compress-png.ts --quality 60       # 品質60で圧縮
 *   npx tsx scripts/compress-png.ts --dry-run          # ドライラン
 */

import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

interface Options {
  quality: number;
  effort: number;
  dryRun: boolean;
  backup: boolean;
  targetPath: string;
}

interface CompressionResult {
  file: string;
  originalSize: number;
  compressedSize: number;
  saved: number;
  percentage: number;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const options: Options = {
    quality: 80,
    effort: 6,
    dryRun: false,
    backup: false,
    targetPath: "./assets/images",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--quality" && args[i + 1]) {
      options.quality = Math.min(100, Math.max(1, parseInt(args[++i], 10)));
    } else if (arg === "--effort" && args[i + 1]) {
      options.effort = Math.min(10, Math.max(1, parseInt(args[++i], 10)));
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--backup") {
      options.backup = true;
    } else if (!arg.startsWith("--")) {
      options.targetPath = arg;
    }
  }

  return options;
}

function findPngFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    console.error(`エラー: ディレクトリが存在しません: ${dir}`);
    process.exit(1);
  }

  const stat = fs.statSync(dir);
  if (stat.isFile() && dir.toLowerCase().endsWith(".png")) {
    return [dir];
  }

  function scanDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
        files.push(fullPath);
      }
    }
  }

  scanDir(dir);
  return files;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function compressPng(
  filePath: string,
  options: Options
): Promise<CompressionResult | null> {
  const originalBuffer = fs.readFileSync(filePath);
  const originalSize = originalBuffer.length;

  if (options.dryRun) {
    return {
      file: filePath,
      originalSize,
      compressedSize: originalSize,
      saved: 0,
      percentage: 0,
    };
  }

  try {
    // バックアップ作成
    if (options.backup) {
      fs.writeFileSync(`${filePath}.bak`, originalBuffer);
    }

    // 圧縮
    const compressedBuffer = await sharp(originalBuffer)
      .png({
        quality: options.quality,
        effort: options.effort,
        compressionLevel: 9,
        palette: true,
      })
      .toBuffer();

    // 圧縮後のサイズが小さい場合のみ上書き
    if (compressedBuffer.length < originalSize) {
      fs.writeFileSync(filePath, compressedBuffer);
      return {
        file: filePath,
        originalSize,
        compressedSize: compressedBuffer.length,
        saved: originalSize - compressedBuffer.length,
        percentage:
          ((originalSize - compressedBuffer.length) / originalSize) * 100,
      };
    } else {
      // 圧縮しても小さくならない場合はスキップ
      return {
        file: filePath,
        originalSize,
        compressedSize: originalSize,
        saved: 0,
        percentage: 0,
      };
    }
  } catch (error) {
    console.error(`エラー (${filePath}):`, error);
    return null;
  }
}

async function main() {
  const options = parseArgs();

  console.log("PNG圧縮ツール");
  console.log("=".repeat(50));
  console.log(`対象パス: ${options.targetPath}`);
  console.log(`品質: ${options.quality}`);
  console.log(`圧縮レベル: ${options.effort}`);
  if (options.dryRun) console.log("モード: ドライラン");
  if (options.backup) console.log("バックアップ: 有効");
  console.log("=".repeat(50));

  const files = findPngFiles(options.targetPath);

  if (files.length === 0) {
    console.log("PNGファイルが見つかりませんでした。");
    return;
  }

  console.log(`\n${files.length} 個のPNGファイルを処理します...\n`);

  const results: CompressionResult[] = [];

  for (const file of files) {
    const result = await compressPng(file, options);
    if (result) {
      results.push(result);
      const status =
        result.saved > 0
          ? `✓ ${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (-${result.percentage.toFixed(1)}%)`
          : `- ${formatBytes(result.originalSize)} (変更なし)`;
      console.log(`${path.basename(result.file)}: ${status}`);
    }
  }

  // 結果サマリー
  console.log("\n" + "=".repeat(50));
  console.log("結果サマリー");
  console.log("=".repeat(50));

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalCompressed = results.reduce((sum, r) => sum + r.compressedSize, 0);
  const totalSaved = totalOriginal - totalCompressed;
  const compressedCount = results.filter((r) => r.saved > 0).length;

  console.log(`処理ファイル数: ${results.length}`);
  console.log(`圧縮成功: ${compressedCount}`);
  console.log(`元のサイズ合計: ${formatBytes(totalOriginal)}`);
  console.log(`圧縮後サイズ合計: ${formatBytes(totalCompressed)}`);
  console.log(
    `削減量: ${formatBytes(totalSaved)} (${((totalSaved / totalOriginal) * 100).toFixed(1)}%)`
  );

  if (options.dryRun) {
    console.log("\n※ ドライランのため、ファイルは変更されていません。");
  }
}

main().catch(console.error);
