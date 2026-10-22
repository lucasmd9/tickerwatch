const id=$input.first().json.spreadsheetId;if(!id)throw Error('Workbook was not created');
const h=['stock_id','issuer_id','ticker','exchange','yahoo_symbol','company','aliases','listing_country','currency','exposure_tags','exposure_evidence_url','reviewed_on','ir_domains'];
const samples=[
 ['AAPL:NASDAQ','apple','AAPL','NASDAQ','AAPL','Apple Inc','Apple','US','USD','','','','apple.com'],
 ['MSFT:NASDAQ','microsoft','MSFT','NASDAQ','MSFT','Microsoft Corporation','Microsoft','US','USD','','','','microsoft.com'],
 ['NVDA:NASDAQ','nvidia','NVDA','NASDAQ','NVDA','NVIDIA Corporation','Nvidia','US','USD','','','','nvidia.com'],
 ['ASML:AMS','asml','ASML','AMS','ASML.AS','ASML Holding','ASML','NL','EUR','','','','asml.com'],
 ['SAP:XETRA','sap','SAP','XETRA','SAP.DE','SAP SE','SAP SE','DE','EUR','','','','sap.com'],
 ['MC:PAR','lvmh','MC','PAR','MC.PA','LVMH','Louis Vuitton Moet Hennessy','FR','EUR','','','','lvmh.com'],
 ['SHEL:LSE','shell','SHEL','LSE','SHEL.L','Shell plc','Shell','GB','GBP','','','','shell.com'],
 ['7203:TSE','toyota','7203','TSE','7203.T','Toyota Motor','Toyota','JP','JPY','','','','global.toyota'],
 ['0700:HKEX','tencent','0700','HKEX','0700.HK','Tencent Holdings','Tencent','HK','HKD','','','','tencent.com'],
 ['NESN:SIX','nestle','NESN','SIX','NESN.SW','Nestle SA','Nestle|Nestlé','CH','CHF','','','','nestle.com']
];
return [{json:{spreadsheet_id:id,body:{valueInputOption:'RAW',data:[{range:'Universe!A1:M11',values:[h,...samples]},...['Events','ImpactLinks','Earnings','Runs','Briefings','Meta'].map(t=>({range:t+'!A1:B1',values:[['key','json']]}))]}}}];
