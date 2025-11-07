# Auth-Gated App Testing Playbook

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API
```bash
curl -X GET "${REACT_APP_BACKEND_URL}/api/auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

curl -X GET "${REACT_APP_BACKEND_URL}/api/tarjetas" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Critical: MongoDB ID Schema
MongoDB + Pydantic ID Mapping:
- Use 'id' field in Pydantic models
- MongoDB stores as '_id'
- User sessions reference user_id (matches user.id)

## Checklist
- User document has id field
- Session user_id matches user's id
- Both use string IDs
- API returns user data
- Dashboard loads without redirect