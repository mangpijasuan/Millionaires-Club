# 🚀 Supabase Setup Guide - Multi-User Authentication & Cloud Sync

## 📋 Prerequisites
- Supabase account (free tier works!)
- 15-20 minutes setup time

---

## Step 1: Create Supabase Project

### 1.1 Sign Up
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email

### 1.2 Create New Project
1. Click "New Project"
2. Fill in:
   - **Name**: `millionaires-club` (or your choice)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (sufficient for thousands of users)
3. Click "Create new project"
4. Wait 2-3 minutes for setup to complete ⏳

---

## Step 2: Get Your API Keys

### 2.1 Find Your Keys
1. In your Supabase project dashboard
2. Click ⚙️ **Settings** (bottom left)
3. Click **API** from the sidebar
4. You'll see:
   - **Project URL** (starts with `https://`)
   - **anon public** key (long string starting with `eyJ...`)

### 2.2 Add Keys to Your Project
1. Create `.env.local` file in your project root (if not exists)
2. Add these lines:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_existing_gemini_key
```

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyBMUCb75E0geBctJ5jofGGsOISyOXUUEK0
```

---

## Step 3: Setup Database Tables

### 3.1 Run SQL Script
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **+ New Query**
3. Open the file `supabase-schema.sql` in your project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" ✅

**What this creates:**
- ✅ 6 tables: members, loans, transactions, communication_logs, contribution_history, admin_users
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Automatic timestamps
- ✅ Foreign key relationships

---

## Step 4: Create Your First Admin User

### 4.1 Enable Email Auth (if needed)
1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Disable "Confirm email" for testing (optional)

### 4.2 Method A: Sign Up Through App (Easiest)
1. Restart your dev server:
   ```bash
   npm run dev
   ```
2. Open http://localhost:3000
3. Click "Admin Workspace"
4. Look for "Sign Up" link or button
5. Enter:
   - Email: your_admin_email@example.com
   - Password: strong_password_here
   - Full Name: Your Name
6. Click Sign Up
7. Check your email for verification (if enabled)

### 4.2 Method B: Create Manually in Supabase
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: your_admin_email@example.com
   - Password: your_secure_password
   - Auto Confirm User: ✅ (checked)
4. Click **Create user**
5. The `admin_users` table entry will be created automatically!

---

## Step 5: Migrate Existing Data (Optional)

### 5.1 Export Current Data
1. Go to your app: http://localhost:3000
2. Login as admin
3. Go to **System & Auto** tab
4. Click **"Export Backup"**
5. Save the JSON file

### 5.2 Import to Supabase
Option 1: Use the app's import feature (after switching to Supabase)
Option 2: Manual import via SQL:

```sql
-- Example: Import members
INSERT INTO members (id, name, email, join_date, account_status, phone, address, beneficiary, total_contribution)
VALUES
('MC-000001', 'John Doe', 'john@example.com', '2024-01-01', 'Active', '555-0100', '123 Main St', 'Jane Doe', 1500.00);
-- Repeat for all members...
```

---

## Step 6: Enable Your App to Use Supabase

### 6.1 Update Environment Variable
Make sure `.env.local` has your Supabase credentials (from Step 2.2)

### 6.2 Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 6.3 Test Connection
1. Open http://localhost:3000
2. Try logging in with your admin credentials
3. Check browser console (F12) for any errors

---

## Step 7: Configure Row Level Security (Already Done!)

The SQL script already set this up, but here's what it does:

### Who Can Access What:
- ✅ **Admins**: Full access to all data (read, create, update, delete)
- ✅ **Members**: Can view their own data only
- ✅ **Anonymous**: No access (must be authenticated)

### Test RLS:
1. Try accessing data as admin ✅
2. Try accessing data as member ✅
3. Try without login ❌ (should fail)

---

## Step 8: Add More Admin Users

### Option 1: Through Supabase Dashboard
1. **Authentication** → **Users** → **Add user**
2. Enter email & password
3. Auto-confirm if needed
4. User will appear in `admin_users` table automatically

### Option 2: Invite via Email
1. In your app, add an "Invite Admin" feature
2. Use `signUpAdmin()` function from `authService.ts`:

```typescript
import { signUpAdmin } from './services/authService';

await signUpAdmin(
  'newadmin@example.com',
  'temporaryPassword123',
  'Admin Full Name',
  'admin' // or 'super_admin'
);
```

---

## 🎯 Verification Checklist

After setup, verify everything works:

- [ ] Can login as admin
- [ ] Can see all members
- [ ] Can create new member
- [ ] Can edit member
- [ ] Can create loan
- [ ] Can record contribution
- [ ] Data persists after logout/login
- [ ] Can access from different browser ✅
- [ ] Can access from different device ✅

---

## 🔒 Security Best Practices

### Production Checklist:
1. ✅ Enable email confirmation
2. ✅ Use strong passwords
3. ✅ Enable MFA for admin accounts
4. ✅ Regular backups (Supabase does this automatically)
5. ✅ Monitor auth logs in Supabase dashboard
6. ✅ Set password policies in Auth settings

### Recommended Settings:
```
Authentication → Settings:
- Minimum password length: 12
- Require uppercase: Yes
- Require numbers: Yes
- Require special characters: Yes
- Enable password history: Yes
- Max concurrent sessions: 3
```

---

## 📊 Supabase Dashboard Tour

### Key Areas:
1. **Table Editor**: View/edit data directly
2. **Authentication**: Manage users
3. **SQL Editor**: Run custom queries
4. **Database → Roles**: Manage permissions
5. **Logs**: View all database activity
6. **API**: Test endpoints

---

## 🆘 Troubleshooting

### Issue: "Invalid API key"
**Solution:** Double-check `.env.local` file has correct keys

### Issue: "Row Level Security policy violation"
**Solution:** Make sure you're logged in as admin user

### Issue: "Connection failed"
**Solution:** 
1. Check Supabase project is active (not paused)
2. Verify internet connection
3. Check Supabase status page

### Issue: "User not found in admin_users"
**Solution:** 
1. Go to Supabase → Authentication → Users
2. Delete the user
3. Sign up again (trigger will create admin_users entry)

### Issue: Can't see data
**Solution:**
1. Check RLS policies are enabled
2. Verify you're authenticated
3. Check browser console for errors

---

## 🎉 Success!

You now have:
✅ Cloud database (PostgreSQL)
✅ Multi-user authentication
✅ Access from anywhere with internet
✅ Automatic backups
✅ Real-time sync across devices
✅ Secure row-level security

### What Changed from LocalStorage:
| Feature | LocalStorage | Supabase |
|---------|-------------|----------|
| Access | Single browser | Any device |
| Users | Single user | Multiple users |
| Backup | Manual export | Automatic |
| Security | Browser-only | RLS + Auth |
| Sync | None | Real-time |
| Data limit | ~5-10 MB | 500 MB (free) |

---

## 📱 Next Steps

1. **Add more admins** (Step 8)
2. **Import your data** (Step 5)
3. **Test on mobile device**
4. **Setup email templates** (Supabase → Auth → Email Templates)
5. **Configure custom domain** (for production)
6. **Enable real-time subscriptions** (for live updates)

---

## 🎓 Advanced Features (Optional)

### Real-Time Updates
Members see changes instantly across all devices:
```typescript
supabase
  .channel('members-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'members' },
    payload => console.log('Change:', payload))
  .subscribe();
```

### Email Notifications
Send automated emails when loans are due, etc.

### Two-Factor Authentication
Enable MFA in Supabase Auth settings

---

Need help? Check:
- 📚 Supabase Docs: https://supabase.com/docs
- 💬 Supabase Discord: https://discord.supabase.com
- 🎥 Video tutorials: YouTube "Supabase Tutorial"

**You're all set!** 🚀
