#!/bin/bash

# Update imports in API routes
find app/api -name "*.ts" -type f -exec sed -i '' 's|from '"'"'@/app/lib/error'"'"'|from '"'"'@/app/lib/errors/common'"'"'|g' {} \;

echo "Imports updated successfully!" 