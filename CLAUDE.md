# cinis

AWS ポートフォリオプロジェクト 5 本目 — **One-time Secret** (1 回読んだら消える秘密共有)。
Laravel 13 + Bref (PHP on Lambda, arm64) + SvelteKit + DynamoDB。ゼロ知識暗号化 (AES-256-GCM + URL fragment)。

## プロジェクト構成

```
cinis/
├── api/          # Laravel 13 (PHP 8.4) + Bref
├── web/          # SvelteKit 2 (Svelte 5 + Tailwind v4 + デジタル庁デザインシステム)
├── infra/        # Terraform (Lambda arm64, DynamoDB TTL, API Gateway HTTP API, CloudFront, Route53)
├── docs/         # アーキテクチャ図 (draw.io)
└── .github/      # CI/CD (GitHub Actions + flox)
```

## 開発環境

**flox を使う。** 手動でツールをインストールしない。

```bash
flox activate   # php84, composer, nodejs, pnpm, terraform, awscli2
```

## パッケージマネージャ

- PHP (Laravel): **composer**
- Web (SvelteKit): **pnpm** (npm は使わない)

## コマンド

### API (Laravel)
```bash
cd api && composer install              # 依存インストール
cd api && php artisan serve --port=8080 # ローカル起動
cd api && php artisan test              # テスト
```

### Web (SvelteKit)
```bash
cd web && pnpm install                  # 依存インストール
cd web && pnpm dev                      # ローカル起動 (proxy /api → :8080)
cd web && pnpm build                    # ビルド (build/ に出力)
cd web && pnpm check                    # 型チェック
```

### Local DynamoDB
```bash
docker compose up -d                    # DynamoDB Local (port 8000)
```

### Infra
```bash
cd infra && terraform init
cd infra && terraform plan
cd infra && terraform apply
cd infra && terraform destroy           # 使わないときは destroy
```

## API エンドポイント

| Method | Path | 機能 |
|--------|------|------|
| POST   | `/api/notes`             | ノート作成 (`ciphertext`, `iv`, `expires_in` を受け取り id 返却) |
| GET    | `/api/notes/{id}/exists` | 存在確認 (削除しない、プレビュー用) |
| GET    | `/api/notes/{id}`        | 暗号文と IV を返し即削除 (既読なら 410) |
| GET    | `/health`                | ヘルスチェック |

## ゼロ知識暗号化

1. ブラウザで WebCrypto API → AES-256-GCM 鍵を生成
2. 平文を暗号化 → `{ciphertext, iv}` を POST
3. サーバーは暗号文のみ保存 (鍵は知らない)
4. 発行 URL: `https://cinis.tommykeyapp.com/s/{id}#{key_b64}` — fragment はサーバー送信されない
5. 受信者アクセス → サーバー暗号文を返却&即削除 → ブラウザが fragment の鍵で復号

## DB スキーマドキュメント

`docs/db/` に DynamoDB スキーマドキュメント。`make db-docs` で再生成。
詳細: [docs/db/entities.md](docs/db/entities.md), [docs/db/access-patterns.md](docs/db/access-patterns.md)

## 設計判断

- **arm64 + Bref layer** (`arm-php-84-fpm`) — 最安、最新 Laravel 13 対応
- **DynamoDB On-Demand + TTL** — 低トラフィック想定、未読放置は最大 7 日で自動削除
- **ステートレス** — `SESSION_DRIVER=array`, `DB_CONNECTION=null`, `QUEUE_CONNECTION=sync`
- **AWS SDK は DynamoDB のみ** — デプロイサイズ 250MB 制限回避
- **CloudFront は PriceClass_200** — 日本は PriceClass_100 に含まれない
- **API Gateway は HTTP API** — REST API より約 70% 安
- **暗色テーマは独自設計** — デジタル庁デザインシステムに暗色仕様がないため、`web/src/lib/theme.css` でトークンの原色系から役割変数を組む。切替は system / light / dark (`localStorage['cinis-theme']`)

## AWS リージョン / ドメイン

- リージョン: ap-northeast-1 (東京)
- ドメイン: cinis.tommykeyapp.com
- ACM 証明書: `*.tommykeyapp.com` (us-east-1) を data source で参照
- Route53 hosted zone: `tommykeyapp.com` (既存)
- Terraform state: `s3://tommykeyapp-tfstate/burnnote/terraform.tfstate`

## デプロイフロー

1. PR → CI (api test, web build)
2. main merge → CD
   - 変更検知 (dorny/paths-filter)
   - infra 変更時: terraform apply
   - api: composer install --no-dev → zip → Lambda update-function-code
   - web: pnpm build → S3 sync → CloudFront invalidate
