const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ID = 'naesxujdffcmatntrlfr';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXN4dWpkZmZjbWF0bnRybGZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY3MjA4MiwiZXhwIjoyMDkxMjQ4MDgyfQ.Yi8rHH7HZ9vIaIpE4ud-U264naXEf_Dn0MDHOtCkO-M';

class SupabaseManager {
  constructor() {
    this.baseUrl = SUPABASE_URL;
    this.serviceRoleKey = SERVICE_ROLE_KEY;
    this.projectId = PROJECT_ID;
  }

  // Make authenticated request to Supabase Management API
  async managementAPI(method, endpoint, body = null) {
    const url = `https://api.supabase.com/v1${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    };

    return this.makeRequest(url, method, headers, body);
  }

  // Make authenticated request to project REST API
  async projectAPI(method, endpoint, body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    return this.makeRequest(url, method, headers, body);
  }

  // Generic HTTP request
  makeRequest(url, method, headers, body = null) {
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
              resolve(parsed);
            }
          } catch (e) {
            resolve(data);
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  // Execute SQL query on the database
  async executeSQL(sql) {
    console.log('📝 Executing SQL...');
    console.log(sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
    
    try {
      // Use the SQL execution endpoint
      const result = await this.managementAPI('POST', `/projects/${this.projectId}/sql`, {
        query: sql
      });
      console.log('✅ SQL executed successfully');
      return result;
    } catch (error) {
      console.error('❌ SQL execution failed:', error.message);
      throw error;
    }
  }

  // List all tables
  async listTables() {
    console.log('\n📋 Listing database tables...');
    try {
      const tables = await this.projectAPI('GET', '/rest/v1/');
      if (Array.isArray(tables)) {
        console.log(`Found ${tables.length} tables:`);
        tables.forEach(t => console.log(`  - ${t.name || t}`));
        return tables;
      } else {
        console.log('Tables:', tables);
        return tables;
      }
    } catch (error) {
      console.error('❌ Failed to list tables:', error.message);
      return null;
    }
  }

  // Get project info
  async getProjectInfo() {
    console.log('\n🔍 Getting project information...');
    try {
      const info = await this.managementAPI('GET', `/projects/${this.projectId}`);
      console.log('Project ID:', info.id);
      console.log('Status:', info.status);
      console.log('Region:', info.region);
      return info;
    } catch (error) {
      console.error('❌ Failed to get project info:', error.message);
      return null;
    }
  }

  // Run migration from SQL file
  async runMigration(migrationFile) {
    console.log(`\n🚀 Running migration: ${migrationFile}`);
    try {
      const sql = fs.readFileSync(migrationFile, 'utf8');
      const result = await this.executeSQL(sql);
      console.log('✅ Migration completed');
      return result;
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  // List all pending migrations
  async listMigrations() {
    console.log('\n📁 Checking migrations...');
    try {
      const migrations = await this.managementAPI('GET', `/projects/${this.projectId}/migrations`);
      console.log('Migrations:', JSON.stringify(migrations, null, 2));
      return migrations;
    } catch (error) {
      console.error('❌ Failed to list migrations:', error.message);
      return null;
    }
  }

  // Test connection
  async testConnection() {
    console.log('🔍 Testing Supabase connection...\n');
    console.log('Project:', this.projectId);
    console.log('URL:', this.baseUrl);
    console.log('Service Role Key:', this.serviceRoleKey.substring(0, 20) + '...\n');

    try {
      await this.getProjectInfo();
      await this.listTables();
      console.log('\n✅ Connection successful!');
      return true;
    } catch (error) {
      console.error('\n❌ Connection failed');
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const manager = new SupabaseManager();
  const command = process.argv[2] || 'test';

  switch (command) {
    case 'test':
      await manager.testConnection();
      break;

    case 'tables':
      await manager.listTables();
      break;

    case 'info':
      await manager.getProjectInfo();
      break;

    case 'migrate':
      const migrationFile = process.argv[3];
      if (!migrationFile) {
        console.error('Usage: node supabase-manager.cjs migrate <migration-file.sql>');
        process.exit(1);
      }
      await manager.runMigration(migrationFile);
      break;

    case 'sql':
      const sqlFile = process.argv[3];
      if (!sqlFile) {
        console.error('Usage: node supabase-manager.cjs sql <sql-file.sql>');
        process.exit(1);
      }
      const sql = fs.readFileSync(sqlFile, 'utf8');
      await manager.executeSQL(sql);
      break;

    case 'migrations':
      await manager.listMigrations();
      break;

    default:
      console.log('Available commands:');
      console.log('  test                    - Test connection');
      console.log('  tables                  - List all tables');
      console.log('  info                    - Show project info');
      console.log('  migrate <file.sql>      - Run migration');
      console.log('  sql <file.sql>          - Execute SQL file');
      console.log('  migrations              - List migrations');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SupabaseManager;
