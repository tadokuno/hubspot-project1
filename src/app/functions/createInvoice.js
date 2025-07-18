// 請求書作成用のServerless関数
exports.main = async (context, sendResponse) => {
  const { dealId, contactName, dealName, amount, taxRate } = context.parameters;
  
  try {
    // HubSpot APIクライアントを初期化
    const hubspotClient = context.hubspotApi;
    
    // 基本計算
    const baseAmount = parseFloat(amount);
    const taxAmount = baseAmount * taxRate;
    const totalAmount = baseAmount + taxAmount;
    
    // 請求書データを作成（カスタムオブジェクトまたは取引のカスタムプロパティとして保存）
    const invoiceData = {
      invoice_number: `INV-${Date.now()}`, // 簡易的な請求書番号
      deal_id: dealId,
      contact_name: contactName,
      deal_name: dealName,
      base_amount: baseAmount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      created_date: new Date().toISOString(),
      status: 'draft'
    };
    
    // 請求書情報を取引のカスタムプロパティとして保存
    // 実際の実装では、カスタムオブジェクトを作成することを推奨
    await hubspotClient.crm.deals.basicApi.update(dealId, {
      properties: {
        invoice_number: invoiceData.invoice_number,
        invoice_base_amount: invoiceData.base_amount.toString(),
        invoice_tax_rate: invoiceData.tax_rate.toString(),
        invoice_tax_amount: invoiceData.tax_amount.toString(),
        invoice_total_amount: invoiceData.total_amount.toString(),
        invoice_status: invoiceData.status,
        invoice_created_date: invoiceData.created_date
      }
    });
    
    // 請求書作成完了のノートを追加
    await hubspotClient.crm.objects.notes.basicApi.create({
      properties: {
        hs_note_body: `請求書が作成されました。
        
請求書番号: ${invoiceData.invoice_number}
取引名: ${dealName}
請求先: ${contactName}
基本金額: ¥${baseAmount.toLocaleString()}
税率: ${(taxRate * 100).toFixed(1)}%
税額: ¥${taxAmount.toLocaleString()}
合計金額: ¥${totalAmount.toLocaleString()}
        
作成日時: ${new Date(invoiceData.created_date).toLocaleString('ja-JP')}`,
        hs_note_source: 'API',
        hs_note_source_id: 'invoice-creator-extension'
      },
      associations: [
        {
          to: { id: dealId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 214 // Note to Deal association
            }
          ]
        }
      ]
    });
    
    sendResponse({
      statusCode: 200,
      body: {
        success: true,
        message: '請求書が正常に作成されました',
        invoiceData: invoiceData
      }
    });
    
  } catch (error) {
    console.error('Error creating invoice:', error);
    
    sendResponse({
      statusCode: 500,
      body: {
        error: 'Failed to create invoice',
        message: error.message
      }
    });
  }
};
