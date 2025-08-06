# Task Manager - タスク管理アプリ 📝

ユーザーの生産性を最大化する、直感的で美しいタスク管理アプリケーション

## ✨ 主な機能

- 🏢 **3カテゴリー管理**: 仕事・プライベート・勉強の独立したタスク管理
- ✅ **CRUD操作**: タスクの作成・編集・完了・削除
- 🔄 **ドラッグ&ドロップ**: 直感的なタスクの並び替え
- 🔍 **検索・フィルタリング**: 高速なタスク検索とステータス絞り込み
- 📊 **統計ダッシュボード**: 完了率・カテゴリ別・期間別の詳細統計
- 🌙 **ダークモード**: システム設定連動 + 手動切り替え
- 📱 **PWA対応**: オフライン動作・ホーム画面追加可能
- 💾 **データ永続化**: localStorage自動保存
- 📱 **レスポンシブ**: モバイル・タブレット・デスクトップ対応
- ♿ **アクセシビリティ**: WCAG 2.1 AA準拠

## 🚀 デモ

[https://yourusername.github.io/task-manager-app/](https://yourusername.github.io/task-manager-app/)

## 🛠️ 技術スタック

- **フレームワーク**: React 18
- **ビルドツール**: Vite
- **状態管理**: Context API + useReducer
- **スタイリング**: CSS Modules + CSS Variables
- **ドラッグ&ドロップ**: @dnd-kit
- **PWA**: vite-plugin-pwa
- **テスト**: Vitest + React Testing Library
- **デプロイ**: GitHub Actions + GitHub Pages

## 💻 開発環境セットアップ

```bash
# リポジトリクローン
git clone https://github.com/yourusername/task-manager-app.git
cd task-manager-app

# 依存関係インストール
yarn install

# 開発サーバー起動
yarn dev

# ブラウザで http://localhost:5173 を開く
```

## 📦 ビルド

```bash
# プロダクションビルド
yarn build

# ローカルでプレビュー
yarn preview
```

## 🧪 テスト

```bash
# テスト実行
yarn test

# カバレッジ付きテスト
yarn test:coverage

# リント
yarn lint

# フォーマット
yarn format
```

## 📱 PWA機能

このアプリはPWA（Progressive Web App）として動作し、以下の機能を提供します：

- **オフライン動作**: インターネット接続なしでも使用可能
- **ホーム画面追加**: ネイティブアプリのようにインストール可能
- **プッシュ通知**: 重要なタスクの通知（将来実装予定）
- **バックグラウンド同期**: 接続復旧時の自動同期（将来実装予定）

## 🎨 デザインシステム

### カラーパレット
- **プライマリ**: `#667eea` → `#764ba2`（グラデーション）
- **成功**: `#10b981`
- **警告**: `#f59e0b`
- **エラー**: `#ef4444`
- **情報**: `#3b82f6`

### アニメーション
- **高速**: 150ms
- **標準**: 250ms
- **低速**: 350ms
- **イージング**: `cubic-bezier(0.4, 0, 0.2, 1)`

## 📊 パフォーマンス目標

- **Lighthouse Performance**: 90+
- **Lighthouse Accessibility**: 100
- **First Contentful Paint**: < 1.5秒
- **バンドルサイズ**: < 200KB (gzip)

## 📁 プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── Header/
│   ├── TabNavigation/
│   ├── TaskManager/
│   ├── SearchBar/
│   └── StatsModal/
├── contexts/            # React Context
│   ├── TaskContext.jsx
│   └── ThemeContext.jsx
├── hooks/               # カスタムフック
│   ├── useLocalStorage.js
│   ├── useDebounce.js
│   ├── useMediaQuery.js
│   └── useKeyboard.js
├── utils/               # ユーティリティ関数
│   ├── constants.js
│   ├── storage.js
│   ├── validation.js
│   └── date.js
├── styles/              # グローバルスタイル
│   ├── globals.css
│   ├── variables.css
│   └── animations.css
└── test/                # テスト設定
    └── setup.js
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📜 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 👨‍💻 開発者

**Claude Code Assistant**
- Email: noreply@anthropic.com

## 🙏 謝辞

このプロジェクトは以下のオープンソースプロジェクトによって支えられています：

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [dnd kit](https://dndkit.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

---

🚀 **Let's manage tasks efficiently!** ✨
