/**
 * dot-illust.net からRPGタグのドット絵をダウンロードするスクリプト
 * 使用方法: npx tsx scripts/download-dot-illust.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { JSDOM } from "jsdom";

const BASE_URL = "https://dot-illust.net/tag/rpg/";
const OUTPUT_DIR = path.join(process.cwd(), "downloads", "dot-illust-rpg");

// HTTPSリクエストを行うPromiseラッパー
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          fetchUrl(redirectUrl).then(resolve).catch(reject);
          return;
        }
      }

      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// 画像をダウンロードして保存
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(filepath);
          downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
          return;
        }
      }

      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
      file.on("error", (err) => {
        fs.unlinkSync(filepath);
        reject(err);
      });
    }).on("error", (err) => {
      fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

// ページから画像URLを抽出
function extractImageUrls(html: string): string[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const urls: string[] = [];

  // メインコンテンツの画像を取得
  // 画像は li > a > img の構造で、src属性にPNG URLがある
  const images = document.querySelectorAll(
    'img[src*="/wp-content/themes/dotillust/assets/dl/"]'
  );

  images.forEach((img) => {
    const src = img.getAttribute("src");
    if (src && src.endsWith(".png")) {
      urls.push(src);
    }
  });

  return urls;
}

// 最大ページ数を取得
function getMaxPage(html: string): number {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // ページネーションのリンクからページ番号を抽出
  const pageLinks = document.querySelectorAll('a[href*="/tag/rpg/page/"]');
  let maxPage = 1;

  pageLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href) {
      const match = href.match(/\/page\/(\d+)/);
      if (match) {
        const pageNum = parseInt(match[1], 10);
        if (pageNum > maxPage) {
          maxPage = pageNum;
        }
      }
    }
  });

  return maxPage;
}

// ページURLを生成
function getPageUrl(page: number): string {
  if (page === 1) {
    return BASE_URL;
  }
  return `${BASE_URL}page/${page}/`;
}

// ファイル名をURLから抽出
function getFilenameFromUrl(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1];
}

// メイン処理
async function main() {
  console.log("ドット絵ダウンロードスクリプト開始");
  console.log(`出力先: ${OUTPUT_DIR}`);

  // 出力ディレクトリ作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 最初のページを取得して最大ページ数を確認
  console.log("ページ情報を取得中...");
  const firstPageHtml = await fetchUrl(BASE_URL);
  const maxPage = getMaxPage(firstPageHtml);
  console.log(`全${maxPage}ページを処理します`);

  let totalDownloaded = 0;
  let totalSkipped = 0;

  // 各ページを処理
  for (let page = 1; page <= maxPage; page++) {
    const pageUrl = getPageUrl(page);
    console.log(`\nページ ${page}/${maxPage} を処理中: ${pageUrl}`);

    try {
      const html = page === 1 ? firstPageHtml : await fetchUrl(pageUrl);
      const imageUrls = extractImageUrls(html);
      console.log(`  ${imageUrls.length}個の画像を発見`);

      for (const imageUrl of imageUrls) {
        const filename = getFilenameFromUrl(imageUrl);
        const filepath = path.join(OUTPUT_DIR, filename);

        // 既にダウンロード済みの場合はスキップ
        if (fs.existsSync(filepath)) {
          console.log(`  スキップ (既存): ${filename}`);
          totalSkipped++;
          continue;
        }

        try {
          await downloadImage(imageUrl, filepath);
          console.log(`  ダウンロード完了: ${filename}`);
          totalDownloaded++;

          // サーバーへの負荷軽減のため少し待機
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (err) {
          console.error(`  ダウンロード失敗: ${filename}`, err);
        }
      }

      // ページ間で少し待機
      if (page < maxPage) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error(`ページ ${page} の処理中にエラー:`, err);
    }
  }

  console.log("\n=== 完了 ===");
  console.log(`ダウンロード: ${totalDownloaded}個`);
  console.log(`スキップ: ${totalSkipped}個`);
  console.log(`保存先: ${OUTPUT_DIR}`);
}

main().catch(console.error);
