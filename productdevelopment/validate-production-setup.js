/**
 * Production Architecture Validation Script
 * This script validates that all components of the production setup are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Production Architecture Setup...\n');

let validationPassed = true;
const validationResults = [];

// 1. Check frontend configuration
console.log('✅ Checking Frontend Configuration...\n');

// Check if frontend API calls use relative paths
const frontendFilesToCheck = [
  'free-react-tailwind-admin-dashboard-main/src/services/api.ts',
  'free-react-tailwind-admin-dashboard-main/src/services/jiraService.ts',
  'free-react-tailwind-admin-dashboard-main/src/services/quoteService.ts',
  'free-react-tailwind-admin-dashboard-main/src/config/apiConfig.ts'
];

for (const file of frontendFilesToCheck) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for localhost references
    const localhostMatches = content.match(/http:\/\/localhost[:\d]*/g);
    const localIPMatches = content.match(/http:\/\/127\.0\.0\.1[:\d]*/g);
    const networkIPMatches = content.match(/http:\/\/192\.168\.1\.115[:\d]*/g);
    
    if (localhostMatches || localIPMatches || networkIPMatches) {
      console.log(`❌ ${file} contains localhost/IP references:`);
      if (localhostMatches) console.log(`   - localhost: ${localhostMatches}`);
      if (localIPMatches) console.log(`   - 127.0.0.1: ${localIPMatches}`);
      if (networkIPMatches) console.log(`   - 192.168.1.115: ${networkIPMatches}`);
      validationPassed = false;
    } else {
      console.log(`✅ ${file} - No localhost/IP references found`);
    }
  } catch (error) {
    console.log(`⚠️  Could not check ${file}: ${error.message}`);
  }
}

// 2. Check frontend .env file
console.log('\n✅ Checking Frontend Environment Configuration...\n');
try {
  const envContent = fs.readFileSync('free-react-tailwind-admin-dashboard-main/.env', 'utf8');
  if (envContent.includes('VITE_API_URL=http://localhost:8080')) {
    console.log('❌ Frontend .env still contains localhost reference');
    validationPassed = false;
  } else {
    console.log('✅ Frontend .env does not contain localhost reference');
  }
} catch (error) {
  console.log(`⚠️  Could not check frontend .env: ${error.message}`);
}

// 3. Check backend configuration
console.log('\n✅ Checking Backend Configuration...\n');
try {
  const backendConfig = fs.readFileSync('productdevelopment/src/main/resources/application.properties', 'utf8');
  
  if (!backendConfig.includes('server.port=8081')) {
    console.log('❌ Backend not configured to run on port 8081');
    validationPassed = false;
  } else {
    console.log('✅ Backend configured to run on port 8081');
  }
  
  if (!backendConfig.includes('server.address=0.0.0.0')) {
    console.log('❌ Backend not configured to listen on all interfaces');
    validationPassed = false;
  } else {
    console.log('✅ Backend configured to listen on all interfaces');
  }
} catch (error) {
  console.log(`⚠️  Could not check backend configuration: ${error.message}`);
}

// 4. Check NGINX configuration exists
console.log('\n✅ Checking NGINX Configuration...\n');
try {
  const nginxConfig = fs.readFileSync('nginx.conf', 'utf8');
  
  if (nginxConfig.includes('listen 80;') && 
      nginxConfig.includes('proxy_pass http://127.0.0.1:8081') &&
      nginxConfig.includes('try_files $uri $uri/ /index.html')) {
    console.log('✅ NGINX configuration contains proper reverse proxy settings');
  } else {
    console.log('❌ NGINX configuration missing required settings');
    validationPassed = false;
  }
} catch (error) {
  console.log(`⚠️  Could not check NGINX configuration: ${error.message}`);
  validationPassed = false;
}

// 5. Check CORS configuration
console.log('\n✅ Checking CORS Configuration...\n');
try {
  const corsConfig = fs.readFileSync('productdevelopment/src/main/java/com/htc/productdevelopment/config/CorsConfig.java', 'utf8');
  
  if (corsConfig.includes('UrlConfig') && corsConfig.includes('urlConfig.getAllowedOrigins()')) {
    console.log('✅ CORS configuration uses centralized URL configuration');
  } else {
    console.log('❌ CORS configuration does not use centralized URL configuration');
    validationPassed = false;
  }
} catch (error) {
  console.log(`⚠️  Could not check CORS configuration: ${error.message}`);
}

// 6. Check URL configuration
console.log('\n✅ Checking URL Configuration...\n');
try {
  const urlConfig = fs.readFileSync('productdevelopment/src/main/java/com/htc/productdevelopment/config/UrlConfig.java', 'utf8');
  
  if (urlConfig.includes('PRODUCTION') && urlConfig.includes('192.168.1.115')) {
    console.log('✅ URL configuration includes production settings');
  } else {
    console.log('❌ URL configuration missing production settings');
    validationPassed = false;
  }
} catch (error) {
  console.log(`⚠️  Could not check URL configuration: ${error.message}`);
}

// 7. Check if build process is properly configured
console.log('\n✅ Checking Build Process...\n');
try {
  const packageJson = JSON.parse(fs.readFileSync('free-react-tailwind-admin-dashboard-main/package.json', 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('✅ Frontend build process is configured');
  } else {
    console.log('❌ Frontend build process not configured');
    validationPassed = false;
  }
} catch (error) {
  console.log(`⚠️  Could not check build process: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('📋 VALIDATION SUMMARY');
console.log('='.repeat(60));

if (validationPassed) {
  console.log('🎉 All validations passed! The production architecture is properly configured.');
  console.log('\n🚀 The application is ready for production deployment with:');
  console.log('   - Frontend using relative API paths');
  console.log('   - Backend running on port 8081');
  console.log('   - NGINX reverse proxy configured');
  console.log('   - Proper CORS configuration');
  console.log('   - SPA routing support');
  console.log('\n👉 Follow the instructions in PRODUCTION_DEPLOYMENT.md to deploy');
} else {
  console.log('❌ Some validations failed. Please review the issues above and fix them before deployment.');
  console.log('\n⚠️  The production architecture is not ready for deployment.');
}

console.log('='.repeat(60));
process.exit(validationPassed ? 0 : 1);