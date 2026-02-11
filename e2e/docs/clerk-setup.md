# Clerk Test User Setup Guide

This guide explains how to set up Clerk test users for E2E testing in SkillSoft.

## Prerequisites

- Access to Clerk Dashboard (https://dashboard.clerk.com)
- A Clerk application configured for SkillSoft

## Step 1: Create Clerk Test Environment

1. Go to Clerk Dashboard
2. Select your application
3. Navigate to **Development** mode (or create a separate test instance)

## Step 2: Create Test Users

Create three test users with the following details:

### Admin User

| Field | Value |
|-------|-------|
| Password | `TestPassword123!` |
| First Name | `Admin` |
| Last Name | `E2E Test` |

**Public Metadata (JSON):**
```json
{
  "role": "ADMIN"
}
```

### Editor User

| Field | Value |
|-------|-------|
| Password | `TestPassword123!` |
| First Name | `Editor` |
| Last Name | `E2E Test` |

**Public Metadata (JSON):**
```json
{
  "role": "EDITOR"
}
```

### Regular User

| Field | Value |
|-------|-------|
| Password | `TestPassword123!` |
| First Name | `User` |
| Last Name | `E2E Test` |

**Public Metadata (JSON):**
```json
{
  "role": "USER"
}
```

## Step 3: Set Public Metadata

For each user:

1. Go to **Users** in Clerk Dashboard
2. Click on the user
3. Scroll down to **Public Metadata**
4. Click **Edit**
5. Add the role JSON (see above)
6. Click **Save**

## Step 4: Configure Environment Variables

Copy the `.env.e2e.local` template and fill in the credentials:

```bash
# E2E Test User Credentials
E2E_ADMIN_EMAIL=admin.e2e@skillsoft.test
E2E_ADMIN_PASSWORD=TestPassword123!
E2E_EDITOR_EMAIL=editor.e2e@skillsoft.test
E2E_EDITOR_PASSWORD=TestPassword123!
E2E_USER_EMAIL=user.e2e@skillsoft.test
E2E_USER_PASSWORD=TestPassword123!
```

## Step 5: Configure Webhook (Optional but Recommended)

If your backend syncs users via Clerk webhooks:

1. Go to **Webhooks** in Clerk Dashboard
2. Click **Add Endpoint**
3. Enter your backend webhook URL:
   - Local: `http://localhost:8080/api/webhooks/clerk`
   - Or use a tunnel like ngrok for local testing
4. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** to your environment:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

## Step 6: Sync Users to Database

After creating Clerk users, sync them to your backend database:

### Option A: Via Webhook (Automatic)
If webhooks are configured, users will sync automatically when created/updated.

### Option B: Via Seed Script (Manual)
Run the seed script to create matching database records:

```bash
psql -h localhost -U postgres -d skillsoft_e2e_test -f scripts/seed-e2e-data.sql
```

The seed script creates User table entries that match the Clerk users:
- `clerkId` must match the Clerk user ID
- `email` must match the Clerk email
- `role` must match the Clerk public metadata role

## Step 7: Verify Setup

1. Start the E2E environment:
   ```bash
   npm run e2e:setup
   ```

2. Run the auth setup tests:
   ```bash
   npm run test:e2e -- --project=setup
   ```

3. Check the console output for successful authentication.

## Troubleshooting

### "User not found" errors

- Verify the user exists in Clerk Dashboard
- Check that the email matches exactly (case-sensitive)
- Ensure the password is correct

### "Role not authorized" errors

- Verify the public metadata is set correctly
- Check that the role value is uppercase (`ADMIN`, not `admin`)
- Ensure the backend is reading the role from the correct metadata field

### Webhook not syncing

- Check the webhook URL is accessible
- Verify the signing secret matches
- Check backend logs for webhook processing errors

### Storage state issues

- Delete the `playwright/.auth/*.json` files
- Re-run the auth setup: `npm run test:e2e -- --project=setup`

## Security Notes

- **Never commit** `.env.e2e.local` to version control
- Use a separate Clerk instance/environment for testing
- Use strong, unique passwords for test accounts
- Regularly rotate test credentials
- Store production Clerk keys separately from test keys

## GitHub Actions Secrets

For CI/CD, add these secrets to your GitHub repository:

| Secret Name | Description |
|-------------|-------------|
| `E2E_ADMIN_EMAIL` | Admin test user email |
| `E2E_ADMIN_PASSWORD` | Admin test user password |
| `E2E_EDITOR_EMAIL` | Editor test user email |
| `E2E_EDITOR_PASSWORD` | Editor test user password |
| `E2E_USER_EMAIL` | Regular test user email |
| `E2E_USER_PASSWORD` | Regular test user password |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (test) |
| `CLERK_SECRET_KEY` | Clerk secret key (test) |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |

## Updating Test Users

When updating test user credentials:

1. Update the user in Clerk Dashboard
2. Update `.env.e2e.local`
3. Update GitHub Secrets (if applicable)
4. Delete old auth state files: `rm -rf playwright/.auth/*.json`
5. Re-run auth setup: `npm run test:e2e -- --project=setup`
