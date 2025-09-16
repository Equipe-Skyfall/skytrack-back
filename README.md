# SkyTrack Backend API

A comprehensive backend API for meteorological station management built with Node.js, TypeScript, Express, and PostgreSQL.


## Requirements

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher) OR Docker
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials.

4. Set up PostgreSQL (choose one option):

   **Option A: Supabase (Recommended)**
   1. Create a Supabase project at [supabase.com](https://supabase.com)
   2. Get your database URL from Settings > Database
   3. Update your `.env` file with the Supabase connection string:
   ```bash
   DATABASE_URL="postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres"
   ```

   **Option B: Local PostgreSQL Installation**
   ```sql
   CREATE DATABASE skytrack;
   ```

   **Option C: Docker Container**
   ```bash
   # Run PostgreSQL in Docker
   docker run --name skytrack-postgres -e POSTGRES_PASSWORD=your_password -p 5432:5432 -d postgres

   # Create the database
   docker exec skytrack-postgres psql -U postgres -c "CREATE DATABASE skytrack;"
   ```

## Available NPM Commands

### Development Commands

```bash
# Start the development server with hot reload
npm run dev

# Start the production server
npm start

# Build the TypeScript project
npm run build
```

### Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Code Quality Commands

```bash
# Run ESLint to check for code issues
npm run lint

# Run ESLint and automatically fix issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## Database Setup

This project uses Prisma ORM for database management. After setting up PostgreSQL (see Installation section), follow these steps:

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Run database migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Seed the database (optional)**:
   ```bash
   npx prisma db seed
   ```

### Prisma Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create and apply a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset the database (development only)
npx prisma migrate reset

# Open Prisma Studio for database inspection
npx prisma studio

# Push schema changes without migrations (development)
npx prisma db push
```

### Environment Variables

```env
PORT=3000
NODE_ENV=development

# Database Configuration (Prisma)
# For Supabase: postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres
# For local PostgreSQL: postgresql://postgres:password@localhost:5432/skytrack
# For Docker container: postgresql://postgres:your_password@localhost:5432/skytrack
DATABASE_URL="postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres"

# Legacy Database Configuration (for reference)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skytrack
DB_USER=postgres
DB_PASSWORD=password
DB_MAX_CONNECTIONS=10
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

## Supabase Integration

This project is now integrated with Supabase for managed PostgreSQL hosting. Benefits include:

- ✅ **Managed Database**: No need to maintain your own PostgreSQL instance
- ✅ **Automatic Backups**: Built-in backup and restore functionality
- ✅ **Real-time Features**: Optional real-time subscriptions for data changes
- ✅ **Dashboard**: Web-based database management interface
- ✅ **Scalability**: Automatic scaling based on usage

### Supabase Setup Steps

1. **Create a Supabase Project**
   - Visit [supabase.com](https://supabase.com) and create a new project
   - Choose your organization and project name

2. **Get Database Connection Details**
   - Go to Settings → Database in your Supabase dashboard
   - Copy the connection string under "Connection Pooling"

3. **Configure Your Application**
   - Update your `.env` file with the Supabase connection string
   - Run `npx prisma db push` to deploy your schema
   - Start your application with `npm run dev`

4. **Optional: Enable Additional Features**
   - **Row Level Security**: Enable RLS for enhanced security
   - **Real-time**: Subscribe to database changes in real-time
   - **Auth**: Integrate Supabase Authentication for user management

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:3000/api-docs`

## API Endpoints

### Meteorological Stations

- `GET /api/v1/stations` - List all stations with optional filtering and pagination
- `GET /api/v1/stations/:id` - Get a specific station by ID
- `POST /api/v1/stations` - Create a new station
- `PUT /api/v1/stations/:id` - Update an existing station
- `DELETE /api/v1/stations/:id` - Delete a station

### Health Check

- `GET /api/v1/health` - Check API health status

## Station Data Model

```typescript
interface Station {
  id: string;          // UUID
  name: string;        // 1-100 characters
  latitude: number;    // -90 to 90
  longitude: number;   // -180 to 180
  description?: string; // Optional, max 500 characters
  status: 'ACTIVE' | 'INACTIVE'; // Defaults to ACTIVE
  createdAt: Date;
  updatedAt: Date;
}
```

## Development Workflow

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Make your changes** and the server will automatically reload

3. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

4. **Check code quality**:
   ```bash
   npm run lint
   npm run format
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
prisma/
├── migrations/       # Database migration files
└── schema.prisma     # Database schema definition

src/
├── config/           # Configuration files (database, swagger, prisma)
├── controllers/      # HTTP request handlers
├── factories/        # Entity factories
├── middleware/       # Express middleware (validation, error handling)
├── repositories/     # Data access layer (using Prisma)
├── routes/           # Route definitions
├── services/         # Business logic layer
├── types/            # TypeScript interfaces and types
├── container/        # Dependency injection container
└── server.ts         # Application entry point

tests/
└── unit/            # Unit tests
```

## Architecture Principles

This project follows clean architecture principles:

- **SOLID Principles**: Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion
- **Repository Pattern**: Abstracts data access logic
- **Factory Pattern**: Creates entity instances
- **Dependency Injection**: Manages dependencies and enables testing
- **Service Layer**: Contains business logic
- **Validation Layer**: Ensures data integrity

## Deployment

### Azure Web App Deployment

This project is configured for deployment to Azure Web App with the following setup:

1. **Azure Web App Setup**:
   - Create a new Web App in Azure Portal
   - Choose Node.js runtime (18.x LTS)
   - Configure environment variables in Azure Portal

2. **GitHub Actions Deployment**:
   - The project includes `.github/workflows/azure-deploy.yml` for automated deployment
   - Add your Azure Web App publish profile as a secret named `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Push to `main` branch to trigger deployment

3. **Manual Deployment**:
   ```bash
   # Build the project
   npm run build

   # Deploy using Azure CLI
   az webapp up --sku F1 --name your-app-name --location "East US"
   ```

4. **Environment Variables for Azure**:
   Configure these in Azure Portal → Configuration → Application Settings:
   ```
   DATABASE_URL=your_production_database_url
   NODE_ENV=production
   PORT=80
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Run linter: `npm run lint`
6. Build project: `npm run build`
7. Submit a pull request

## License

MIT