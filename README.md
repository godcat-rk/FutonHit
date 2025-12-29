# FutonHit - ヒットアンドブローオンライン対戦

ヒットアンドブローのオンライン対戦webアプリケーション

## 概要

13個の数字(1-13)から選ばれた4つの正解を当てる推理ゲーム。
最大4人で対戦し、最も早く正解したプレイヤーが勝利。

## ゲームルール

- 13個の数字の中から4つが正解として設定される
- プレイヤーは順番に4つの数字を予想
- 各ターンの制限時間は20秒
- **ヒット**: 位置と数字が一致
- **ブロー**: 数字は一致するが位置が異なる
- 全員の回答履歴が共有される

## 技術スタック

- **Frontend**: React + Vite + TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Realtime**: Ably
- **Hosting**: GitHub Pages

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## 開発状況

- ✅ 要件定義完了
- ✅ 環境構築完了
- 🚧 アプリケーション実装中
- ⏳ デプロイ準備中

## デプロイ

GitHub Actionsで自動デプロイされます。
`main`ブランチにpushすると、GitHub Pagesに自動的にデプロイされます。

## ドキュメント

詳細な要件定義は [要件定義書.md](./要件定義書.md) を参照してください。
