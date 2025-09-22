# 🚨 IMMEDIATE FIX INSTRUCTIONS
## Engineering Forge - Terminal Issue Resolution

**STATUS**: 🔴 **CRITICAL** - Terminal session is broken  
**IMPACT**: Cannot execute commands or navigate directories  
**ESTIMATED FIX TIME**: ⏰ **5 minutes**

---

## 🎯 PROBLEM SUMMARY

### **Primary Issue**: Terminal Path Resolution Failure
- Shell cannot navigate to project directory
- Path escaping issues with spaces in directory names
- Commands get stuck in infinite loops
- Node.js version reverted to system default (v20.17.0)

### **Secondary Issues**:
- NVM not properly integrated with shell
- Multiple Node.js installations causing conflicts
- Environment variables not persistent across sessions

---

## 🔧 IMMEDIATE MANUAL FIX (COPY & PASTE THESE COMMANDS)

### **Step 1: Open a NEW Terminal Window**
⚠️ **IMPORTANT**: Close current terminal and open a completely new one

### **Step 2: Fix Node.js Version (Copy & Paste Each Line)**

```bash
# 1. Source NVM if it exists
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Check current Node version
node --version

# 3. If NVM is available, switch to v22.19.0
nvm use v22.19.0 2>/dev/null || echo "Need to install Node.js v22.19.0"

# 4. If Node.js v22.19.0 not installed, install it
nvm install v22.19.0
nvm use v22.19.0
nvm alias default v22.19.0

# 5. Verify correct version
node --version
```

### **Step 3: Navigate to Project (Use Proper Escaping)**

```bash
# Method 1: Use single quotes (RECOMMENDED)
cd '/Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge'

# Method 2: If Method 1 fails, try with escaped spaces
cd /Users/user/Desktop/Core\ Guild\ Project/projects/Games/Engineering\ Forge

# Method 3: If both fail, navigate step by step
cd /Users/user/Desktop
cd "Core Guild Project"
cd projects/Games
cd "Engineering Forge"

# Verify you're in the right place
pwd
ls -la
```

### **Step 4: Start the Documentation Project**

```bash
# Navigate to docs project
cd engineering-forge-docs

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

**Expected Output**:
```
> engineering-forge-docs@0.0.0 dev
> npm run sync:docs && vite

  VITE v7.1.5  ready in 877 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🔍 ALTERNATIVE FIX METHODS

### **Method A: Use Finder Navigation**
1. Open **Finder**
2. Navigate to: `/Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge`
3. Right-click on `engineering-forge-docs` folder
4. Select **"Open in Terminal"**
5. Run: `npm run dev`

### **Method B: Use VS Code Terminal**
1. Open **VS Code**
2. File → Open Folder
3. Navigate to: `/Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-docs`
4. Open integrated terminal (Ctrl+`)
5. Run: `npm run dev`

### **Method C: Fix Shell Profile**
```bash
# Add NVM to your shell profile permanently
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
echo 'nvm use default' >> ~/.zshrc

# Reload shell configuration
source ~/.zshrc
```

---

## 🚀 VERIFICATION STEPS

### **1. Check Node.js Version**
```bash
node --version
# Expected: v22.19.0
```

### **2. Check Project Structure**
```bash
ls -la
# Expected: Should see engineering-forge-docs/ and engineering-forge-v1/
```

### **3. Test Development Server**
```bash
cd engineering-forge-docs
npm run dev
# Expected: Server starts on http://localhost:5173
```

### **4. Test in Browser**
- Open: http://localhost:5173
- Expected: Engineering Forge documentation loads without errors

---

## 📋 TROUBLESHOOTING

### **If Node.js version is still wrong:**
```bash
# Force install latest NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.nvm/nvm.sh
nvm install --lts
nvm use --lts
nvm alias default node
```

### **If directory navigation still fails:**
```bash
# Check if directory exists
ls -la "/Users/user/Desktop/"
ls -la "/Users/user/Desktop/Core Guild Project/"
ls -la "/Users/user/Desktop/Core Guild Project/projects/"
ls -la "/Users/user/Desktop/Core Guild Project/projects/Games/"
```

### **If npm install fails:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ SUCCESS INDICATORS

When everything is working correctly, you should see:

1. **Node.js Version**: `v22.19.0` (or higher)
2. **Development Server**: Running on `http://localhost:5173`
3. **No Errors**: Clean console output without warnings
4. **Website Loads**: Documentation site displays properly
5. **Hot Reload**: Changes reflect immediately in browser

---

## 🔄 NEXT STEPS AFTER FIX

Once the project is running:

1. **Test Both Projects**:
   - Documentation: `cd engineering-forge-docs && npm run dev`
   - Game: `cd engineering-forge-v1 && npm run dev`

2. **Create Permanent Aliases** (Optional):
   ```bash
   echo 'alias start-docs="cd /Users/user/Desktop/Core\ Guild\ Project/projects/Games/Engineering\ Forge/engineering-forge-docs && npm run dev"' >> ~/.zshrc
   echo 'alias start-game="cd /Users/user/Desktop/Core\ Guild\ Project/projects/Games/Engineering\ Forge/engineering-forge-v1 && npm run dev"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Verify All Systems**:
   - TypeScript compilation
   - ESLint checks
   - Build processes
   - Documentation sync

---

## 📞 IF ALL ELSE FAILS

**Last Resort Options**:

1. **Use Docker** (if available):
   ```bash
   docker run -it -v "$(pwd)":/app -w /app -p 5173:5173 node:22-alpine sh
   cd engineering-forge-docs
   npm install
   npm run dev
   ```

2. **Use GitHub Codespaces**: Open the project in a cloud environment

3. **Fresh Terminal**: Completely restart Terminal app and try again

---

**⚠️ CRITICAL**: The project code is perfectly fine. This is purely an environment/terminal configuration issue. Once Node.js v22.19.0 is active and you can navigate to the project directory, everything will work perfectly.
