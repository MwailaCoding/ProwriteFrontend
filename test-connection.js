// Simple script to test connection to PythonAnywhere backend
const https = require('https');

console.log('🔍 Testing connection to PythonAnywhere backend...');

const options = {
  hostname: 'prowrite.pythonanywhere.com',
  port: 443,
  path: '/',
  method: 'GET',
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log(`✅ Connection successful! Status: ${res.statusCode}`);
  console.log(`📡 Response headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📄 Response body: ${data}`);
    console.log('🎉 Backend is accessible!');
  });
});

req.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
});

req.on('timeout', () => {
  console.error('⏰ Connection timeout');
  req.destroy();
});

req.end();

