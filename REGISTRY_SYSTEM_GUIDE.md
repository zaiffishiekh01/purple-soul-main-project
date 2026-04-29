# Universal Registry System - Complete Guide

## Overview
The Universal Registry System is a comprehensive solution for creating and managing celebration registries across all Abrahamic faiths (Muslim, Christian, Jewish, and Shared). The system supports multiple celebration types with full CRUD functionality.

## Registry Types

### 1. Wedding Registry
- Traditional wedding gift registry
- Support for couple names
- Wedding date tracking
- Gift preference management

### 2. Seasonal Celebration Registry
- Ramadan/Eid celebrations
- Christmas/Advent celebrations
- Hanukkah celebrations
- Multi-faith seasonal events

### 3. Remembrance Registry
- Memorial services
- Funeral arrangements
- Remembrance gifts
- Tribute items

### 4. Home Blessing Registry
- New home/housewarming
- Home blessing ceremonies
- Household essentials
- Traditional blessing items

### 5. New Birth & Welcome Registry
- Baby arrival celebrations
- Birth ceremonies
- Welcome gifts
- Family expansion

## Faith Tradition Support

Each registry can be designated for:
- **Muslim**: Islamic traditions and customs
- **Christian**: Christian traditions and customs
- **Jewish**: Jewish traditions and customs
- **Shared**: All Abrahamic faiths (interfaith/universal)

## Features

### For Registry Creators

#### 1. Create Registry
- Choose celebration type
- Select faith tradition
- Add event details (names, dates, location)
- Write personal story
- Set privacy (public or password-protected)
- Customize URL slug

#### 2. Manage Registry
- Add products from catalog
- Set quantity needed for each item
- Set priority levels (high, medium, low)
- Remove items
- View statistics:
  - Total items
  - Quantity requested vs purchased
  - Completion percentage
  - Number of guests who purchased
  - Total purchases

#### 3. Share Registry
- Generate shareable link
- Copy link to clipboard
- Password protection option
- QR code generation (planned)

### For Registry Guests

#### 1. Browse Registries
- Search public registries
- Filter by faith tradition
- View event details
- See registry items

#### 2. View Registry
- See all requested items
- Check availability (purchased vs requested)
- View priority levels
- Add items to cart
- Make purchases

#### 3. Purchase Tracking
- Guest name and email
- Personal message option
- Anonymous purchase option
- Gift wrapping preference

## Database Schema

### celebration_registries
Main registry table storing:
- Registry type and faith tradition
- Event details and dates
- Privacy settings
- Owner information
- Location data

### celebration_registry_items
Products in registries:
- Product references
- Quantity tracking
- Priority levels
- Notes

### celebration_registry_purchases
Guest purchases:
- Purchaser information
- Quantity purchased
- Messages and preferences
- Delivery tracking

## Security & Privacy

### Row Level Security (RLS)
- Registry owners can fully manage their registries
- Public registries viewable by anyone
- Private registries only viewable by owner
- Password-protected registries require authentication
- Guests can make purchases without accounts
- Purchase data visible to registry owners
- Non-anonymous purchases visible to public

### Privacy Settings
1. **Public**: Anyone can view and purchase
2. **Password Protected**: Requires password to view
3. **Private**: Only owner can view (future feature)

## Authentication

### User Accounts
Users can create accounts to:
- Create unlimited registries
- Manage all their registries
- Track purchases and statistics
- Update registry details

### Guest Access
Guests can:
- Browse public registries
- View registry items
- Make purchases without account
- Add optional messages

## Usage Flow

### Creating a Registry

1. **Sign In/Sign Up**
   - Click "Create Registry" on any registry type page
   - If not logged in, click "Sign In / Create Account"
   - Enter email and password
   - Complete registration

2. **Fill Registry Form**
   - Select faith tradition (Muslim, Christian, Jewish, Shared)
   - Enter primary name (required)
   - Enter secondary name if applicable (e.g., partner name)
   - Add event date
   - Write personal story
   - Add location (country, city)
   - Choose privacy setting
   - Set password if password-protected
   - Customize URL slug (optional)

3. **Submit**
   - Click "Create Registry"
   - View success message
   - Redirected to manage page

4. **Add Products**
   - Click "Add Products"
   - Search available products
   - Click "Add to Registry" for desired items
   - Set quantity needed
   - Set priority level
   - Add notes

5. **Share**
   - Click "Share" button
   - Copy registry link
   - Share with friends and family
   - Provide password if protected

### Managing a Registry

1. **Access My Registries**
   - Click "My Registries" tab
   - View all created registries
   - Click "Manage" on desired registry

2. **Update Items**
   - Adjust quantities using +/- buttons
   - Change priority levels
   - Remove unwanted items
   - Add new items

3. **View Statistics**
   - Monitor completion percentage
   - See number of purchases
   - Track unique guests
   - View quantity fulfillment

### Shopping from a Registry

1. **Find Registry**
   - Browse public registries
   - Or use direct link from creator

2. **Enter Password** (if required)
   - Enter registry password
   - Click "Access Registry"

3. **View Items**
   - See all registry items
   - Check quantity needed vs purchased
   - View priority levels

4. **Make Purchase**
   - Add items to cart
   - Proceed to checkout
   - Enter purchaser details
   - Add optional message
   - Choose gift wrapping
   - Select anonymous option if desired

## Technical Implementation

### Components
- `UniversalRegistry.tsx`: Main registry component
- `AuthModal.tsx`: Authentication modal
- Registry integrated into App.tsx

### Database
- Supabase PostgreSQL database
- Real-time updates
- Automatic triggers for quantity tracking
- Statistics views

### State Management
- React hooks for local state
- Supabase real-time subscriptions (optional)
- Authentication state in App.tsx

## Best Practices

### For Registry Creators
1. Add detailed story to personalize registry
2. Set realistic quantities
3. Use priority levels to guide guests
4. Update registry as items are received
5. Thank guests through personal messages

### For Guests
1. Check quantity before purchasing
2. Add personal message
3. Consider priority levels
4. Coordinate with other guests to avoid duplicates
5. Choose gift wrapping for special occasions

## Future Enhancements

- Email notifications
- Real-time updates
- Registry analytics dashboard
- Gift suggestions based on faith tradition
- Multi-language support
- Mobile app
- Social media sharing
- Thank you card management
- Offline access
- CSV export of registry data

## Support

For issues or questions:
1. Check database RLS policies
2. Verify authentication state
3. Check browser console for errors
4. Review Supabase dashboard for data
5. Test with different privacy settings

## Conclusion

The Universal Registry System provides a complete, faith-inclusive solution for celebration registries. With support for all major Abrahamic traditions, comprehensive privacy controls, and full CRUD functionality, users can create, manage, and share registries for any celebration while maintaining their cultural and religious preferences.
