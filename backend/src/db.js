const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.kcfjfeaqvammpkesoizc:Finanzas123@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false 
  }
});

module.exports = pool;