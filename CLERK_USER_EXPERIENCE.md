# 👤 What Your Users Will See - Clerk Authentication

## 🎯 User Experience Flow

### 1. **First Visit (Not Signed In)**

When users visit your site for the first time, they'll see:

- **Navbar**: A **"Sign In"** button in the top right
- **Main Content**: The search interface (they can browse but can't search yet)
- **Credit Display**: Hidden (only shown when signed in)

### 2. **Clicking "Sign In"**

When users click the "Sign In" button:

- A **modal** opens with Clerk's sign-in interface
- Options to:
  - Sign in with email/password
  - Sign in with Google, GitHub, etc. (if configured)
  - **Sign up** (if they don't have an account)

### 3. **Sign Up Process**

When a new user signs up:

1. They fill out the sign-up form (email, password, etc.)
2. Clerk creates their account
3. **Webhook triggers**: Your `/api/webhooks/clerk` endpoint receives `user.created` event
4. **Database**: User is automatically created in Supabase with:
   - 3 free trial credits
   - `isPremium: false`
   - Email from Clerk
5. **User sees**: They're now signed in and can start searching!

### 4. **Signed In State**

Once signed in, users see:

- **Navbar**:
  - **Credit Display**: Shows their credit balance (e.g., "3 credits")
  - **User Button**: Their avatar/profile picture
    - Clicking shows dropdown with:
      - Profile settings
      - Account management
      - Sign out option

### 5. **Using Credits**

- Each search costs credits (configured in your settings)
- Credit balance updates in real-time
- If credits run low (< 10), the credit display turns red with a warning icon
- Clicking credits takes them to `/pricing` page to buy more

## 🎨 UI Components Added

### Navbar Components

```tsx
<SignedOut>
  <SignInButton mode="modal">
    <button>Sign In</button>
  </SignInButton>
</SignedOut>

<SignedIn>
  <CreditDisplay />
  <UserButton />
</SignedIn>
```

### What Each Component Does

- **`<SignedOut>`**: Only shows content when user is NOT signed in
- **`<SignedIn>`**: Only shows content when user IS signed in
- **`<SignInButton>`**: Opens Clerk's sign-in modal
- **`<UserButton>`**: Shows user avatar with dropdown menu

## 🔄 Automatic User Creation

When a user signs up via Clerk:

1. **Clerk** creates the user account
2. **Webhook** (`/api/webhooks/clerk`) receives the event
3. **Database** automatically creates a User record with:
   ```typescript
   {
     clerkId: "user_xxx",
     email: "user@example.com",
     credits: 3,
     isPremium: false
   }
   ```
4. **User** can immediately start using the app!

## 🚀 Testing the Flow

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Visit** http://localhost:3000

3. **You'll see**:
   - "Sign In" button in navbar
   - Search interface (but searches require authentication)

4. **Click "Sign In"**:
   - Modal opens
   - Click "Sign up" tab
   - Create an account

5. **After signup**:
   - You're automatically signed in
   - Credit display shows "3 credits"
   - UserButton shows your avatar
   - You can now search!

6. **Check Supabase**:
   - Go to Table Editor → User table
   - You should see your new user with 3 credits!

## ✅ Installation Complete!

Once Clerk detects your first user signup, the installation is complete! You'll see:

- ✅ User created in Clerk dashboard
- ✅ User created in Supabase database
- ✅ 3 free credits assigned
- ✅ User can authenticate and use the app

## 📝 Next Steps

1. **Configure Clerk** (optional):
   - Add social providers (Google, GitHub, etc.)
   - Customize sign-in/sign-up forms
   - Set up email templates

2. **Test Credit System**:
   - Make a search (should deduct 1 credit)
   - Check credit balance updates
   - Test low credit warning

3. **Test Payment Flow**:
   - Visit `/pricing`
   - Click "Buy Credits"
   - Test NowPayments integration

## 🎉 You're Ready!

Your users can now:
- ✅ Sign up for free
- ✅ Get 3 free credits
- ✅ Start searching immediately
- ✅ Buy more credits when needed
