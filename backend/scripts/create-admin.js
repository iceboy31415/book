require('dotenv').config();
const bcrypt = require('bcryptjs');
const { run, get } = require('../database');

async function createDefaultAdmin() {
  try {
    const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@bookblinks.com';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    // Check if admin already exists
    const existingAdmin = await get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingAdmin) {
      console.log('❌ Admin user already exists!');
      console.log(`Username: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email}`);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const result = await run(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, 'admin')
    `, [username, email, hashedPassword]);

    console.log('✅ Default admin user created successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('═══════════════════════════════════════');
    console.log('⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createDefaultAdmin();
