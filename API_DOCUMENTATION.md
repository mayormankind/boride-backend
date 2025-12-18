# BoRide Backend API Documentation

## Overview
BoRide is a campus ride-hailing platform that connects students and drivers. This document provides comprehensive API documentation for both student and driver endpoints.

---

## Base URL
```
http://localhost:5000/api
```

---

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Student Endpoints

### 1. Register Student
**POST** `/student/register`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@university.edu",
  "matricNo": "CSC/2020/001",
  "password": "securePassword123",
  "phoneNo": "+2348012345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to email.",
  "studentId": "64abc123def456..."
}
```

---

### 2. Verify Email
**POST** `/student/verify-email`

**Request Body:**
```json
{
  "email": "john.doe@university.edu",
  "otp": "123456"
}
```

---

### 3. Resend OTP
**POST** `/student/resend-otp`

**Request Body:**
```json
{
  "email": "john.doe@university.edu"
}
```

---

### 4. Login
**POST** `/student/login`

**Request Body:**
```json
{
  "email": "john.doe@university.edu",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "student": {
    "id": "64abc123def456...",
    "fullName": "John Doe",
    "email": "john.doe@university.edu",
    "matricNo": "CSC/2020/001"
  }
}
```

---

### 5. Update Profile
**PUT** `/student/profile`
**Auth Required:** Yes

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "phoneNo": "+2348012345678",
  "department": "Computer Science",
  "level": "400",
  "profileImage": "https://cloudinary.com/..."
}
```

---

### 6. Book a Ride
**POST** `/student/rides`
**Auth Required:** Yes

**Request Body:**
```json
{
  "pickupLocation": {
    "address": "Faculty of Science",
    "coordinates": {
      "latitude": 6.5244,
      "longitude": 3.3792
    }
  },
  "dropoffLocation": {
    "address": "Main Gate",
    "coordinates": {
      "latitude": 6.5288,
      "longitude": 3.3800
    }
  },
  "fare": 500,
  "paymentMethod": "Wallet",
  "estimatedDistance": 2.5,
  "estimatedDuration": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ride booked successfully",
  "ride": {
    "id": "64abc789...",
    "status": "pending",
    "pickupLocation": {...},
    "dropoffLocation": {...},
    "fare": 500,
    "paymentMethod": "Wallet"
  }
}
```

**Error (Insufficient Balance):**
```json
{
  "success": false,
  "message": "Insufficient wallet balance",
  "walletBalance": 200,
  "requiredAmount": 500
}
```

---

### 7. Get Student's Rides
**GET** `/student/rides?status=pending`
**Auth Required:** Yes

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `accepted`, `ongoing`, `completed`, `cancelled`)

---

### 8. Get Ride Details
**GET** `/student/rides/:rideId`
**Auth Required:** Yes

---

### 9. Cancel Ride
**PUT** `/student/rides/:rideId/cancel`
**Auth Required:** Yes

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

---

### 10. Rate Ride
**PUT** `/student/rides/:rideId/rate`
**Auth Required:** Yes

**Request Body:**
```json
{
  "rating": 5,
  "review": "Great driver, smooth ride!"
}
```

---

### 11. Get Wallet Balance
**GET** `/student/wallet`
**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "balance": 1500,
  "wallet": {
    "user": "64abc123...",
    "userType": "Student",
    "balance": 1500,
    "transactions": [...]
  }
}
```

---

### 12. Get Transaction History
**GET** `/student/wallet/transactions?limit=20&page=1`
**Auth Required:** Yes

---

### 13. Fund Wallet
**POST** `/student/wallet/fund`
**Auth Required:** Yes

**Request Body:**
```json
{
  "amount": 1000,
  "paymentReference": "PAY_123456789"
}
```

---

## Driver Endpoints

### 1. Register Driver
**POST** `/driver/register`

**Request Body:**
```json
{
  "fullName": "Jane Driver",
  "email": "jane.driver@email.com",
  "password": "securePassword123",
  "phoneNo": "+2348098765432"
}
```

---

### 2. Verify Email
**POST** `/driver/verify-email`

**Request Body:**
```json
{
  "email": "jane.driver@email.com",
  "otp": "123456"
}
```

---

### 3. Resend OTP
**POST** `/driver/resend-otp`

---

### 4. Login
**POST** `/driver/login`

**Request Body:**
```json
{
  "email": "jane.driver@email.com",
  "password": "securePassword123"
}
```

---

### 5. Update Profile
**PUT** `/driver/profile`
**Auth Required:** Yes

**Request Body:**
```json
{
  "fullName": "Jane Driver Updated",
  "phoneNo": "+2348098765432",
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Corolla",
    "plateNumber": "ABC-123-XY",
    "color": "Silver",
    "year": 2020
  },
  "licenseNumber": "DL-123456",
  "profileImage": "https://cloudinary.com/..."
}
```

---

### 6. Toggle Availability
**PUT** `/driver/availability`
**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "message": "Availability set to available",
  "isAvailable": true
}
```

---

### 7. Get Available Rides
**GET** `/driver/rides/available`
**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "count": 5,
  "rides": [
    {
      "id": "64abc789...",
      "student": {
        "fullName": "John Doe",
        "phoneNo": "+2348012345678"
      },
      "pickupLocation": {...},
      "dropoffLocation": {...},
      "fare": 500,
      "status": "pending"
    }
  ]
}
```

---

### 8. Accept Ride
**PUT** `/driver/rides/:rideId/accept`
**Auth Required:** Yes

**Request Body:**
```json
{
  "estimatedArrival": 5
}
```

---

### 9. Get Driver's Rides
**GET** `/driver/rides?status=accepted`
**Auth Required:** Yes

---

### 10. Get Ride Details
**GET** `/driver/rides/:rideId`
**Auth Required:** Yes

---

### 11. Start Ride
**PUT** `/driver/rides/:rideId/start`
**Auth Required:** Yes

---

### 12. Complete Ride
**PUT** `/driver/rides/:rideId/complete`
**Auth Required:** Yes

**Request Body:**
```json
{
  "actualDistance": 2.3,
  "actualDuration": 12
}
```

**Note:** For wallet payments, this endpoint automatically:
- Deducts fare from student's wallet
- Credits driver's wallet
- Updates transaction history for both parties

---

### 13. Cancel Ride
**PUT** `/driver/rides/:rideId/cancel`
**Auth Required:** Yes

---

### 14. Get Wallet Balance
**GET** `/driver/wallet`
**Auth Required:** Yes

---

### 15. Get Transaction History
**GET** `/driver/wallet/transactions?limit=20&page=1`
**Auth Required:** Yes

---

### 16. Withdraw from Wallet
**POST** `/driver/wallet/withdraw`
**Auth Required:** Yes

**Request Body:**
```json
{
  "amount": 5000,
  "bankDetails": {
    "accountName": "Jane Driver",
    "accountNumber": "0123456789",
    "bankName": "First Bank"
  }
}
```

---

## Payment Methods

### Cash Payment
- Student selects "Cash" as payment method when booking
- Payment is collected directly by driver upon completion
- No wallet transactions are created

### Wallet Payment
- Student selects "Wallet" as payment method when booking
- System checks if student has sufficient balance
- If insufficient, booking is rejected with error message
- Upon ride completion:
  - Amount is deducted from student's wallet
  - Amount is added to driver's wallet
  - Transaction history is updated for both parties

---

## Email Notifications

The system sends automated emails for:
1. **OTP Verification** - When registering (Student/Driver)
2. **Login Notification** - Security alert for each login
3. **Ride Booked** - Confirmation to student
4. **Ride Accepted** - Notification with driver details
5. **Ride Completed** - Trip summary and payment details

All emails use branded EJS templates with BoRide styling.

---

## Models

### Ride Status Flow
```
pending → accepted → ongoing → completed
         ↓
      cancelled
```

### Wallet Transaction Types
- **credit**: Money added to wallet
- **debit**: Money deducted from wallet

---

## Error Handling

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (in development)"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Frontend Integration Notes

### Insufficient Balance Modal
When a student attempts to book a ride with wallet payment but has insufficient funds:

```javascript
// Example error handling
try {
  const response = await fetch('/api/student/rides', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(rideData)
  });
  
  const data = await response.json();
  
  if (!data.success && data.message === "Insufficient wallet balance") {
    // Show modal with:
    // - Current balance: data.walletBalance
    // - Required amount: data.requiredAmount
    // - Option to fund wallet
    showInsufficientBalanceModal(data);
  }
} catch (error) {
  console.error(error);
}
```

---

## Environment Variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
DEV_PORT=5000
```

---

## Additional Notes

1. All timestamps are in ISO 8601 format
2. Coordinates use standard lat/long format
3. Currency is in Nigerian Naira (₦)
4. Phone numbers should include country code
5. OTP expires in 15 minutes
6. JWT tokens expire in 3 days
