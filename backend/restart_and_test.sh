#!/bin/bash
echo "Killing existing spring-boot..."
pkill -f spring-boot
sleep 2

echo "Starting spring-boot in background..."
./mvnw spring-boot:run > app.log 2>&1 &
APP_PID=$!
echo "Started with PID $APP_PID"

echo "Waiting for backend to start..."
for i in {1..30}; do
  if grep -q "Started LuxeSuiteApplication" app.log; then
    echo "Backend started!"
    break
  fi
  sleep 1
done

echo "Testing curl..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@luxesuite.com", "password":"password123"}' | jq -r .accessToken)

echo "Got token..."

curl -s -X POST http://localhost:8080/api/v1/wallet/razorpay/create-order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50}' -v

echo "Testing curl done!"
