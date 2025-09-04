# Deployment Guide

This guide will help you deploy the Career Counselor application to Vercel.

## Prerequisites

- Vercel account
- OpenAI API key
- GitHub repository (optional but recommended)

## Step 1: Prepare Your Repository

1. **Push to GitHub** (recommended):
   ```bash
   git add .
   git commit -m "Initial commit: Career Counselor app"
   git push origin main
   ```

2. **Environment Variables**:
   Create a `.env.local` file with your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```

### Option B: Deploy via Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project**:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Add Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NEXTAUTH_SECRET`: A random secret string
   - `NEXTAUTH_URL`: Your Vercel app URL

6. **Deploy**

## Step 3: Database Configuration

### For Production (Recommended)

The current setup uses SQLite which is not suitable for production. Consider these alternatives:

#### Option 1: Neon (PostgreSQL)

1. **Create a Neon account** at [neon.tech](https://neon.tech)
2. **Create a new database**
3. **Update your environment variables**:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

4. **Update database configuration** in `src/lib/db/index.ts`:
   ```typescript
   import { drizzle } from 'drizzle-orm/postgres-js';
   import postgres from 'postgres';

   const connectionString = process.env.DATABASE_URL!;
   const client = postgres(connectionString);
   export const db = drizzle(client, { schema });
   ```

5. **Install PostgreSQL driver**:
   ```bash
   npm install postgres
   ```

#### Option 2: Supabase (PostgreSQL)

1. **Create a Supabase account** at [supabase.com](https://supabase.com)
2. **Create a new project**
3. **Get your database URL** from Settings > Database
4. **Follow the same steps as Neon**

#### Option 3: PlanetScale (MySQL)

1. **Create a PlanetScale account** at [planetscale.com](https://planetscale.com)
2. **Create a new database**
3. **Update your environment variables**:
   ```env
   DATABASE_URL=mysql://username:password@host:port/database
   ```

4. **Update database configuration** in `src/lib/db/index.ts`:
   ```typescript
   import { drizzle } from 'drizzle-orm/mysql2';
   import mysql from 'mysql2/promise';

   const connection = await mysql.createConnection(process.env.DATABASE_URL!);
   export const db = drizzle(connection, { schema });
   ```

5. **Install MySQL driver**:
   ```bash
   npm install mysql2
   ```

## Step 4: Run Database Migrations

After setting up your production database:

1. **Update Drizzle config** in `drizzle.config.ts`:
   ```typescript
   import { defineConfig } from 'drizzle-kit';

   export default defineConfig({
     schema: './src/lib/db/schema.ts',
     out: './drizzle',
     dialect: 'postgresql', // or 'mysql'
     dbCredentials: {
       url: process.env.DATABASE_URL!,
     },
   });
   ```

2. **Generate migrations**:
   ```bash
   npm run db:generate
   ```

3. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

## Step 5: Configure Domain (Optional)

1. **Go to your Vercel project dashboard**
2. **Click on "Domains"**
3. **Add your custom domain**
4. **Update DNS records** as instructed

## Step 6: Monitor and Maintain

### Monitoring

- **Vercel Analytics**: Enable in your project dashboard
- **Error Tracking**: Consider adding Sentry or similar
- **Performance**: Monitor Core Web Vitals

### Maintenance

- **Regular Updates**: Keep dependencies updated
- **Database Backups**: Set up automated backups
- **Security**: Regularly rotate API keys and secrets

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables are set
   - Verify all dependencies are installed
   - Check TypeScript errors

2. **Database Connection Issues**:
   - Verify DATABASE_URL is correct
   - Check database credentials
   - Ensure database is accessible from Vercel

3. **API Errors**:
   - Verify OpenAI API key is valid
   - Check API rate limits
   - Monitor Vercel function logs

### Debugging

1. **Check Vercel Function Logs**:
   ```bash
   vercel logs
   ```

2. **Local Testing**:
   ```bash
   npm run build
   npm run start
   ```

3. **Environment Variables**:
   ```bash
   vercel env ls
   ```

## Security Considerations

1. **Environment Variables**: Never commit API keys to version control
2. **API Rate Limits**: Implement proper rate limiting
3. **Input Validation**: Validate all user inputs
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure CORS properly if needed

## Performance Optimization

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Implement proper code splitting
3. **Caching**: Use appropriate caching strategies
4. **CDN**: Leverage Vercel's global CDN

## Cost Optimization

1. **Function Timeout**: Optimize API response times
2. **Database Queries**: Optimize database queries
3. **Static Assets**: Use appropriate caching headers
4. **Monitoring**: Monitor usage and costs

## Support

If you encounter issues:

1. **Check Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Community Support**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
3. **Open an Issue**: Create an issue in your repository

---

**Happy Deploying! 🚀**
