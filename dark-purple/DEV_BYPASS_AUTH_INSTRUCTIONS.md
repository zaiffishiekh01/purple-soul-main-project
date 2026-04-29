# Development Auth Bypass - Quick Guide

Authentication has been temporarily bypassed for development purposes.

## Current Status

Auth bypass is **ENABLED** by default. You can now access all pages without logging in.

## Configuration

The following environment variables control the bypass:

```env
NEXT_PUBLIC_DEV_BYPASS_AUTH=true
NEXT_PUBLIC_DEV_USER_EMAIL=customer@test.com
NEXT_PUBLIC_DEV_USER_ROLE=customer
```

## How to Use

### To Keep Bypass Enabled (Current State)
Just start your dev server - you'll see a yellow banner at the top indicating "DEV MODE: Authentication Bypassed"

### To Disable Bypass
In `.env`, change:
```env
NEXT_PUBLIC_DEV_BYPASS_AUTH=false
```

### To Test Different Roles
Change the role in `.env`:

**Customer Role:**
```env
NEXT_PUBLIC_DEV_USER_ROLE=customer
```

**Vendor Role:**
```env
NEXT_PUBLIC_DEV_USER_ROLE=vendor
```

**Admin Role:**
```env
NEXT_PUBLIC_DEV_USER_ROLE=admin
```

## Visual Indicator

When bypass is active, you'll see a yellow banner at the top of authenticated pages:
```
┌────────────────────────────────────────┐
│ DEV MODE: Authentication Bypassed      │
└────────────────────────────────────────┘
```

## Important Notes

- This bypass only works in development
- The banner reminds you that auth is disabled
- Real authentication credentials still work if bypass is disabled
- Remember to disable before production deployment

## Test Credentials (If Bypass Disabled)

Customer: customer@test.com / Customer123!
Vendor: vendor@test.com / Vendor123!
Admin: admin@test.com / Admin123!
