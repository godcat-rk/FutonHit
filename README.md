# 布団鯖ヒット＆ブロー

リアルタイムで遊べる布団鯖専用のヒット＆ブロー（マスターマインド）風ゲームです。Ably を使った同期待ちロビーとターン管理、GitHub Pages での SPA 配信に対応しています。

## ざっくり仕様
- **ルール**: 6種類のアイコンから 4 つを並べた正解を当てる。Hit=アイコンと位置が一致、Blow=アイコンのみ一致。
- **ターン**: 60 秒/ターン。時間切れ時は自動入力で次ターンへ。
- **ロビー**: 名前＋パスワードで入室。ホストがゲーム開始。途中参加は観戦モード。
- **離脱処理**: タブ/ブラウザを閉じると `player:leave` を送信しロビーから除外。
- **リロード/直アクセス**: SPA 404 フォールバック（`404.html`）で `/lobby` 等の直アクセス・更新でも復帰。

## 技術スタック
- Frontend: React + Vite + TypeScript
- State: Zustand
- Styling: Tailwind CSS
- Realtime: Ably
- Hosting: GitHub Pages（SPA fallback 同梱）

## 動かし方
```bash
npm install           # 依存インストール
npm run dev           # 開発サーバー
npm run build         # ビルド
npm run preview       # ビルド後プレビュー
```
`.env` に `VITE_ABLY_API_KEY` を設定してください。GitHub Actions では `secrets.VITE_ABLY_API_KEY` をビルド時に注入しています。

## デプロイ
`main` への push で GitHub Pages に自動デプロイされます。ビルド後に `dist/index.html` を `dist/404.html` にコピーしているため、直接 URL で開いても SPA として動作します。

## 要件・設計の詳細
最新の要件定義は [要件定義書.md](./要件定義書.md) を参照してください。
