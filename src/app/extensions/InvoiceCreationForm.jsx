import React, { useState, useEffect } from 'react';
import {
  Button,
  Flex,
  Text,
  Input,
  Form,
  FormLabel,
  Alert,
  LoadingSpinner,
  Divider,
  hubspot
} from '@hubspot/ui-extensions';

// 請求書作成画面のUI Extension
hubspot.extend(({ context, runServerlessFunction }) => (
  <InvoiceCreationForm
    context={context}
    runServerlessFunction={runServerlessFunction}
  />
));

const InvoiceCreationForm = ({ context, runServerlessFunction }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // フォームデータ
  const [formData, setFormData] = useState({
    dealId: '',
    contactName: '',
    dealName: '',
    baseAmount: 0,
    taxRate: 0.1,
    taxAmount: 0,
    totalAmount: 0,
    invoiceNumber: '',
    notes: ''
  });

  // 初期データ読み込み
  useEffect(() => {
    loadInitialData();
  }, []);

  // 金額変更時の税額・合計金額再計算
  useEffect(() => {
    const baseAmount = parseFloat(formData.baseAmount) || 0;
    const taxAmount = baseAmount * formData.taxRate;
    const totalAmount = baseAmount + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      taxAmount: taxAmount,
      totalAmount: totalAmount
    }));
  }, [formData.baseAmount, formData.taxRate]);

  const loadInitialData = async () => {
    try {
      const dealId = context.crm.objectId;
      
      const result = await runServerlessFunction({
        name: 'getDealData',
        parameters: { dealId }
      });

      if (result.response) {
        const data = result.response;
        setFormData(prev => ({
          ...prev,
          dealId: data.dealId,
          contactName: data.contactName,
          dealName: data.dealName,
          baseAmount: data.amount,
          taxRate: data.taxRate,
          invoiceNumber: `INV-${Date.now()}`
        }));
      }
    } catch (err) {
      setError(`データの読み込みに失敗しました: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveInvoice = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await runServerlessFunction({
        name: 'createInvoice',
        parameters: {
          dealId: formData.dealId,
          contactName: formData.contactName,
          dealName: formData.dealName,
          amount: formData.baseAmount,
          taxRate: formData.taxRate,
          invoiceNumber: formData.invoiceNumber,
          notes: formData.notes
        }
      });

      if (result.response && result.response.success) {
        setSuccess('請求書が正常に作成されました！');
      } else {
        throw new Error('請求書の作成に失敗しました');
      }
    } catch (err) {
      setError(`エラーが発生しました: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Flex direction="column" align="center" gap="md">
        <LoadingSpinner size="md" />
        <Text>データを読み込み中...</Text>
      </Flex>
    );
  }

  return (
    <Form>
      <Flex direction="column" gap="md">
        <Text variant="h3">請求書作成</Text>
        
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

        <Divider />

        {/* 請求書番号 */}
        <Flex direction="column" gap="xs">
          <FormLabel>請求書番号</FormLabel>
          <Input
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={(value) => handleInputChange('invoiceNumber', value)}
            placeholder="請求書番号を入力"
          />
        </Flex>

        {/* 請求先情報 */}
        <Flex direction="column" gap="xs">
          <FormLabel>請求先（コンタクト）</FormLabel>
          <Input
            name="contactName"
            value={formData.contactName}
            onChange={(value) => handleInputChange('contactName', value)}
            placeholder="請求先名を入力"
          />
        </Flex>

        {/* 取引名 */}
        <Flex direction="column" gap="xs">
          <FormLabel>取引名</FormLabel>
          <Input
            name="dealName"
            value={formData.dealName}
            onChange={(value) => handleInputChange('dealName', value)}
            placeholder="取引名を入力"
          />
        </Flex>

        <Divider />

        {/* 金額情報 */}
        <Text variant="h4">金額情報</Text>
        
        <Flex direction="column" gap="xs">
          <FormLabel>基本金額（税抜）</FormLabel>
          <Input
            name="baseAmount"
            type="number"
            value={formData.baseAmount}
            onChange={(value) => handleInputChange('baseAmount', parseFloat(value) || 0)}
            placeholder="基本金額を入力"
          />
        </Flex>

        <Flex direction="column" gap="xs">
          <FormLabel>税率</FormLabel>
          <Input
            name="taxRate"
            type="number"
            value={formData.taxRate * 100}
            onChange={(value) => handleInputChange('taxRate', (parseFloat(value) || 0) / 100)}
            placeholder="税率を入力"
            suffix="%"
          />
        </Flex>

        <Flex direction="column" gap="xs">
          <FormLabel>税額</FormLabel>
          <Text>¥{formData.taxAmount.toLocaleString()}</Text>
        </Flex>

        <Flex direction="column" gap="xs">
          <FormLabel>合計金額（税込）</FormLabel>
          <Text variant="h4">¥{formData.totalAmount.toLocaleString()}</Text>
        </Flex>

        <Divider />

        {/* 備考 */}
        <Flex direction="column" gap="xs">
          <FormLabel>備考</FormLabel>
          <Input
            name="notes"
            value={formData.notes}
            onChange={(value) => handleInputChange('notes', value)}
            placeholder="備考を入力（任意）"
          />
        </Flex>

        {/* 保存ボタン */}
        <Button
          variant="primary"
          onClick={handleSaveInvoice}
          disabled={isSaving}
        >
          {isSaving ? (
            <Flex align="center" gap="xs">
              <LoadingSpinner size="xs" />
              <Text>保存中...</Text>
            </Flex>
          ) : (
            '請求書を作成'
          )}
        </Button>
      </Flex>
    </Form>
  );
};

export default InvoiceCreationForm;
