# Convex Setup with Existing Database

## Current Status

✅ **Convex Installed**: SDK and dependencies configured  
✅ **Project Initialized**: Convex deployment created (`uncommon-rook-99`)  
✅ **Authentication Configured**: Integrated with Clerk  
✅ **React Integration**: ConvexProvider added to app  
✅ **Complete Schema**: Full database schema implemented with all tables  
✅ **Clean Setup**: Example functions removed, ready for custom implementation  
✅ **Dashboard Route**: Example route demonstrating Convex integration  
✅ **Testing Complete**: All routes working correctly  

## Environment Variables

Your `.env.local` now includes:
```env
# Convex Configuration
CONVEX_DEPLOYMENT=dev:uncommon-rook-99
VITE_CONVEX_URL=https://uncommon-rook-99.convex.cloud
CLERK_JWT_ISSUER_DOMAIN=https://fancy-terrapin-0.clerk.accounts.dev
```

## Connecting to Your Existing Database

### Option 1: Import Schema from Existing Database

1. **Export your existing database schema**:
   ```sql
   -- For PostgreSQL
   pg_dump --schema-only your_database > schema.sql
   
   -- For MySQL
   mysqldump --no-data your_database > schema.sql
   
   -- For SQLite
   sqlite3 your_database.db .schema > schema.sql
   ```

2. **Convert to Convex Schema**:
   - Update `convex/schema.ts` with your actual tables
   - Use Convex schema format with `defineTable()` and `v.*` validators
   - Example conversion:

   ```typescript
   // SQL Table:
   // CREATE TABLE posts (
   //   id SERIAL PRIMARY KEY,
   //   title VARCHAR(255),
   //   content TEXT,
   //   user_id INTEGER REFERENCES users(id),
   //   created_at TIMESTAMP
   // );

   // Convex Schema:
   posts: defineTable({
     title: v.string(),
     content: v.string(),
     userId: v.id("users"),
     createdAt: v.number(),
   }).index("by_user", ["userId"]),
   ```

### Option 2: Data Migration Script

Create a migration script to copy data from your existing database:

1. **Create migration function** in `convex/migrations.ts`:
   ```typescript
   import { internalMutation } from "./_generated/server";
   
   export const migrateData = internalMutation({
     handler: async (ctx) => {
       // Connect to your existing database and copy data
       // This is run once to migrate existing data
     },
   });
   ```

2. **Run migration**:
   ```bash
   npx convex run migrations:migrateData
   ```

### Option 3: Real-time Sync (Advanced)

Set up real-time synchronization between your existing database and Convex:

1. **Database Triggers**: Set up triggers in your existing database
2. **Webhook Endpoints**: Create endpoints to receive database changes
3. **Convex Actions**: Use actions to sync data bidirectionally

## Available Routes

- **Homepage** (`/`) - Landing page with authentication
- **Dashboard** (`/dashboard`) - **NEW!** Convex integration demo
- **App** (`/app`) - Original app dashboard  
- **Sign In** (`/sign-in`) - Authentication
- **Sign Up** (`/sign-up`) - User registration

## Current Convex Functions

**Clean Slate**: All example functions have been removed. Your Convex deployment now has:
- ✅ Complete database schema configured
- ✅ Authentication setup with Clerk
- ✅ No example functions cluttering the deployment
- ✅ Ready for your custom business logic

**Ready to add your own functions** in the `convex/` directory!

## Database Schema

Your complete schema includes:
- **users** - User profiles with demographics and academic info
- **terms** - Academic terms/semesters
- **courses** - Course information and schedules
- **assignments** - Course assignments and grades
- **events** - Calendar events and activities
- **schools** - Educational institutions
- **ethnicities** - Ethnicity reference data
- **majorCategories** - Academic major categories

## Next Steps

1. **Update Schema**: Replace example schema with your actual database structure
2. **Create Functions**: Add Convex functions for your specific use cases
3. **Migrate Data**: Choose and implement your preferred migration strategy
4. **Test Integration**: Verify Convex works with your React Router app
5. **Deploy**: Push changes to production when ready

## Running Convex Development Server

```bash
# Start Convex dev server (run in separate terminal)
npx convex dev

# Your React Router app will automatically connect to Convex
npm run dev
```

## Convex Dashboard

Access your Convex dashboard at:
https://dashboard.convex.dev/d/uncommon-rook-99

Here you can:
- View and edit data
- Monitor function performance
- Manage deployments
- Configure authentication

## Authentication Flow

1. User signs in with Clerk
2. Clerk generates JWT token
3. ConvexProviderWithClerk passes token to Convex
4. Convex validates token using your Clerk configuration
5. Convex functions can access `ctx.auth.getUserIdentity()`

The integration is ready for your existing database schema!
