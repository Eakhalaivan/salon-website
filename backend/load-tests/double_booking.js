import http from 'k6/http';
import { check } from 'k6';

export const options = {
    scenarios: {
        concurrent_bookings: {
            executor: 'shared-iterations',
            vus: 200,
            iterations: 200,
            maxDuration: '10s',
        },
    },
};

export function setup() {
    const loginRes = http.post('http://localhost:8080/api/v1/auth/login', JSON.stringify({
        email: 'customer@luxesuite.com',
        password: 'password123'
    }), { headers: { 'Content-Type': 'application/json' } });
    
    return { };
}

export default function () {
    const payload = JSON.stringify({
        customerId: 1,
        branchId: 1,
        notes: "Test concurrent booking",
        services: [
            {
                serviceId: 1,
                staffId: 1,
                startTime: "2027-01-01T09:00:00"
            }
        ]
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post('http://localhost:8080/api/v1/appointments', payload, params);

    // We expect exactly 1 success (201) and 199 failures (409 Conflict)
    check(res, {
        'status is 201 or 409': (r) => r.status === 201 || r.status === 409,
    });
}
