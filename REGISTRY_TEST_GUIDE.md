# Registry Creation Workflow - Testing Guide

## Complete User Flow Test

### Step 1: Access Registry Creation
1. Open the application in your browser
2. Navigate to any registry type:
   - Wedding Registry (from footer or navigation)
   - Celebration Registry
   - Birth & Welcome Registry
   - Home Blessing Registry
   - Remembrance Registry

### Step 2: View Initial State (Not Logged In)
**Expected Behavior:**
- If not logged in, you should see the "Browse Registries" tab
- You should see tabs: "Browse Registries", "Create Registry", "My Registries" (last one only if logged in)
- Click "Create Registry" tab

### Step 3: Authentication Required
**Expected Behavior:**
- You should see a warning message: "Please log in to create a registry"
- There's a link/button: "Sign In / Create Account"
- The "Create Registry" submit button should be **disabled** (grayed out)

### Step 4: Sign Up / Sign In
1. Click "Sign In / Create Account"
2. A modal should appear with sign-in options
3. Switch to "Create Account" tab
4. Enter:
   - **Email**: test@example.com (or any valid email)
   - **Password**: password123 (minimum 6 characters)
   - **Confirm Password**: password123
5. Click "Sign Up"

**Expected Behavior:**
- You should see "Account created successfully!" message
- Modal should close after 2 seconds
- The warning message should disappear
- The "Create Registry" button should now be **enabled** (pink/active)

### Step 5: Fill Out Registry Form
Fill in the following fields:

1. **Faith Tradition**: Select one (Muslim, Christian, Jewish, or Shared)
2. **Primary Name**: Enter a name (e.g., "Sarah")
3. **Secondary Name** (if applicable): Enter second name (e.g., "Ahmad")
4. **Event Date** (optional): Select a future date
5. **Story**: Enter a description (e.g., "Celebrating our special day...")
6. **Country**: Enter country (e.g., "USA")
7. **City**: Enter city (e.g., "New York")
8. **Privacy Setting**: Choose one:
   - Public (anyone can view)
   - Private (only you can view)
   - Password Protected (requires password)
9. **Custom URL** (optional): Leave blank or enter custom slug

### Step 6: Submit Registry
1. Click "Create Registry" button
2. Button should show "Creating Registry..." while processing

**Expected Behavior:**
- After successful creation, you should see a **Confirmation Page** with:
  - Green checkmark icon
  - "Registry Created Successfully!" heading
  - Registry details displayed (names, date, faith tradition, privacy)
  - Shareable link with "Copy" button
  - Two action buttons:
    - "Add Items to Registry"
    - "View My Registries"

### Step 7: Test Shareable Link
1. Click the "Copy" button next to the registry link
2. Button should change to show "Copied!" with a checkmark
3. Open a new browser tab (or incognito window)
4. Paste the link and press Enter

**Expected Behavior:**
- For Public registries: You should see the registry details
- For Private registries: You should see "This registry is private"
- For Password Protected: You should see a password prompt

### Step 8: Add Items to Registry
1. From the confirmation page, click "Add Items to Registry"
2. You should be taken to the registry management view
3. Click "Add Products" button
4. Search or browse available products
5. Click checkboxes to select products
6. Click "Add Selected Items"

**Expected Behavior:**
- Products should appear in your registry
- You can set quantity and priority for each item
- You can add notes
- You can delete items

### Step 9: View Your Registries
1. Click "View My Registries" or "My Registries" tab
2. You should see a list of all your created registries

**Expected Behavior:**
- Each registry shows: names, creation date, faith tradition
- "Manage" button on each registry
- If no registries exist, you see: "You haven't created any registries yet" with "Create Your First Registry" button

### Step 10: Navigate from User Account
1. Click on "Account" in the navigation
2. Look for "My Registries" section in the sidebar

**Expected Behavior:**
- You should see quick links to all registry types:
  - Wedding Registry
  - Celebration Registry
  - Birth & Welcome
  - Home Blessing
  - Remembrance
- Clicking any of these takes you to the manage view for that registry type

## Common Issues & Troubleshooting

### Issue: "Create Registry" button is disabled
**Solution:**
- Check if you're logged in
- Look for the auth warning message
- Click "Sign In / Create Account" to authenticate

### Issue: Registry not appearing after creation
**Solution:**
- Check browser console for errors (F12 → Console tab)
- Verify you're on the "My Registries" tab
- Refresh the page

### Issue: Database errors
**Solution:**
- Check browser console for specific error messages
- Common error: "new row violates row-level security policy"
  - This means RLS policies need adjustment
  - User must be authenticated
  - User ID must match registry user_id

### Issue: Authentication not persisting
**Solution:**
- Check if cookies are enabled in browser
- Clear browser cache and try again
- Check Supabase connection in browser console

## Browser Console Debugging

Open browser console (F12) and look for:
- `Creating registry with data:` - Shows what's being sent to database
- `Registry created successfully:` - Shows created registry data
- `Registry creation error:` - Shows any database errors
- Any red error messages

## Database Verification

To verify registries were created:
1. Check the database using Supabase dashboard
2. Look in `celebration_registries` table
3. Verify `user_id` matches your authenticated user
4. Check `is_active` is `true`

## Success Criteria

The workflow is successful when:
1. ✅ User can sign up without errors
2. ✅ Authentication persists across page navigation
3. ✅ Form validation works (required fields, password confirmation)
4. ✅ Registry saves to database successfully
5. ✅ Confirmation page displays with correct details
6. ✅ Shareable link works in new browser tab
7. ✅ User can add items to registry
8. ✅ User can view all their registries
9. ✅ Navigation between registries works smoothly
10. ✅ Privacy settings are respected

## Known Limitations

1. Email confirmation is disabled (sign up is immediate)
2. No email notifications for registry creation
3. Password reset requires manual intervention
4. No social login (Google, Facebook, etc.)
5. Registry items are mock data (need real product integration)
