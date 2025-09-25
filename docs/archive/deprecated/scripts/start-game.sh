#!/bin/bash
# Engineering Forge - Start Game Application
# HIGH-QUALITY ENTERPRISE SOLUTION

set -e  # Exit on any error

echo "🎮 Engineering Forge - Starting Game Application"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Navigate to project directory
PROJECT_DIR="/Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1"

if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Project directory not found: $PROJECT_DIR"
    exit 1
fi

log_info "Navigating to game directory..."
cd "$PROJECT_DIR"
log_success "Successfully navigated to game directory"

# Check Node.js version
log_info "Checking Node.js version..."
NODE_VERSION=$(node --version)
log_success "Node.js version: $NODE_VERSION"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies..."
    npm install
    log_success "Dependencies installed successfully"
else
    log_info "Dependencies already installed"
fi

# Start development server
log_info "Starting game development server..."
log_success "Game will be available at: http://localhost:5174"
echo ""

# Start the server
npm run dev
