const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ID = 'naesxujdffcmatntrlfr';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXN4dWpkZmZjbWF0bnRybGZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY3MjA4MiwiZXhwIjoyMDkxMjQ4MDgyfQ.Yi8rHH7HZ9vIaIpE4ud-U264naXEf_Dn0MDHOtCkO-M';

class DatabaseManager {
  constructor() {
    this.baseUrl = SUPABASE_URL;
    this.serviceRoleKey = SERVICE_ROLE_KEY;
    this.projectId = PROJECT_ID;
  }

  // Make HTTP request to Supabase Management API
  async managementRequest(endpoint, method = 'GET', body = null) {
    const url = `https://api.supabase.com/v1${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    };
    return this.httpRequest(url, method, headers, body);
  }

  // Make HTTP request to project REST API
  async projectRequest(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    return this.httpRequest(url, method, headers, body);
  }

  // Generic HTTP request
  httpRequest(url, method, headers, body = null) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: headers
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) {
              reject(new Error(`${res.statusCode}: ${JSON.stringify(parsed)}`));
            } else {
              resolve({ status: res.statusCode, data: parsed });
            }
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  // Execute SQL via Management API
  async executeSQL(sql, description = 'SQL execution') {
    console.log(`\n📝 ${description}...`);
    console.log('   SQL:', sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
    
    try {
      const result = await this.managementRequest(
        `/projects/${this.projectId}/sql`,
        'POST',
        { query: sql }
      );
      console.log('✅ Success');
      return result;
    } catch (error) {
      console.error('❌ Failed:', error.message);
      throw error;
    }
  }

  // Get current database schema state
  async getSchemaState() {
    console.log('\n🔍 Analyzing current database schema...\n');
    
    const queries = [
      {
        name: 'List all tables',
        sql: `
          SELECT table_name, table_schema 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name;
        `
      },
      {
        name: 'Check migration tracking',
        sql: `
          SELECT * FROM _migrations ORDER BY applied_at DESC LIMIT 10;
        `
      },
      {
        name: 'Check products table structure',
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'products' 
          ORDER BY ordinal_position;
        `
      },
      {
        name: 'Check users table structure',
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          ORDER BY ordinal_position;
        `
      },
      {
        name: 'Check vendors table structure',
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'vendors' 
          ORDER BY ordinal_position;
        `
      }
    ];

    const results = {};
    for (const query of queries) {
      try {
        const result = await this.managementRequest(
          `/projects/${this.projectId}/sql`,
          'POST',
          { query: query.sql }
        );
        results[query.name] = result.data;
        console.log(`✅ ${query.name}: Retrieved`);
      } catch (error) {
        console.log(`⚠️  ${query.name}: ${error.message.split(':')[0]}`);
        results[query.name] = null;
      }
    }

    return results;
  }

  // Check project health
  async checkProjectHealth() {
    console.log('🏥 Checking project health...\n');
    
    try {
      const { data: project } = await this.managementRequest(`/projects/${this.projectId}`);
      console.log('Project ID:', project.id);
      console.log('Status:', project.status);
      console.log('Region:', project.region);
      console.log('Created:', project.created_at);
      return project;
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return null;
    }
  }

  // Run a migration file
  async runMigration(filePath) {
    console.log(`\n🚀 Running migration: ${path.basename(filePath)}`);
    
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Wrap in transaction
      const transactionSQL = `
        BEGIN;
        ${sql}
        COMMIT;
      `;

      await this.executeSQL(transactionSQL, `Migration: ${path.basename(filePath)}`);
      console.log('✅ Migration completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      return false;
    }
  }

  // Create unified migration plan
  async createMigrationPlan() {
    console.log('\n📋 Creating migration execution plan...\n');
    
    const migrationDirs = [
      'D:\\fyaz.2\\purple\\project\\dark-purple\\supabase\\migrations',
      'D:\\fyaz.2\\purple\\project\\dashboard\\supabase\\migrations',
      'D:\\fyaz.2\\purple\\project\\supabase\\migrations'
    ];

    const allMigrations = [];
    
    for (const dir of migrationDirs) {
      if (!fs.existsSync(dir)) {
        console.log(`⚠️  Directory not found: ${dir}`);
        continue;
      }

      const files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.sql'))
        .filter(f => !f.includes('README'))
        .sort();

      console.log(`\n📁 ${path.basename(path.dirname(dir))}/${path.basename(dir)}`);
      console.log(`   Found ${files.length} migration files`);

      for (const file of files) {
        allMigrations.push({
          dir: path.basename(dir),
          file: file,
          path: path.join(dir, file),
          size: fs.statSync(path.join(dir, file)).size
        });
      }
    }

    console.log(`\n📊 Total migrations to process: ${allMigrations.length}`);
    return allMigrations;
  }

  // Test main app tables exist
  async testMainAppTables() {
    console.log('\n🧪 Testing main app (dark-purple) tables...\n');
    
    const tables = ['products', 'categories', 'collections', 'users', 'vendors', 'cart_items', 'orders', 'wishlist'];
    
    for (const table of tables) {
      try {
        const { data } = await this.projectRequest(`/rest/v1/${table}?select=count&limit=1`);
        if (Array.isArray(data)) {
          console.log(`✅ ${table}: EXISTS (${data.length} rows)`);
        } else {
          console.log(`✅ ${table}: EXISTS`);
        }
      } catch (error) {
        console.log(`❌ ${table}: ${error.message.split(':')[0]}`);
      }
    }
  }

  // Test dashboard tables exist
  async testDashboardTables() {
    console.log('\n🧪 Testing dashboard tables...\n');
    
    const tables = ['vendors', 'products', 'inventory', 'orders', 'admin_users', 'support_tickets'];
    
    for (const table of tables) {
      try {
        const { data } = await this.projectRequest(`/rest/v1/${table}?select=count&limit=1`);
        if (Array.isArray(data)) {
          console.log(`✅ ${table}: EXISTS (${data.length} rows)`);
        } else {
          console.log(`✅ ${table}: EXISTS`);
        }
      } catch (error) {
        console.log(`❌ ${table}: ${error.message.split(':')[0]}`);
      }
    }
  }

  // Full diagnostic report
  async fullDiagnostic() {
    console.log('='.repeat(60));
    console.log('SUPABASE DATABASE DIAGNOSTIC REPORT');
    console.log('='.repeat(60));
    
    await this.checkProjectHealth();
    await this.getSchemaState();
    await this.testMainAppTables();
    await this.testDashboardTables();
    
    console.log('\n' + '='.repeat(60));
    console.log('DIAGNOSTIC COMPLETE');
    console.log('='.repeat(60));
  }
}

// CLI Interface
async function main() {
  const manager = new DatabaseManager();
  const command = process.argv[2] || 'diagnostic';

  switch (command) {
    case 'diagnostic':
      await manager.fullDiagnostic();
      break;
    case 'health':
      await manager.checkProjectHealth();
      break;
    case 'schema':
      await manager.getSchemaState();
      break;
    case 'test-main':
      await manager.testMainAppTables();
      break;
    case 'test-dashboard':
      await manager.testDashboardTables();
      break;
    case 'plan':
      await manager.createMigrationPlan();
      break;
    case 'migrate':
      const file = process.argv[3];
      if (!file) {
        console.error('Usage: node database-manager.cjs migrate <file.sql>');
        process.exit(1);
      }
      await manager.runMigration(file);
      break;
    default:
      console.log('Available commands:');
      console.log('  diagnostic        - Full diagnostic report');
      console.log('  health            - Check project health');
      console.log('  schema            - Analyze schema state');
      console.log('  test-main         - Test main app tables');
      console.log('  test-dashboard    - Test dashboard tables');
      console.log('  plan              - Create migration plan');
      console.log('  migrate <file>    - Run migration file');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseManager;
