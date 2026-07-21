const axios = require('axios');

async function test() {
  try {
    // 1. Login to get cookies through proxy
    const loginRes = await axios.post('http://localhost:5173/api/v1/auth/login', {
      email: 'test_login@luxesuite.com',
      password: 'Password123!'
    });
    
    const cookies = loginRes.headers['set-cookie'];
    console.log('Cookies received from proxy:', cookies);

    // 2. Try refresh endpoint
    const refreshRes = await axios.post('http://localhost:5173/api/v1/auth/refresh', {}, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    console.log('Refresh endpoint response status:', refreshRes.status);
    console.log('Refresh endpoint response data:', refreshRes.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.status + ' ' + err.response.data : err.message);
  }
}

test();
