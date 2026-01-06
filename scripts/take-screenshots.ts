import puppeteer, { Page } from 'puppeteer';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');
const MOBILE_VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 3 }; // 390x844 * 3 = 1170x2532

// テキストを含む要素をクリック（ポインターイベント使用）
async function clickByText(page: Page, text: string): Promise<boolean> {
  const result = await page.evaluate((searchText) => {
    const elements = document.querySelectorAll('*');
    for (const el of elements) {
      // 直接のテキストノードを持つ要素を探す
      const hasDirectText = Array.from(el.childNodes).some(
        node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === searchText
      );
      if (hasDirectText || el.textContent?.trim() === searchText) {
        const rect = (el as HTMLElement).getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
    }
    return null;
  }, text);

  if (result) {
    await page.mouse.click(result.x, result.y);
    return true;
  }
  return false;
}

// テキストを含む要素が存在するか確認
async function hasText(page: Page, text: string): Promise<boolean> {
  return page.evaluate((searchText) => {
    return document.body.innerText.includes(searchText);
  }, text);
}

async function takeScreenshots() {
  // スクショ保存ディレクトリ作成
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport(MOBILE_VIEWPORT);

  try {
    // 1. スタート画面
    console.log('1. スタート画面を撮影中...');
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000)); // 画像読み込み待ち
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01_title.png'),
      type: 'png'
    });
    console.log('  ✓ 01_title.png');

    // 2. バトル画面（ダンジョンに潜るボタンをクリック）
    console.log('2. バトル画面を撮影中...');
    const startClicked = await clickByText(page, 'ダンジョンに潜る');
    console.log(`  ダンジョンに潜るボタン: ${startClicked ? 'クリック成功' : 'クリック失敗'}`);
    await new Promise(r => setTimeout(r, 3000)); // 画面遷移・画像読み込み待ち
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02_battle.png'),
      type: 'png'
    });
    console.log('  ✓ 02_battle.png');

    // 3. 報酬画面（攻撃を繰り返して敵を倒す）
    console.log('3. 報酬画面を撮影中（戦闘中...）');
    let rewardCaptured = false;
    for (let i = 0; i < 100; i++) {
      try {
        // 報酬画面かチェック
        const isRewardScreen = await hasText(page, '報酬を選択');
        if (isRewardScreen) {
          await new Promise(r => setTimeout(r, 1000));
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, '03_reward.png'),
            type: 'png'
          });
          console.log('  ✓ 03_reward.png');
          rewardCaptured = true;
          break;
        }

        // 攻撃ボタンをクリック
        const clicked = await clickByText(page, '攻撃');
        if (clicked) {
          console.log(`  攻撃 ${i + 1}回目...`);
        }
        await new Promise(r => setTimeout(r, 800));
      } catch (e) {
        // エラーは無視して続行
        console.log(`  エラー発生、続行中...`);
      }
    }

    if (!rewardCaptured) {
      console.log('  ! 報酬画面に到達できませんでした');
    }

    console.log('\nスクリーンショット完了！');
    console.log(`保存先: ${SCREENSHOT_DIR}`);

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
