import React, { useState } from 'react';
import {
  Button,
  Flex,
  Text,
  Alert,
  LoadingSpinner,
  hubspot
} from '@hubspot/ui-extensions';

// HubSpotのUI Extensionコンポーネント
hubspot.extend(({ context, runServerlessFunction }) => (
  <InvoiceCreatorExtension
    context={context}
    runServerlessFunction={runServerlessFunction}
  />
));

const InvoiceCreatorExtension = ({ context, runServerlessFunction }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 請求書作成ボタンクリック時の処理
  const handleCreateInvoice = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // 現在の取引IDを取得
      const dealId = context.crm.objectId;
      
      // Serverless関数を呼び出して取引データを取得
      const result = await runServerlessFunction({
        name: 'getDealData',
        parameters: { dealId }
      });

      if (result.response) {
        // 請求書作成画面に遷移
        const invoiceData = result.response;
        
        // 新しいタブまたはモーダルで請求書作成画面を開く
        await runServerlessFunction({
          name: 'createInvoice',
          parameters: {
            dealId,
            contactName: invoiceData.contactName,
            dealName: invoiceData.dealName,
            amount: invoiceData.amount,
            taxRate: 0.1 // 10%固定
          }
        });

        setSuccess('請求書が正常に作成されました！');
      } else {
        throw new Error('取引データの取得に失敗しました');
      }
    } catch (err) {
      setError(`エラーが発生しました: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex direction="column" gap="md">
      <Text variant="microcopy">
        この取引の情報を使用して請求書を作成します。
      </Text>
      
      {error && (
        <Alert title="エラー" variant="error">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert title="成功" variant="success">
          {success}
        </Alert>
      )}

      <Button
        variant="primary"
        onClick={handleCreateInvoice}
        disabled={isLoading}
      >
        {isLoading ? (
          <Flex align="center" gap="xs">
            <LoadingSpinner size="xs" />
            <Text>処理中...</Text>
          </Flex>
        ) : (
          '請求書を作成'
        )}
      </Button>
    </Flex>
  );
};

export default InvoiceCreatorExtension;
