#!/usr/bin/env python3
"""
Production Cleanup Script for ProWrite
Removes all debug statements, test files, and non-production code
"""

import os
import re
import glob
from pathlib import Path

def remove_debug_statements(file_path):
    """Remove debug statements from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Remove print statements (but keep essential logging)
        content = re.sub(r'^\s*print\([^)]*\)\s*$', '', content, flags=re.MULTILINE)
        
        # Remove console.log statements
        content = re.sub(r'^\s*console\.log\([^)]*\)\s*;?\s*$', '', content, flags=re.MULTILINE)
        
        # Remove debugger statements
        content = re.sub(r'^\s*debugger\s*;?\s*$', '', content, flags=re.MULTILINE)
        
        # Remove alert statements
        content = re.sub(r'^\s*alert\([^)]*\)\s*;?\s*$', '', content, flags=re.MULTILINE)
        
        # Remove traceback.print_exc() but keep proper logging
        content = re.sub(r'^\s*traceback\.print_exc\(\)\s*$', '', content, flags=re.MULTILINE)
        
        # Clean up empty lines
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Cleaned: {file_path}")
            return True
        return False
        
    except Exception as e:
        print(f"❌ Error cleaning {file_path}: {e}")
        return False

def remove_test_files():
    """Remove test and debug files"""
    patterns = [
        'test_*.py',
        'debug_*.py', 
        'quick_*.py',
        '*_test.py',
        'check_*.py',
        'verify_*.py',
        'setup_*.py',
        'create_*.py',
        'fix_*.py',
        'update_*.py',
        'simple_*.py',
        'demo_*.py',
        'phase*.py',
        '*.backup',
        '*.bak'
    ]
    
    removed_count = 0
    for pattern in patterns:
        for file_path in glob.glob(f'backend/{pattern}'):
            if os.path.isfile(file_path):
                os.remove(file_path)
                print(f"🗑️  Removed: {file_path}")
                removed_count += 1
    
    return removed_count

def clean_directory(directory, extensions):
    """Clean all files in directory with given extensions"""
    cleaned_count = 0
    
    for ext in extensions:
        pattern = f"{directory}/**/*.{ext}"
        for file_path in glob.glob(pattern, recursive=True):
            if remove_debug_statements(file_path):
                cleaned_count += 1
    
    return cleaned_count

def main():
    """Main cleanup function"""
    print("🚀 Starting ProWrite Production Cleanup...")
    
    # Remove test files
    print("\n📁 Removing test and debug files...")
    removed_files = remove_test_files()
    print(f"✅ Removed {removed_files} test/debug files")
    
    # Clean Python files
    print("\n🐍 Cleaning Python files...")
    python_cleaned = clean_directory('backend', ['py'])
    print(f"✅ Cleaned {python_cleaned} Python files")
    
    # Clean TypeScript/JavaScript files
    print("\n⚛️  Cleaning TypeScript/JavaScript files...")
    js_cleaned = clean_directory('frontend/src', ['ts', 'tsx', 'js', 'jsx'])
    print(f"✅ Cleaned {js_cleaned} TypeScript/JavaScript files")
    
    # Remove __pycache__ directories
    print("\n🧹 Removing Python cache directories...")
    import shutil
    cache_dirs = glob.glob('backend/**/__pycache__', recursive=True)
    for cache_dir in cache_dirs:
        shutil.rmtree(cache_dir)
        print(f"🗑️  Removed: {cache_dir}")
    
    print(f"\n🎉 Production cleanup completed!")
    print(f"   - Removed {removed_files} test/debug files")
    print(f"   - Cleaned {python_cleaned} Python files")
    print(f"   - Cleaned {js_cleaned} TypeScript/JavaScript files")
    print(f"   - Removed {len(cache_dirs)} cache directories")

if __name__ == "__main__":
    main()