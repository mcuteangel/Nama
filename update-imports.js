#!/usr/bin/env node

/**
 * Script to update import paths after component reorganization
 * This script updates all TypeScript/TSX files to use the new organized structure
 */

const fs = require('fs');
const path = require('path');

// Mapping of old import paths to new ones
const importMappings = {
  // Layout components
  "'./components/MobileHeader'": "'./components/layout/MobileHeader'",
  "'./components/BottomNavigationBar'": "'./components/layout/BottomNavigationBar'", 
  "'./components/Sidebar'": "'./components/layout/Sidebar'",
  "'./components/Footer'": "'./components/layout/Footer'",
  "'@/components/MobileHeader'": "'@/components/layout/MobileHeader'",
  "'@/components/BottomNavigationBar'": "'@/components/layout/BottomNavigationBar'", 
  "'@/components/Sidebar'": "'@/components/layout/Sidebar'",
  "'@/components/Footer'": "'@/components/layout/Footer'",

  // Auth components
  "'./components/ProtectedRoute'": "'./components/auth/ProtectedRoute'",
  "'@/components/ProtectedRoute'": "'@/components/auth/ProtectedRoute'",

  // AI components
  "'./components/AISuggestionCard'": "'./components/ai/AISuggestionCard'",
  "'./components/GeminiSettings'": "'./components/ai/GeminiSettings'",
  "'./components/GenderSuggestionManagement'": "'./components/ai/GenderSuggestionManagement'",
  "'@/components/AISuggestionCard'": "'@/components/ai/AISuggestionCard'",
  "'@/components/GeminiSettings'": "'@/components/ai/GeminiSettings'",
  "'@/components/GenderSuggestionManagement'": "'@/components/ai/GenderSuggestionManagement'",

  // Settings components
  "'./components/ThemeToggle'": "'./components/settings/ThemeToggle'",
  "'./components/LanguageSetting'": "'./components/settings/LanguageSetting'",
  "'./components/CalendarTypeSetting'": "'./components/settings/CalendarTypeSetting'",
  "'./components/DebugSettings'": "'./components/settings/DebugSettings'",
  "'@/components/ThemeToggle'": "'@/components/settings/ThemeToggle'",
  "'@/components/LanguageSetting'": "'@/components/settings/LanguageSetting'",
  "'@/components/CalendarTypeSetting'": "'@/components/settings/CalendarTypeSetting'",
  "'@/components/DebugSettings'": "'@/components/settings/DebugSettings'",

  // User management components
  "'./components/UserForm'": "'./components/user-management/UserForm'",
  "'./components/UserList'": "'./components/user-management/UserList'",
  "'./components/UserProfile'": "'./components/user-management/UserProfile'",
  "'./components/UserProfileForm'": "'./components/user-management/UserProfileForm'",
  "'@/components/UserForm'": "'@/components/user-management/UserForm'",
  "'@/components/UserList'": "'@/components/user-management/UserList'",
  "'@/components/UserProfile'": "'@/components/user-management/UserProfile'",
  "'@/components/UserProfileForm'": "'@/components/user-management/UserProfileForm'",

  // Groups components
  "'./components/GroupForm'": "'./components/groups/GroupForm'",
  "'./components/GroupList'": "'./components/groups/GroupList'",
  "'./components/AddGroupDialog'": "'./components/groups/AddGroupDialog'",
  "'./components/SmartGroupManagement'": "'./components/groups/SmartGroupManagement'",
  "'@/components/GroupForm'": "'@/components/groups/GroupForm'",
  "'@/components/GroupList'": "'@/components/groups/GroupList'",
  "'@/components/AddGroupDialog'": "'@/components/groups/AddGroupDialog'",
  "'@/components/SmartGroupManagement'": "'@/components/groups/SmartGroupManagement'",

  // Common components
  "'./components/EmptyState'": "'./components/common/EmptyState'",
  "'./components/LoadingMessage'": "'./components/common/LoadingMessage'",
  "'./components/LoadingSpinner'": "'./components/common/LoadingSpinner'",
  "'./components/CancelButton'": "'./components/common/CancelButton'",
  "'./components/ColorPicker'": "'./components/common/ColorPicker'",
  "'./components/FormDialogWrapper'": "'./components/common/FormDialogWrapper'",
  "'./components/SuspenseWrapper'": "'./components/common/SuspenseWrapper'",
  "'@/components/EmptyState'": "'@/components/common/EmptyState'",
  "'@/components/LoadingMessage'": "'@/components/common/LoadingMessage'",
  "'@/components/LoadingSpinner'": "'@/components/common/LoadingSpinner'",
  "'@/components/CancelButton'": "'@/components/common/CancelButton'",
  "'@/components/ColorPicker'": "'@/components/common/ColorPicker'",
  "'@/components/FormDialogWrapper'": "'@/components/common/FormDialogWrapper'",
  "'@/components/SuspenseWrapper'": "'@/components/common/SuspenseWrapper'",

  // Performance components
  "'./components/BundleSizeMonitor'": "'./components/performance/BundleSizeMonitor'",
  "'./components/PerformanceDashboard'": "'./components/performance/PerformanceDashboard'",
  "'@/components/BundleSizeMonitor'": "'@/components/performance/BundleSizeMonitor'",
  "'@/components/PerformanceDashboard'": "'@/components/performance/PerformanceDashboard'",
};

/**
 * Recursively find all TypeScript/TSX files in a directory
 */
function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTsFiles(fullPath, files);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Update imports in a single file
 */
function updateFileImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply all import mappings
    for (const [oldPath, newPath] of Object.entries(importMappings)) {
      if (content.includes(oldPath)) {
        content = content.replace(new RegExp(oldPath.replace(/'/g, "\\'"), 'g'), newPath);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Updating import paths after component reorganization...\n');
  
  const srcDir = path.join(__dirname, 'src');
  const tsFiles = findTsFiles(srcDir);
  
  let updatedCount = 0;
  
  for (const file of tsFiles) {
    if (updateFileImports(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n📦 Import path update complete!`);
  console.log(`   Files processed: ${tsFiles.length}`);
  console.log(`   Files updated: ${updatedCount}`);
  
  if (updatedCount > 0) {
    console.log('\n⚠️  Please verify the changes and run tests to ensure everything works correctly.');
  }
}

main();