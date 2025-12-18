# BoRide Backend API 🚗

> Your Campus Ride, Simplified

A comprehensive ride-hailing backend API for campus transportation, built with Node.js, Express, and MongoDB.

## Features ✨

### Authentication & Security
- ✅ Email OTP verification for both students and drivers
- ✅ JWT-based authentication
- ✅ Unified verification logic
- ✅ Security email notifications
- ✅ Password hashing with bcrypt

### Email System
- ✅ Branded EJS email templates
- ✅ Segmented layouts (header/footer)
- ✅ OTP verification emails
- ✅ Login notifications
- ✅ Ride booking confirmations
- ✅ Ride acceptance notifications
- ✅ Trip completion summaries

### Ride Management
- ✅ Student ride booking
- ✅ Driver ride acceptance
- ✅ Real-time ride status tracking
- ✅ Ride cancellation with reasons
- ✅ Rating and review system
- ✅ Ride history for both parties

### Payment System
- ✅ Cash payment option
- ✅ Wallet payment system
- ✅ Automatic fund transfer on ride completion
- ✅ Insufficient balance detection with modal support
- ✅ Transaction history
- ✅ Wallet funding (students)
- ✅ Wallet withdrawal (drivers)

### Profile Management
- ✅ Student profile updates
- ✅ Driver profile updates
- ✅ Vehicle information management
- ✅ Profile image support
- ✅ Driver availability toggle

## Tech Stack 🛠️

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Email:** Nodemailer with EJS templates
- **Security:** Helmet, bcryptjs
- **Others:** CORS, dotenv

## Installation 📦

1. **Clone the repository**
```bash
git clone <repository-url>
cd boride-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb+srv://your_connection_string
JWT_SECRET=your_jwt_secret_key
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
DEV_PORT=5000
```

4. **Run the server**
```bash
# Development
npm run dev

# Production
npm run local
```

The server will start on `http://localhost:5000`

## Project Structure 📁

```
boride-backend/
├── controllers/
│   ├── studentController.js    # Student auth & profile
│   ├── driverController.js     # Driver auth & profile
│   ├── rideController.js       # Ride management
│   └── walletController.js     # Wallet operations
├── models/
│   ├── student.js              # Student schema
│   ├── driver.js               # Driver schema
│   ├── ride.js                 # Ride schema
│   └── wallet.js               # Wallet schema
├── routes/
│   ├── studentRoutes.js        # Student API routes
│   └── driverRoutes.js         # Driver API routes
├── middleware/
│   └── auth.js                 # JWT authentication
├── views/
│   └── emails/
│       ├── layout/
│       │   ├── header.ejs      # Email header
│       │   └── footer.ejs      # Email footer
│       ├── otp-verification.ejs
│       ├── login-notification.ejs
│       ├── ride-booked.ejs
│       ├── ride-accepted.ejs
│       └── ride-completed.ejs
├── utils/
│   ├── mailer.js               # Email service
│   ├── jwts.js                 # JWT utilities
│   └── validator.js            # Input validators
├── db/
│   └── conn.js                 # MongoDB connection
├── server.js                   # App entry point
└── package.json
```

## API Endpoints 🚀

### Student Routes
```
POST   /api/student/register
POST   /api/student/verify-email
POST   /api/student/resend-otp
POST   /api/student/login
PUT    /api/student/profile               [Protected]
POST   /api/student/rides                 [Protected]
GET    /api/student/rides                 [Protected]
GET    /api/student/rides/:rideId         [Protected]
PUT    /api/student/rides/:rideId/cancel  [Protected]
PUT    /api/student/rides/:rideId/rate    [Protected]
GET    /api/student/wallet                [Protected]
GET    /api/student/wallet/transactions   [Protected]
POST   /api/student/wallet/fund           [Protected]
```

### Driver Routes
```
POST   /api/driver/register
POST   /api/driver/verify-email
POST   /api/driver/resend-otp
POST   /api/driver/login
PUT    /api/driver/profile                [Protected]
PUT    /api/driver/availability           [Protected]
GET    /api/driver/rides/available        [Protected]
GET    /api/driver/rides                  [Protected]
GET    /api/driver/rides/:rideId          [Protected]
PUT    /api/driver/rides/:rideId/accept   [Protected]
PUT    /api/driver/rides/:rideId/start    [Protected]
PUT    /api/driver/rides/:rideId/complete [Protected]
PUT    /api/driver/rides/:rideId/cancel   [Protected]
GET    /api/driver/wallet                 [Protected]
GET    /api/driver/wallet/transactions    [Protected]
POST   /api/driver/wallet/withdraw        [Protected]
```

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Database Models 🗄️

### Student
- Personal information (name, email, matric number)
- Authentication (password, OTP, verification status)
- Profile (image, department, level)

### Driver
- Personal information (name, email, phone)
- Vehicle information (make, model, plate number, color)
- Status (availability, verification, rating)
- Authentication (password, OTP, verification status)

### Ride
- Locations (pickup & dropoff with coordinates)
- Payment (method, fare)
- Status (pending, accepted, ongoing, completed, cancelled)
- Metrics (distance, duration)
- Reviews (rating, comments)

### Wallet
- User reference (polymorphic - Student/Driver)
- Balance tracking
- Transaction history with full audit trail

## Payment Flow 💰

### Wallet Payment
1. Student books ride with "Wallet" payment method
2. System checks balance immediately
3. If insufficient → Return error with current balance
4. If sufficient → Create pending ride
5. On ride completion:
   - Deduct from student wallet
   - Credit to driver wallet
   - Record transactions for both
   - Send email confirmations

### Cash Payment
1. Student books ride with "Cash" payment method
2. No balance check required
3. Driver collects payment upon completion
4. No wallet transactions created

## Email Templates 📧

All emails feature:
- Consistent BoRide branding
- Purple gradient color scheme
- Responsive design
- Professional typography
- Clear call-to-actions

Email types:
1. **OTP Verification** - Welcome & verify account
2. **Login Notification** - Security alert
3. **Ride Booked** - Booking confirmation
4. **Ride Accepted** - Driver details & ETA
5. **Ride Completed** - Trip summary & receipt

## Frontend Integration 🔗

### Authentication Example
```javascript
// Login
const response = await fetch('http://localhost:5000/api/student/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token, student } = await response.json();
localStorage.setItem('token', token);
```

### Booking with Insufficient Balance
```javascript
// The API will return
{
  "success": false,
  "message": "Insufficient wallet balance",
  "walletBalance": 200,
  "requiredAmount": 500
}

// Show modal:
// "Your wallet balance (₦200) is insufficient. 
// You need ₦500 to book this ride. 
// Would you like to fund your wallet?"
```

## Development Tips 💡

1. **Testing Emails:** Use a service like Mailtrap for development
2. **MongoDB:** Use MongoDB Atlas for cloud database
3. **Environment:** Never commit `.env.local` to version control
4. **CORS:** Update CORS settings for production frontend URL
5. **Rate Limiting:** Consider adding rate limiting for production

## Security Best Practices 🔒

- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens expire after 3 days
- ✅ OTPs expire after 15 minutes
- ✅ Protected routes require valid JWT
- ✅ Email verification required before login
- ✅ Helmet.js for security headers
- ✅ Input validation on all endpoints

## Future Enhancements 🚀

- [ ] Real-time location tracking with Socket.io
- [ ] Push notifications
- [ ] Payment gateway integration (Paystack/Flutterwave)
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Driver verification system
- [ ] Surge pricing
- [ ] Promo codes and referrals

## Contributing 🤝

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License 📄

This project is licensed under the ISC License.

## Support 📞

For issues or questions:
- Email: support@boride.com
- GitHub Issues: [Create an issue]

---

Made with ❤️ for campus transportation
