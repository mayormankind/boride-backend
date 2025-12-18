# Frontend Integration Guide

This guide provides quick reference code snippets for integrating the BoRide backend with your Next.js frontend.

## Setup

### 1. Create API Client

Create `lib/api.ts` in your frontend:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class BoRideAPI {
  private static getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Student Auth
  static async studentRegister(data: {
    fullName: string;
    email: string;
    matricNo: string;
    password: string;
    phoneNo: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/student/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async studentVerifyEmail(email: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/student/verify-email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, otp }),
    });
    return response.json();
  }

  static async studentLogin(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/student/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  static async studentUpdateProfile(data: any) {
    const response = await fetch(`${API_BASE_URL}/student/profile`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Driver Auth
  static async driverRegister(data: {
    fullName: string;
    email: string;
    password: string;
    phoneNo: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/driver/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async driverVerifyEmail(email: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/driver/verify-email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, otp }),
    });
    return response.json();
  }

  static async driverLogin(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/driver/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  static async driverUpdateProfile(data: any) {
    const response = await fetch(`${API_BASE_URL}/driver/profile`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async driverToggleAvailability() {
    const response = await fetch(`${API_BASE_URL}/driver/availability`, {
      method: 'PUT',
      headers: this.getHeaders(true),
    });
    return response.json();
  }

  // Rides - Student
  static async bookRide(data: {
    pickupLocation: {
      address: string;
      coordinates: { latitude: number; longitude: number };
    };
    dropoffLocation: {
      address: string;
      coordinates: { latitude: number; longitude: number };
    };
    fare: number;
    paymentMethod: 'Cash' | 'Wallet';
    estimatedDistance?: number;
    estimatedDuration?: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/student/rides`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async getStudentRides(status?: string) {
    const url = status
      ? `${API_BASE_URL}/student/rides?status=${status}`
      : `${API_BASE_URL}/student/rides`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return response.json();
  }

  static async cancelRide(rideId: string, reason: string, userType: 'student' | 'driver') {
    const response = await fetch(`${API_BASE_URL}/${userType}/rides/${rideId}/cancel`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ reason }),
    });
    return response.json();
  }

  static async rateRide(rideId: string, rating: number, review?: string) {
    const response = await fetch(`${API_BASE_URL}/student/rides/${rideId}/rate`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ rating, review }),
    });
    return response.json();
  }

  // Rides - Driver
  static async getAvailableRides() {
    const response = await fetch(`${API_BASE_URL}/driver/rides/available`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return response.json();
  }

  static async acceptRide(rideId: string, estimatedArrival: number) {
    const response = await fetch(`${API_BASE_URL}/driver/rides/${rideId}/accept`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ estimatedArrival }),
    });
    return response.json();
  }

  static async startRide(rideId: string) {
    const response = await fetch(`${API_BASE_URL}/driver/rides/${rideId}/start`, {
      method: 'PUT',
      headers: this.getHeaders(true),
    });
    return response.json();
  }

  static async completeRide(rideId: string, actualDistance: number, actualDuration: number) {
    const response = await fetch(`${API_BASE_URL}/driver/rides/${rideId}/complete`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ actualDistance, actualDuration }),
    });
    return response.json();
  }

  static async getDriverRides(status?: string) {
    const url = status
      ? `${API_BASE_URL}/driver/rides?status=${status}`
      : `${API_BASE_URL}/driver/rides`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return response.json();
  }

  // Wallet
  static async getWalletBalance(userType: 'student' | 'driver') {
    const response = await fetch(`${API_BASE_URL}/${userType}/wallet`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return response.json();
  }

  static async getTransactionHistory(
    userType: 'student' | 'driver',
    limit = 20,
    page = 1
  ) {
    const response = await fetch(
      `${API_BASE_URL}/${userType}/wallet/transactions?limit=${limit}&page=${page}`,
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return response.json();
  }

  static async fundWallet(amount: number, paymentReference: string) {
    const response = await fetch(`${API_BASE_URL}/student/wallet/fund`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ amount, paymentReference }),
    });
    return response.json();
  }

  static async withdrawFromWallet(amount: number, bankDetails: any) {
    const response = await fetch(`${API_BASE_URL}/driver/wallet/withdraw`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ amount, bankDetails }),
    });
    return response.json();
  }
}
```

---

## 2. Insufficient Balance Modal Component

Create `components/InsufficientBalanceModal.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  requiredAmount: number;
  onFundWallet: () => void;
  onSwitchToCash: () => void;
}

export function InsufficientBalanceModal({
  isOpen,
  onClose,
  currentBalance,
  requiredAmount,
  onFundWallet,
  onSwitchToCash,
}: InsufficientBalanceModalProps) {
  const shortage = requiredAmount - currentBalance;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Insufficient Wallet Balance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Your wallet balance is insufficient for this ride.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Current Balance</p>
              <p className="text-lg font-semibold">₦{currentBalance.toFixed(2)}</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Required Amount</p>
              <p className="text-lg font-semibold text-purple-600">
                ₦{requiredAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              You need <span className="font-semibold">₦{shortage.toFixed(2)}</span> more to
              complete this booking.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={onFundWallet}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Fund Wallet
            </Button>
            <Button onClick={onSwitchToCash} variant="outline" className="w-full">
              Switch to Cash Payment
            </Button>
            <Button onClick={onClose} variant="ghost" className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 3. Usage Example - Book Ride with Error Handling

```typescript
'use client';

import { useState } from 'react';
import { BoRideAPI } from '@/lib/api';
import { InsufficientBalanceModal } from '@/components/InsufficientBalanceModal';
import { useRouter } from 'next/navigation';

export function BookRideForm() {
  const router = useRouter();
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [insufficientData, setInsufficientData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleBookRide = async (formData: any) => {
    setLoading(true);
    try {
      const result = await BoRideAPI.bookRide(formData);

      if (result.success) {
        // Success - show confirmation
        toast.success('Ride booked successfully!');
        router.push('/student/rides');
      } else if (result.message === 'Insufficient wallet balance') {
        // Insufficient balance - show modal
        setInsufficientData({
          walletBalance: result.walletBalance,
          requiredAmount: result.requiredAmount,
        });
        setShowInsufficientModal(true);
      } else {
        // Other error
        toast.error(result.message || 'Failed to book ride');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFundWallet = () => {
    setShowInsufficientModal(false);
    router.push('/student/wallet/fund');
  };

  const handleSwitchToCash = () => {
    setShowInsufficientModal(false);
    // Update form to use cash payment and resubmit
    // ... your implementation
  };

  return (
    <>
      {/* Your booking form */}
      
      <InsufficientBalanceModal
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        currentBalance={insufficientData?.walletBalance || 0}
        requiredAmount={insufficientData?.requiredAmount || 0}
        onFundWallet={handleFundWallet}
        onSwitchToCash={handleSwitchToCash}
      />
    </>
  );
}
```

---

## 4. Wallet Display Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { BoRideAPI } from '@/lib/api';

export function WalletBalance({ userType }: { userType: 'student' | 'driver' }) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const result = await BoRideAPI.getWalletBalance(userType);
        if (result.success) {
          setBalance(result.balance);
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, [userType]);

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
      <p className="text-sm opacity-80 mb-2">Wallet Balance</p>
      <p className="text-4xl font-bold">₦{balance.toFixed(2)}</p>
    </div>
  );
}
```

---

## 5. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

---

## 6. Auth Context Example

Create `contexts/AuthContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BoRideAPI } from '@/lib/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  type: 'student' | 'driver';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, userType: 'student' | 'driver') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string, userType: 'student' | 'driver') => {
    const result =
      userType === 'student'
        ? await BoRideAPI.studentLogin(email, password)
        : await BoRideAPI.driverLogin(email, password);

    if (result.token) {
      const userData = {
        id: result[userType].id,
        fullName: result[userType].fullName,
        email: result[userType].email,
        type: userType,
      };

      setToken(result.token);
      setUser(userData);

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      throw new Error(result.message || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## 7. Protected Route Example

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
```

---

## Quick Start Checklist

- [ ] Copy the API client code to `lib/api.ts`
- [ ] Create InsufficientBalanceModal component
- [ ] Set up AuthContext
- [ ] Add environment variable `NEXT_PUBLIC_API_URL`
- [ ] Implement protected routes
- [ ] Create wallet balance display
- [ ] Add error handling for API calls
- [ ] Test registration and OTP verification flow
- [ ] Test booking with insufficient balance
- [ ] Test complete ride flow

---

## Common Patterns

### Error Handling
```typescript
try {
  const result = await BoRideAPI.someMethod();
  if (result.success) {
    // Handle success
  } else {
    // Handle API error
    toast.error(result.message);
  }
} catch (error) {
  // Handle network error
  toast.error('Network error occurred');
}
```

### Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await BoRideAPI.someMethod();
  } finally {
    setLoading(false);
  }
};
```

---

For more details, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
