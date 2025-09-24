const { spawn } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bright}${colors.cyan}=== BLOG SYSTEM API SETUP & TEST ===${colors.reset}\n`);

// Function to run a command and return a promise
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.yellow}► Running: ${command} ${args.join(' ')}${colors.reset}\n`);
    
    const childProcess = spawn(command, args, { stdio: 'inherit' });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✓ Command completed successfully${colors.reset}\n`);
        resolve();
      } else {
        console.error(`${colors.magenta}✗ Command failed with code ${code}${colors.reset}\n`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    childProcess.on('error', (error) => {
      console.error(`${colors.magenta}✗ Failed to start command: ${error}${colors.reset}\n`);
      reject(error);
    });
  });
}

// Main function to run all steps
async function runSetupAndTest() {
  try {
    // Step 1: Seed the database
    console.log(`${colors.bright}STEP 1: Seeding database with admin and user accounts${colors.reset}`);
    await runCommand('node', [path.join(__dirname, 'seeders/userSeeder.js')]);
    
    // Give the server a moment to process everything
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Run the API tests
    console.log(`${colors.bright}STEP 2: Running API tests${colors.reset}`);
    await runCommand('node', [path.join(__dirname, 'tests/authTest.js')]);
    
    console.log(`${colors.bright}${colors.green}All steps completed successfully!${colors.reset}`);
    console.log(`
${colors.cyan}Test credentials${colors.reset}:
- Admin: admin@example.com / password123
- User: user@example.com / password123
    `);
  } catch (error) {
    console.error(`${colors.magenta}Setup and test process failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run everything
runSetupAndTest(); 