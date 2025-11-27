#!/bin/bash
# AIMS Development Server Startup Script
# Workaround for macOS security restrictions in backup folders

echo "Starting AIMS Development Server..."
echo "================================"

# Method 1: Direct node execution
echo "Attempting direct node execution..."
node node_modules/vite/bin/vite.js

# If that fails, fallback to npx with full path
if [ $? -ne 0 ]; then
    echo "Fallback: Using npx..."
    /usr/local/bin/npx vite
fi