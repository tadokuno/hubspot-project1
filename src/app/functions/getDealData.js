// 取引データを取得するServerless関数
exports.main = async (context, sendResponse) => {
  const { dealId } = context.parameters;
  
  try {
    // HubSpot APIクライアントを初期化
    const hubspotClient = context.hubspotApi;
    
    // 取引データを取得
    const dealResponse = await hubspotClient.crm.deals.basicApi.getById(
      dealId,
      ['dealname', 'amount', 'dealstage', 'closedate']
    );
    
    const deal = dealResponse.body;
    
    // 取引に関連するコンタクトを取得
    const associationsResponse = await hubspotClient.crm.associations.basicApi.getPage(
      'deals',
      dealId,
      'contacts'
    );
    
    let contactData = null;
    if (associationsResponse.body.results && associationsResponse.body.results.length > 0) {
      const contactId = associationsResponse.body.results[0].id;
      
      // コンタクトの詳細データを取得
      const contactResponse = await hubspotClient.crm.contacts.basicApi.getById(
        contactId,
        ['firstname', 'lastname', 'email', 'company']
      );
      
      contactData = contactResponse.body;
    }
    
    // レスポンスデータを整形
    const responseData = {
      dealId: deal.id,
      dealName: deal.properties.dealname || '取引名未設定',
      amount: parseFloat(deal.properties.amount || 0),
      dealStage: deal.properties.dealstage,
      closeDate: deal.properties.closedate,
      contactName: contactData ? 
        `${contactData.properties.firstname || ''} ${contactData.properties.lastname || ''}`.trim() : 
        'コンタクト未設定',
      contactEmail: contactData?.properties.email || '',
      contactCompany: contactData?.properties.company || '',
      contactId: contactData?.id || null,
      // 税率は10%固定
      taxRate: 0.1,
      // 税込金額を計算
      totalAmount: parseFloat(deal.properties.amount || 0) * 1.1
    };
    
    sendResponse({
      statusCode: 200,
      body: responseData
    });
    
  } catch (error) {
    console.error('Error fetching deal data:', error);
    
    sendResponse({
      statusCode: 500,
      body: {
        error: 'Failed to fetch deal data',
        message: error.message
      }
    });
  }
};
