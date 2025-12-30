import sharp from 'sharp';
import path from 'path';

const ASSETS_DIR = path.join(__dirname, '../assets/images');
const OUTPUT_PATH = path.join(ASSETS_DIR, 'feature-graphic.png');

async function createFeatureGraphic() {
  const WIDTH = 1024;
  const HEIGHT = 500;

  // 背景画像を読み込んでリサイズ
  const background = await sharp(path.join(ASSETS_DIR, 'bg.png'))
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .toBuffer();

  // アイコン（バンディット）を読み込んでリサイズ
  const icon = await sharp(path.join(ASSETS_DIR, 'icon.png'))
    .resize(300, 300, { fit: 'contain' })
    .toBuffer();

  // タイトルテキストのSVG
  const titleSvg = `
    <svg width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.8)"/>
        </filter>
      </defs>
      <text
        x="${WIDTH / 2 + 80}"
        y="${HEIGHT / 2 + 20}"
        font-family="sans-serif"
        font-size="72"
        font-weight="bold"
        fill="#e94560"
        text-anchor="middle"
        filter="url(#shadow)"
      >さくさくダンジョン</text>
    </svg>
  `;

  // 半透明オーバーレイ
  const overlay = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: { r: 26, g: 26, b: 46, alpha: 0.5 }
    }
  }).png().toBuffer();

  // 合成
  await sharp(background)
    .composite([
      { input: overlay, blend: 'over' },
      { input: icon, left: 50, top: 100 },
      { input: Buffer.from(titleSvg), left: 0, top: 0 }
    ])
    .png()
    .toFile(OUTPUT_PATH);

  console.log(`✓ フィーチャーグラフィック作成完了: ${OUTPUT_PATH}`);
}

createFeatureGraphic().catch(console.error);
