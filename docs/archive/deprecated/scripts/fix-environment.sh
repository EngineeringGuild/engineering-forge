#!/bin/bash
# Engineering Forge - Emergency Environment Fix Script
# HIGH-QUALITY ENTERPRISE SOLUTION

set -e  # Exit on any error

echo "🚀 Engineering Forge - Emergency Environment Fix"
echo "=================================================="

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

# Step 1: Check current Node.js status
log_info "Step 1: Checking current Node.js status..."
if command -v node &> /dev/null; then
    CURRENT_NODE=$(node --version)
    log_info "Current Node.js version: $CURRENT_NODE"
else
    log_warning "Node.js not found in PATH"
fi

# Step 2: Check NVM installation
log_info "Step 2: Checking NVM installation..."
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    log_success "NVM is installed"
    source "$HOME/.nvm/nvm.sh"
    
    # Check if Node.js 22.19.0 is installed
    if nvm list | grep -q "v22.19.0"; then
        log_success "Node.js v22.19.0 is available via NVM"
        log_info "Switching to Node.js v22.19.0..."
        nvm use v22.19.0
        nvm alias default v22.19.0
        log_success "Switched to Node.js $(node --version)"
    else
        log_warning "Node.js v22.19.0 not installed via NVM"
        log_info "Installing Node.js v22.19.0..."
        nvm install v22.19.0
        nvm use v22.19.0
        nvm alias default v22.19.0
        log_success "Installed and switched to Node.js $(node --version)"
    fi
else
    log_error "NVM not found. Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    
    # Add NVM to current session
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # Add NVM to shell profile
    if [ -f "$HOME/.zshrc" ]; then
        if ! grep -q "NVM_DIR" "$HOME/.zshrc"; then
            echo 'export NVM_DIR="$HOME/.nvm"' >> "$HOME/.zshrc"
            echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> "$HOME/.zshrc"
            echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use' >> "$HOME/.zshrc"
            log_success "Added NVM to .zshrc"
        fi
    fi
    
    # Install Node.js
    nvm install v22.19.0
    nvm use v22.19.0
    nvm alias default v22.19.0
    log_success "Installed Node.js $(node --version)"
fi

# Step 3: Verify installation
log_info "Step 3: Verifying installation..."
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

if [[ $NODE_VERSION == v22.19.0 ]]; then
    log_success "Node.js version correct: $NODE_VERSION"
else
    log_error "Node.js version incorrect: $NODE_VERSION (expected v22.19.0)"
    exit 1
fi

log_success "NPM version: $NPM_VERSION"

# Step 4: Navigate to project and test
log_info "Step 4: Testing project navigation..."
PROJECT_DIR="/Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge"

if [ -d "$PROJECT_DIR" ]; then
    log_success "Project directory exists"
    cd "$PROJECT_DIR"
    log_success "Successfully navigated to project directory"
    
    # Test both subprojects
    log_info "Testing engineering-forge-docs..."
    if [ -d "engineering-forge-docs" ]; then
        cd "engineering-forge-docs"
        if [ -f "package.json" ]; then
            log_info "Installing dependencies..."
            npm install --silent
            log_success "Dependencies installed for engineering-forge-docs"
        fi
        cd ..
    fi
    
    log_info "Testing engineering-forge-v1..."
    if [ -d "engineering-forge-v1" ]; then
        cd "engineering-forge-v1"
        if [ -f "package.json" ]; then
            log_info "Installing dependencies..."
            npm install --silent
            log_success "Dependencies installed for engineering-forge-v1"
        fi
        cd ..
    fi
    
else
    log_error "Project directory not found: $PROJECT_DIR"
    exit 1
fi

# Step 5: Create convenience scripts
log_info "Step 5: Creating convenience scripts..."

# Create start script for docs
cat > start-docs.sh << 'EOF'
#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use v22.19.0
cd "engineering-forge-docs"
npm run dev
EOF

# Create start script for game
cat > start-game.sh << 'EOF'
#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use v22.19.0
cd "engineering-forge-v1"
npm run dev
EOF

chmod +x start-docs.sh start-game.sh
log_success "Created convenience scripts: start-docs.sh and start-game.sh"

# Final verification
log_info "Final verification..."
echo "=================================================="
echo "✅ ENVIRONMENT FIX COMPLETE!"
echo "=================================================="
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Project directory: $PROJECT_DIR"
echo ""
echo "🚀 Ready to start development!"
echo ""
echo "To start the documentation site:"
echo "  ./start-docs.sh"
echo ""
echo "To start the game application:"
echo "  ./start-game.sh"
echo ""
echo "Or manually:"
echo "  cd 'engineering-forge-docs' && npm run dev"
echo "  cd 'engineering-forge-v1' && npm run dev"
echo ""
log_success "Environment fix completed successfully!"
