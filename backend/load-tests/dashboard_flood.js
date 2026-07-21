import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '5s', target: 200 }, // Ramp up to 200 users over 5 seconds
        { duration: '10s', target: 1000 }, // Ramp up to 1000 users over 10 seconds
        { duration: '15s', target: 1000 }, // Hold at 1000 users for 15 seconds
        { duration: '5s', target: 0 }, // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<300'], // 95% of requests must complete below 300ms
        http_req_failed: ['rate<0.01'], // Less than 1% errors
    },
};

export function setup() {
    // Ideally we would get a JWT token here.
    // Assuming the test profile disables security or we have a hardcoded token.
    // For this test, let's assume the endpoint returns 401 but we just want to load the DB?
    // Actually, we need a valid JWT. We can login first.
    const loginRes = http.post('http://localhost:8080/api/v1/auth/login', JSON.stringify({
        email: 'admin@luxesuite.com',
        password: 'password123'
    }), { headers: { 'Content-Type': 'application/json' } });
    
    // Extract JWT from the HttpOnly cookie (k6 handles cookies automatically for subsequent requests)
    return { };
}

export default function () {
    const res = http.get('http://localhost:8080/api/v1/appointments/branch/1?page=0&size=50');
    
    check(res, {
        'status is 200': (r) => r.status === 200,
    });
    
    sleep(1); // Think time
}
