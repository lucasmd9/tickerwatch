const c=JSON.parse(JSON.stringify($('Build updates').first().json));delete c.body;return [{json:c}];
