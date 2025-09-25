#!/bin/bash

# Engineering Forge - Setup Script
# This script sets up the entire Engineering Forge project

set -e

echo "🚀 Engineering Forge - Setup Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is >= 18
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Install root dependencies
install_root_deps() {
    print_status "Installing root dependencies..."
    npm install
    print_success "Root dependencies installed"
}

# Install docs dependencies
install_docs_deps() {
    print_status "Installing documentation dependencies..."
    cd engineering-forge-docs
    npm install
    cd ..
    print_success "Documentation dependencies installed"
}

# Install game dependencies
install_game_deps() {
    print_status "Installing game dependencies..."
    cd engineering-forge-v1
    npm install
    cd ..
    print_success "Game dependencies installed"
}

# Setup git hooks
setup_git_hooks() {
    print_status "Setting up git hooks..."
    
    # Create .git/hooks directory if it doesn't exist
    mkdir -p .git/hooks
    
    # Create pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test

echo "Pre-commit checks passed!"
EOF
    
    # Make pre-commit hook executable
    chmod +x .git/hooks/pre-commit
    
    print_success "Git hooks set up"
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Create .env.example
    cat > .env.example << 'EOF'
# Engineering Forge - Environment Variables

# Development
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/engineering-forge
MONGODB_DB_NAME=engineering-forge

# Authentication
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d

# Blockchain
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your-private-key-here

# External Services
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Analytics
GOOGLE_ANALYTICS_ID=your-ga-id
MIXPANEL_TOKEN=your-mixpanel-token

# Email
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@engineering-forge.com

# Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=engineering-forge-assets
EOF
    
    # Create .env.local if it doesn't exist
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
        print_warning "Created .env.local from .env.example. Please update with your actual values."
    fi
    
    print_success "Environment files created"
}

# Setup VS Code settings
setup_vscode() {
    print_status "Setting up VS Code settings..."
    
    mkdir -p .vscode
    
    # Create settings.json
    cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.cursorrules": "plaintext"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/coverage": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/coverage": true
  }
}
EOF
    
    # Create extensions.json
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-markdown"
  ]
}
EOF
    
    print_success "VS Code settings configured"
}

# Main setup function
main() {
    echo "Starting Engineering Forge setup..."
    echo ""
    
    # Check prerequisites
    check_node
    check_npm
    
    # Install dependencies
    install_root_deps
    install_docs_deps
    install_game_deps
    
    # Setup project
    setup_git_hooks
    create_env_files
    setup_vscode
    
    echo ""
    print_success "🎉 Engineering Forge setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env.local with your actual values"
    echo "2. Run 'npm run dev' to start development"
    echo "3. Run 'npm run docs:dev' to start documentation"
    echo "4. Run 'npm run game:dev' to start the game"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"
