#!/bin/bash

# FitForge AI Production Deployment Script
# This script prepares and validates the production build

echo "🚀 FitForge AI Production Deployment Script"
echo "============================================="

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

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_warning "NEXT_PUBLIC_SUPABASE_URL is not set"
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        print_warning "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
    fi
    
    if [ -z "$OPENAI_API_KEY" ]; then
        print_warning "OPENAI_API_KEY is not set"
    fi
    
    print_success "Environment check completed"
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm ci --production=false
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Run type checking
type_check() {
    print_status "Running TypeScript type checking..."
    npm run type-check
    if [ $? -eq 0 ]; then
        print_success "Type checking passed"
    else
        print_error "Type checking failed"
        exit 1
    fi
}

# Run linting
lint_check() {
    print_status "Running ESLint..."
    npm run lint
    if [ $? -eq 0 ]; then
        print_success "Linting passed"
    else
        print_warning "Linting issues found - check output above"
    fi
}

# Run tests
run_tests() {
    print_status "Running unit tests..."
    npm run test
    if [ $? -eq 0 ]; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        exit 1
    fi
}

# Build application
build_app() {
    print_status "Building application for production..."
    npm run build
    if [ $? -eq 0 ]; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Check build output
check_build() {
    print_status "Checking build output..."
    
    if [ -d ".next" ]; then
        print_success "Build directory exists"
    else
        print_error "Build directory not found"
        exit 1
    fi
    
    # Check critical files
    if [ -f ".next/static/chunks/pages/_app.js" ] || [ -f ".next/server/app/page.js" ]; then
        print_success "Core application files found"
    else
        print_warning "Some application files may be missing"
    fi
}

# Run production checks
production_checks() {
    print_status "Running production readiness checks..."
    
    # Check for PWA files
    if [ -f "public/manifest.json" ] && [ -f "public/sw.js" ]; then
        print_success "PWA files are present"
    else
        print_warning "PWA files missing"
    fi
    
    # Check for CI/CD configuration
    if [ -f ".github/workflows/ci.yml" ]; then
        print_success "CI/CD configuration found"
    else
        print_warning "CI/CD configuration missing"
    fi
    
    # Check for environment template
    if [ -f ".env.example" ]; then
        print_success "Environment template found"
    else
        print_warning "Environment template missing"
    fi
    
    print_success "Production checks completed"
}

# Main execution
main() {
    echo "Starting production deployment preparation..."
    echo
    
    check_env_vars
    echo
    
    install_deps
    echo
    
    type_check
    echo
    
    lint_check
    echo
    
    run_tests
    echo
    
    build_app
    echo
    
    check_build
    echo
    
    production_checks
    echo
    
    print_success "🎉 Production deployment preparation completed successfully!"
    echo
    print_status "Next steps:"
    echo "  1. Set up your production environment variables"
    echo "  2. Deploy to your hosting platform (Vercel, Netlify, etc.)"
    echo "  3. Configure your custom domain"
    echo "  4. Set up monitoring and analytics"
    echo
    print_status "Your FitForge AI application is production-ready! 💪"
}

# Run the script
main