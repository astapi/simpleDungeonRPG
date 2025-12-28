# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ターン制ローグライトRPG。Expo/React Native製のモバイルアプリケーション。
- 全5階層（各4戦闘）+ ラスボス戦（計21戦）
- 毎回異なるビルド（特性）で進行
- 詳細仕様は`SPEC.md`を参照

## Essential Commands

```bash
# 開発
npx expo start                  # 開発サーバー起動
npx expo start --clear          # キャッシュクリアして起動
npx expo install <package>      # 互換バージョンでインストール

# ビルド・テスト
npx expo lint                   # ESLint実行

# EASワークフロー
npm run draft                   # プレビュー更新
npm run development-builds      # 開発ビルド作成
npm run deploy                  # 本番デプロイ
```

## Architecture

### ゲームフロー（画面遷移）
```
index (タイトル) → battle (戦闘) → reward (報酬選択) → battle... → result (勝敗)
```

### 状態管理
- **グローバル状態**: `stores/gameStore.ts` - Zustandで管理（プレイヤー、階層進行、報酬）
- **戦闘状態**: `hooks/useBattle.ts` - useReducerでローカル管理（敵HP、ターン、ログ）
- バトル終了時にローカル状態をグローバルに反映

### データ構造
- `types/game.ts` - 全ての型定義と定数（`GAME_CONSTANTS`、`INITIAL_PLAYER`）
- `data/enemies.ts` - 敵定義（Tier1〜3 + ボス）と階層別プール
- `data/traits.ts` - 特性定義（攻撃/状態異常/防御/テンポ系）

### 戦闘ロジック
- `utils/battle.ts` - ダメージ計算、状態異常処理、特性効果
- `utils/random.ts` - 乱数ユーティリティ

### コンポーネント構成
- `components/battle/` - 戦闘画面用（PlayerStatus、EnemyDisplay、ActionButtons、BattleLog）
- `components/reward/` - 報酬画面用（RewardCard）
- `components/ui/` - 共通UI（HPBar）

## Development Guidelines

- **TypeScript**: strictモード
- **React 19 + React Compiler**: 有効
- **状態管理**: Zustand（グローバル）、useReducer（ローカル複雑状態）
- **パスエイリアス**: `@/*` で `./*` を参照
- **推奨ライブラリ**: expo-image、react-native-reanimated、react-native-gesture-handler

## Troubleshooting

**Expo Goでエラー**: 開発ビルドを作成（`npm run development-builds`）。ネイティブモジュール制限あり。

## Documentation Resources

- https://docs.expo.dev/llms-full.txt - Expo完全ドキュメント
- https://docs.expo.dev/llms-eas.txt - EASドキュメント
