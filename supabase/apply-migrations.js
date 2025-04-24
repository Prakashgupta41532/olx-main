import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to apply a migration file to Supabase
const applyMigration = (filePath) => {
  try {
    console.log(`Applying migration: ${path.basename(filePath)}`);
    
    // Get the SQL content
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Use Supabase CLI to execute the SQL
    // Note: Make sure you're logged in to Supabase CLI and have selected the correct project
    const command = `echo "${sqlContent}" | supabase db execute`;
    
    execSync(command, { stdio: 'inherit' });
    console.log(`Successfully applied migration: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`Failed to apply migration ${path.basename(filePath)}:`, error.message);
    return false;
  }
};

// Get all migration files
const migrationsDir = path.join(__dirname, 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Sort to apply in order

console.log(`Found ${migrationFiles.length} migration files to apply.`);

// Apply each migration
let successCount = 0;
for (const file of migrationFiles) {
  const filePath = path.join(migrationsDir, file);
  const success = applyMigration(filePath);
  if (success) successCount++;
}

console.log(`Applied ${successCount}/${migrationFiles.length} migrations successfully.`);
