
# Debt Collection Management System

This is a React.js application built with Vite.

## Run locally

1. Install dependencies:
   - `npm install`
2. Start the development server:
   - `npm run dev`
3. Build for production:
   - `npm run build`
4. Preview the production build:
   - `npm run preview`

##If you want to create your own local DB
What you just need:

1. a PostgreSQL server
2. the same schema (prisma migrate or db push)
3. correct connection string
   
Example .env:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dcms_local?schema=public" (refer to .env file)

Then run:

_For docker_: 

- docker compose up -d

_From the root folder_: 
- `cd server`
- `npm install`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run dev`

