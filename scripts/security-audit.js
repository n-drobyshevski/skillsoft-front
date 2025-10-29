#!/usr/bin/env node

// Security Audit Script for ESLint
// This script runs comprehensive security checks and generates a report

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Starting Security Audit...\n');

// Security-focused ESLint rules to check
const securityRules = [
  'security/detect-object-injection',
  'security/detect-unsafe-regex',
  'security/detect-buffer-noassert',
  'security/detect-child-process',
  'security/detect-disable-mustache-escape',
  'security/detect-eval-with-expression',
  'security/detect-new-buffer',
  'security/detect-non-literal-fs-filename',
  'security/detect-non-literal-regexp',
  'security/detect-non-literal-require',
  'security/detect-possible-timing-attacks',
  'security/detect-pseudoRandomBytes',
  'no-unsanitized/method',
  'no-unsanitized/property',
  'xss/no-mixed-html',
  'xss/no-location-href-assign',
  '@microsoft/sdl/no-document-domain',
  '@microsoft/sdl/no-document-write',
  '@microsoft/sdl/no-html-method',
  '@microsoft/sdl/no-inner-html',
  '@microsoft/sdl/no-insecure-url',
  '@microsoft/sdl/no-postmessage-star-origin'
];

try {
  // Run security-focused lint
  console.log('📋 Running security lint checks...');
  execSync('npx eslint . --format json --output-file security-report.json', { stdio: 'pipe' });
  console.log('✅ Security lint completed - no issues found!');
} catch (error) {
  console.log('⚠️  Security issues detected - generating report...');
}

// Check if report exists and process it
if (fs.existsSync('security-report.json')) {
  try {
    const report = JSON.parse(fs.readFileSync('security-report.json', 'utf8'));
    
    let securityIssues = 0;
    let totalIssues = 0;
    
    console.log('\n🔍 Security Audit Results:\n');
    
    report.forEach(file => {
      if (file.messages.length > 0) {
        const securityMessages = file.messages.filter(msg => 
          securityRules.some(rule => msg.ruleId && msg.ruleId.includes(rule.split('/')[0]))
        );
        
        if (securityMessages.length > 0) {
          console.log(`📁 ${path.relative(process.cwd(), file.filePath)}:`);
          securityMessages.forEach(msg => {
            console.log(`   ❌ Line ${msg.line}: ${msg.message} (${msg.ruleId})`);
            securityIssues++;
          });
          console.log('');
        }
        
        totalIssues += file.messages.length;
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   🔒 Security Issues: ${securityIssues}`);
    console.log(`   📝 Total Issues: ${totalIssues}`);
    console.log(`   📁 Files Scanned: ${report.length}`);
    
    if (securityIssues === 0) {
      console.log('\n🎉 Great! No security vulnerabilities detected!');
    } else {
      console.log('\n⚠️  Please review and fix the security issues above.');
    }
    
  } catch (parseError) {
    console.error('Error parsing security report:', parseError.message);
  }
}

console.log('\n🔒 Security audit completed!');