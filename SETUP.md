# HubSpot 請求書作成システム - セットアップガイド

## 前提条件

1. **HubSpotアカウント**: 開発者アクセス権限を持つHubSpotアカウント
2. **HubSpot CLI**: バージョン6.0.0以上
3. **Node.js**: バージョン16以上

## 必要なアカウント権限

### 1. HubSpotアカウントレベルの権限

#### スーパー管理者権限 (推奨)
- アプリの作成・管理
- カスタムプロパティの作成
- UI Extensionsの有効化
- 開発者設定へのアクセス

#### 最小限の権限 (最低限必要)
- **アカウント設定への書き込み権限**
- **CRMへの読み取り・書き込み権限**
- **開発者ツールへのアクセス権限**

### 2. API権限 (OAuth スコープ)

プライベートアプリまたはOAuthアプリで必要なスコープ：

#### 必須スコープ
- `crm.objects.deals.read` - 取引データの読み取り
- `crm.objects.deals.write` - 取引データの更新（請求書情報保存）
- `crm.objects.contacts.read` - コンタクトデータの読み取り
- `crm.associations.read` - 取引とコンタクトの関連情報取得
- `crm.objects.notes.write` - 請求書作成ノートの追加

#### 追加推奨スコープ
- `crm.objects.companies.read` - 会社情報の取得
- `crm.objects.custom.read` - カスタムオブジェクトの読み取り
- `crm.objects.custom.write` - カスタムオブジェクトの書き込み
- `timeline` - タイムラインイベントの作成

### 3. HubSpot設定での権限

#### カスタムプロパティ作成権限
以下のカスタムプロパティを作成する権限が必要：

**取引オブジェクト用:**
- `invoice_number` (一行テキスト)
- `invoice_base_amount` (数値)
- `invoice_tax_rate` (数値) 
- `invoice_tax_amount` (数値)
- `invoice_total_amount` (数値)
- `invoice_status` (ドロップダウン)
- `invoice_created_date` (日時)

#### UI Extensions管理権限
- アカウント設定 > 開発者設定 > UI Extensionsの管理
- エクステンションの有効化・無効化

## セットアップ手順

### 1. HubSpot CLIのインストール

```bash
npm install -g @hubspot/cli
```

### 2. HubSpotアカウントの認証

```bash
hs auth
```

### 3. プロジェクトの初期化

```bash
# 依存関係のインストール
npm install

# HubSpotプロジェクトの初期化
hs project create
```

### 4. 設定ファイルの更新

`hubspot.config.yml` ファイルでポータルIDを設定：

```yaml
defaultPortal: "your-portal-id"
environments:
  - name: "development"
    portalId: "your-dev-portal-id"
```

### 5. 開発環境の起動

```bash
npm run dev
```

### 6. デプロイ

```bash
# 開発環境へのデプロイ
npm run deploy

# 本番環境へのアップロード
npm run upload
```

## 権限設定の詳細手順

### 1. プライベートアプリの作成と権限設定

1. HubSpotアカウントにログイン
2. **設定 > 統合 > プライベートアプリ** に移動
3. 「プライベートアプリを作成」をクリック
4. アプリ名を設定: `Invoice Creator App`
5. **スコープ**タブで以下をチェック：

#### CRM スコープ
- ☑️ `crm.objects.deals.read`
- ☑️ `crm.objects.deals.write`  
- ☑️ `crm.objects.contacts.read`
- ☑️ `crm.associations.read`
- ☑️ `crm.objects.notes.write`
- ☑️ `crm.objects.companies.read` (任意)

#### その他のスコープ
- ☑️ `timeline` (任意)

6. 「アプリを作成」をクリック
7. **アクセストークンをコピー**して安全に保存

### 2. 開発者権限の確認

#### 必要なユーザー権限をチェック
1. **設定 > ユーザーとチーム** に移動
2. 自分のユーザーアカウントを選択
3. 以下の権限があることを確認：

**アカウント権限:**
- ☑️ アカウント設定への書き込みアクセス
- ☑️ 統合設定への書き込みアクセス

**CRM権限:**
- ☑️ すべてのCRMオブジェクトへの表示・編集アクセス
- ☑️ カスタムプロパティの作成・編集

**開発者権限:**
- ☑️ 開発者アカウント情報への書き込みアクセス

### 3. チーム権限の設定 (複数人開発の場合)

チームで開発する場合の権限設定：

1. **設定 > ユーザーとチーム > チーム** に移動
2. 開発チームを選択または作成
3. 以下の権限を付与：

**チーム権限:**
- ☑️ プライベートアプリの管理
- ☑️ 開発者設定へのアクセス
- ☑️ UI Extensionsの管理

## HubSpotでの設定

### 1. カスタムプロパティの作成

取引オブジェクトに以下のカスタムプロパティを追加：

- `invoice_number` (一行テキスト)
- `invoice_base_amount` (数値)
- `invoice_tax_rate` (数値)
- `invoice_tax_amount` (数値)
- `invoice_total_amount` (数値)
- `invoice_status` (ドロップダウン)
- `invoice_created_date` (日時)

### 2. UI Extensionの有効化

1. HubSpotアカウントにログイン
2. 設定 > アカウント設定 > 開発者設定
3. UI Extensionsタブで作成したエクステンションを有効化

## 使用方法

### 1. 請求書作成ボタンの表示

1. HubSpotで任意の取引を開く
2. 「Invoice Creator」タブが表示される
3. 「請求書を作成」ボタンをクリック

### 2. 請求書作成画面

1. 取引データが自動で読み込まれる
2. 必要に応じて情報を編集
3. 「請求書を作成」ボタンで保存

### 3. 作成された請求書の確認

- 取引のカスタムプロパティに請求書情報が保存される
- アクティビティタイムラインに請求書作成のノートが追加される

## トラブルシューティング

### 権限関連のエラー

#### 権限チェックリスト

開発前に以下を確認してください：

**✅ アカウントレベル権限**
- [ ] スーパー管理者権限 または 開発者権限
- [ ] アカウント設定への書き込み権限
- [ ] カスタムプロパティ作成権限

**✅ APIアクセス権限**
- [ ] プライベートアプリが作成済み
- [ ] 必要なOAuthスコープが有効
- [ ] アクセストークンが正しく設定

**✅ CRM権限**
- [ ] 取引オブジェクトへの読み取り・書き込み権限
- [ ] コンタクトオブジェクトへの読み取り権限
- [ ] アソシエーション（関連付け）への読み取り権限
- [ ] ノート作成権限

### よくある権限エラー

#### 1. `Insufficient permissions` エラー
```
Error: You don't have permission to access this resource
```
**解決方法:**
- プライベートアプリのスコープを確認
- ユーザーアカウントの権限を確認
- アクセストークンが正しく設定されているか確認

#### 2. `Property does not exist` エラー
```
Error: Property 'invoice_number' does not exist
```
**解決方法:**
- カスタムプロパティが作成されているか確認
- プロパティ名が正確であるか確認
- プロパティの作成権限があるか確認

#### 3. `Association not found` エラー
```
Error: No associations found between deal and contact
```
**解決方法:**
- 取引にコンタクトが関連付けられているか確認
- アソシエーション読み取り権限があるか確認

### よくある問題

1. **権限エラー**: HubSpotアカウントに必要な権限があることを確認
2. **API制限**: HubSpot APIの制限に達している場合は時間を置いて再試行
3. **データ取得エラー**: 取引にコンタクトが関連付けられていることを確認

### ログの確認

```bash
# Serverless関数のログを確認
hs logs

# 開発サーバーのログを確認
npm run dev -- --verbose
```

## API仕様

### getDealData関数

**入力**:
- `dealId`: 取引ID

**出力**:
```json
{
  "dealId": "string",
  "dealName": "string",
  "amount": "number",
  "contactName": "string",
  "contactEmail": "string",
  "taxRate": 0.1,
  "totalAmount": "number"
}
```

### createInvoice関数

**入力**:
- `dealId`: 取引ID
- `contactName`: コンタクト名
- `dealName`: 取引名
- `amount`: 基本金額
- `taxRate`: 税率

**出力**:
```json
{
  "success": true,
  "invoiceData": {
    "invoice_number": "string",
    "total_amount": "number"
  }
}
```
