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

    // 2. Access protected endpoint through proxy
    const protectedRes = await axios.get('http://localhost:5173/api/v1/customers/my', {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    console.log('Protected endpoint response status:', protectedRes.status);
    console.log('Protected endpoint response data:', protectedRes.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.status + ' ' + err.response.data.message : err.message);
  }
}

test();
