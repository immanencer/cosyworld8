import avatarRoutes from './routes/avatars.mjs';
// ...existing code...

const db = await initializeDatabase(); // Ensure this function initializes the database properly
if (!db) {
  console.error("Failed to initialize database. Exiting...");
  process.exit(1);
}

app.use('/api/admin/avatars', avatarRoutes(db));

// ...existing code...