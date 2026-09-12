const http = require('http');

function testLogin(email, password) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.success) {
            console.log(`[PASS] ${email} (Role: ${parsed.data.user.role}) - Token received: ${parsed.data.tokens.accessToken.substring(0, 15)}...`);
          } else {
            console.log(`[FAIL] ${email} -> ${parsed.error?.message}`);
          }
        } catch(e) {
          console.log(`[ERROR] ${email} -> ${body}`);
        }
        resolve();
      });
    });
    req.on('error', (err) => {
      console.error(`[CONN ERROR] ${email}: ${err.message}`);
      resolve();
    });
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing PayFlow Credentials (PayFlow2025!) ---');
  await testLogin('customer@payflow.com', 'PayFlow2025!');
  await testLogin('merchant@payflow.com', 'PayFlow2025!');
  await testLogin('admin@payflow.com', 'PayFlow2025!');
  await testLogin('ops@payflow.com', 'PayFlow2025!');

  console.log('\n--- 2. Testing Legacy Demo Credentials (Password123!) ---');
  await testLogin('customer@demo.com', 'Password123!');
  await testLogin('merchant@demo.com', 'Password123!');
  await testLogin('admin@demo.com', 'Password123!');
  await testLogin('operations@demo.com', 'Password123!');

  console.log('\n--- 3. Testing Cross-Compatibility & Alternates ---');
  await testLogin('customer@payflow.com', 'Password123!');
  await testLogin('customer@demo.com', 'PayFlow2025!');
  await testLogin('ops@payflow.com', 'Password123!');
}

run();
