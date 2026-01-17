export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Database migrations are now handled by Prisma
    // Run `npx prisma migrate deploy` in production or `npx prisma migrate dev` in development
    // No need to run Drizzle migrations anymore

    await import('./lib/config/index');
  }
};
