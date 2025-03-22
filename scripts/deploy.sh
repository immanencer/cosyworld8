#!/bin/bash
# Deployment script for Moonstone Sanctum
# This script deploys the application to a production server

# Exit on error
set -e

# Configuration
DEPLOY_USER="deploy"
DEPLOY_HOST="moonstone-sanctum.com"
DEPLOY_PATH="/var/www/moonstone-sanctum"
DEPLOY_BRANCH="main"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deploying Moonstone Sanctum to production${NC}"
echo -e "${YELLOW}Target: ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}${NC}"

# Step 1: Build the application locally
echo -e "\n${GREEN}Step 1: Building the application${NC}"
npm run build

# Step 2: Create dist archive
echo -e "\n${GREEN}Step 2: Creating deployment archive${NC}"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
ARCHIVE_NAME="dist-${TIMESTAMP}.tar.gz"
tar -czf $ARCHIVE_NAME dist

# Step 3: Upload to server
echo -e "\n${GREEN}Step 3: Uploading to server${NC}"
scp $ARCHIVE_NAME ${DEPLOY_USER}@${DEPLOY_HOST}:/tmp/

# Step 4: Deploy on server
echo -e "\n${GREEN}Step 4: Deploying on server${NC}"
ssh ${DEPLOY_USER}@${DEPLOY_HOST} << EOF
  # Create backup of current deployment
  if [ -d ${DEPLOY_PATH}/dist ]; then
    BACKUP_NAME="backup-\$(date +%Y%m%d%H%M%S)"
    echo "Creating backup: \${BACKUP_NAME}"
    cp -r ${DEPLOY_PATH}/dist ${DEPLOY_PATH}/\${BACKUP_NAME}
  fi
  
  # Extract new files
  echo "Extracting new files"
  mkdir -p ${DEPLOY_PATH}
  tar -xzf /tmp/${ARCHIVE_NAME} -C ${DEPLOY_PATH}
  
  # Set permissions
  echo "Setting permissions"
  chmod -R 755 ${DEPLOY_PATH}/dist
  
  # Clean up
  echo "Cleaning up"
  rm /tmp/${ARCHIVE_NAME}
  
  # Reload web server
  echo "Reloading Nginx"
  sudo systemctl reload nginx
  
  # Restart application server
  echo "Restarting application server"
  sudo systemctl restart moonstone-sanctum
EOF

# Step 5: Clean up locally
echo -e "\n${GREEN}Step 5: Cleaning up${NC}"
rm $ARCHIVE_NAME

echo -e "\n${GREEN}Deployment completed successfully!${NC}"
echo -e "Application is now available at https://${DEPLOY_HOST}"