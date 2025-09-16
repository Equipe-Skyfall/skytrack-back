# Vercel Deployment Setup

## Required Environment Variables

Set these environment variables in your Vercel dashboard:

### Deployment Configuration
- `IS_SERVERLESS` - **IMPORTANT**: Set to "true" for Vercel deployment
  - This disables the migration scheduler (which doesn't work in serverless)
  - For EC2/traditional servers, set to "false"

### Database Configuration
- `DATABASE_URL` - PostgreSQL connection string (Supabase)
  ```
  postgresql://postgres:password@db.xxxxxxxxxx.supabase.co:5432/postgres
  ```

### MongoDB Configuration
- `MONGO_CONNECTION_STRING` - MongoDB Atlas connection string
  ```
  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=cluster0
  ```
- `MONGO_DATABASE` - MongoDB database name (e.g., "dadosClima")
- `MONGO_COLLECTION` - MongoDB collection name (e.g., "clima")

### Migration Configuration
- `MIGRATION_ENABLED` - Set to "true" to enable data migration
- `MIGRATION_INTERVAL_MINUTES` - Migration interval (e.g., "15")
- `MIGRATION_BATCH_SIZE` - Number of records to migrate per batch (e.g., "100")
- `MIGRATION_SYNC_NAME` - Sync identifier (e.g., "main_sync")

### Application Configuration
- `NODE_ENV` - Set to "production"
- `PORT` - Will be automatically set by Vercel

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy your application**:
   ```bash
   vercel
   ```

4. **Set environment variables** in the Vercel dashboard or via CLI:
   ```bash
   vercel env add DATABASE_URL
   vercel env add MONGO_CONNECTION_STRING
   # ... add all other environment variables
   ```

5. **Deploy again** after setting environment variables:
   ```bash
   vercel --prod
   ```

## Important Notes

- **Cron Jobs**: The migration scheduler will work differently in serverless environment. Consider using Vercel Cron Jobs or external services for scheduled tasks.
- **Database Connections**: Prisma handles connection pooling automatically in serverless environments.
- **Cold Starts**: First request might be slower due to serverless cold starts.

## API Endpoints

After deployment, your API will be available at:
- Base URL: `https://your-app.vercel.app`
- API Documentation: `https://your-app.vercel.app/api-docs`
- Health Check: `https://your-app.vercel.app/api/health`

## Troubleshooting

1. **Build Failures**: Check Vercel build logs for TypeScript/Prisma errors
2. **Database Connection**: Ensure DATABASE_URL is correctly formatted
3. **CORS Issues**: Update CORS configuration if needed for production domains
4. **Function Timeout**: Increase maxDuration in vercel.json if needed (max 30s for hobby plan)