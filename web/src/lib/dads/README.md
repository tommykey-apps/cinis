# デジタル庁デザインシステム 部品の複製

出典: https://github.com/digital-go-jp/design-system-example-components-html (MIT)
複製元コミット: af8b6656c8d864a22ef444d088e5568f3416f6aa

| ファイル | 元ファイル |
|---|---|
| global.css | src/global.css (トークン定義を除いた `html {` 以降) |
| button.css | src/components/button/button.css |
| input-text.css | src/components/input-text/input-text.css |
| textarea.css | src/components/textarea/textarea.css |
| select.css | src/components/select/select.css |
| form-control-label.css | src/components/form-control-label/form-control-label.css |
| notification-banner.css | src/components/notification-banner/notification-banner.css |
| link.css | src/components/link/link.css |

トークン (色・書体・角丸・影) は npm の `@digital-go-jp/design-tokens` を読み込む。書体 Noto Sans JP は公式サンプルと同じく Google Fonts から 400 と 700 を読み込む (`src/app.html`)。
複製した部品は案件内で固定し、上流には追随しない。変更するときはこの表の出典を見て差分を確認する。

## 明暗テーマ (`src/lib/theme.css`)

デジタル庁デザインシステムに暗色仕様はない。`theme.css` はトークンの原色系で組んだ独自の役割表で、
`html[data-theme="dark"]` と `prefers-color-scheme: dark` のときに公式部品の色を役割変数 (`--cinis-*`) に付け替える。
明の値は公式部品と同じなので、明では見た目が変わらない。複製した部品 CSS はこのために変更しない。
コントラスト比は `scratchpad/contrast.py` 相当の計算で文字 4.5:1・非文字 3:1 を確認済み (PR の動作確認を参照)。
