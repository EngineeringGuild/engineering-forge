# 🎮 Engineering Forge - Educational Gamified Platform

## 📋 Project Overview
Engineering Forge is an educational gamified platform for engineering learning with blockchain integration. This repository serves as the central hub for documentation, specifications, and multiple product versions.

## 🏗️ Repository Structure

### **Clean Architecture**
```
Engineering Forge/
├── README.md                      # This file - Project overview
├── .gitignore                     # Git ignore rules
├── scripts/                       # Setup and utility scripts
├── docs/                          # 📚 Complete project documentation
│   ├── DOMAINS/                   # Domain-specific documentation
│   ├── VERSIONS/                  # Product version specifications
│   ├── DEVELOPMENT/               # Development process docs
│   ├── SPECIFICATIONS/            # Technical specifications
│   ├── BUSINESS/                  # Business documentation
│   └── TEMPLATES/                 # Document templates
├── engineering-forge-docs/        # 🌐 Documentation website (React)
└── engineering-forge-v1/          # 🎮 Game V1.0 Prototype (React + TypeScript)
```

### **Purpose of Each Component**
- **`docs/`** - Centralized documentation hub following DDD principles
- **`engineering-forge-docs/`** - Interactive documentation website
- **`engineering-forge-v1/`** - Working prototype of the educational game

### **Deployment URLs**
- **Documentation**: `https://engineeringforge.guildeng.com/docs`
- **Game v1.0**: `https://engineeringforge.guildeng.com/v1`

## 🚀 Quick Start

### **For Developers**

#### **Documentation Website**
```bash
cd engineering-forge-docs
npm install
npm run dev          # Development server
npm run build        # Production build
```

#### **Game v1.0**
```bash
cd engineering-forge-v1
npm install
npm run dev          # Development server
npm run build        # Production build
```

### **For Users**
- **Read Documentation**: Visit `/docs` for game guides and technical specs
- **Play Game**: Visit `/v1` to start playing Engineering Forge v1.0

## 🎯 Project Goals

### **Documentation**
- ✅ Comprehensive game design documents (GDD)
- ✅ Technical design documents (TDD)
- ✅ API specifications and architecture
- ✅ Development workflow guides
- ✅ Interactive documentation website

### **Game Development**
- ✅ Version 1.0: Core gameplay mechanics
- 🔄 Version 2.0: Advanced features (planned)
- 🔄 Version 3.0: Multiplayer support (planned)

## 🛠️ Technology Stack

### **Documentation Website**
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Content**: Markdown with React rendering
- **Deployment**: Cloudflare Pages

### **Game v1.0**
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State**: Zustand
- **Deployment**: Cloudflare Pages

## 📁 Detailed Structure

### **Documentation (`/docs`)**
```
docs/
├── GDD-v1.1.md                    # Game Design Document
├── TDD-v1.1.md                    # Technical Design Document
├── Project-Plan-v1.1.md           # Project planning
├── Progress-Summary.md             # Development progress
├── specifications/                 # Technical specifications
│   ├── system-architecture.md
│   ├── api-design.md
│   ├── database-design.md
│   └── ...
└── assets/                         # Diagrams and mockups
```

### **Documentation Website (`/engineering-forge-docs`)**
```
engineering-forge-docs/
├── src/                           # React application
├── dist/                          # Built static files
├── package.json                   # Dependencies
└── vite.config.ts                 # Build configuration
```

### **Game v1.0 (`/engineering-forge-v1`)**
```
engineering-forge-v1/
├── src/                           # Game source code
│   ├── pages/                     # Game pages
│   ├── components/                # Reusable components
│   ├── hooks/                     # Custom hooks
│   └── utils/                     # Utility functions
├── dist/                          # Built game files
├── package.json                   # Game dependencies
└── vite.config.ts                 # Game build config
```

## 🌐 Deployment Strategy

### **Cloudflare Pages (Recommended)**
- **CDN Global**: Fast loading worldwide
- **Automatic Deploy**: Push to GitHub = automatic deployment
- **SSL**: Automatic HTTPS
- **Custom Domains**: Professional URLs

### **Configuration**
```
Project 1: engineering-forge-docs
├── Repository: EngineeringGuild/engineering-forge
├── Root directory: engineering-forge-docs
├── Build command: npm install && npm run build
├── Output directory: dist
└── Custom domain: engineeringforge.guildeng.com/docs

Project 2: engineering-forge-v1
├── Repository: EngineeringGuild/engineering-forge
├── Root directory: engineering-forge-v1
├── Build command: npm install && npm run build
├── Output directory: dist
└── Custom domain: engineeringforge.guildeng.com/v1
```

## 🔄 Development Workflow

### **Local Development**
1. **Clone repository**: `git clone https://github.com/EngineeringGuild/engineering-forge.git`
2. **Install dependencies**: `npm install` in each project folder
3. **Start development**: `npm run dev` in each project folder
4. **Make changes**: Edit code in your preferred editor
5. **Test locally**: Verify changes work correctly

### **Deployment**
1. **Commit changes**: `git add . && git commit -m "Description"`
2. **Push to GitHub**: `git push origin main`
3. **Automatic deploy**: Cloudflare builds and deploys automatically
4. **Verify deployment**: Check live URLs

## 📊 Project Status

### **Completed ✅**
- [x] Project architecture design
- [x] Documentation structure
- [x] Game v1.0 basic structure
- [x] Deployment configuration
- [x] Development environment setup

### **In Progress 🔄**
- [ ] Game v1.0 core mechanics
- [ ] Documentation content completion
- [ ] Cloudflare Pages deployment
- [ ] DNS configuration

### **Planned 📋**
- [ ] Game v1.0 full implementation
- [ ] User authentication system
- [ ] Progress tracking
- [ ] Multiplayer features (v2.0)

## 🤝 Contributing

### **For Developers**
1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow coding standards
4. **Test thoroughly**: Ensure everything works
5. **Submit pull request**: Describe your changes

### **For Documentation**
1. **Edit markdown files** in `/docs`
2. **Update specifications** as needed
3. **Add diagrams** to `/docs/assets`
4. **Keep documentation current**

## 📞 Support

### **Issues**
- **Bug reports**: Use GitHub Issues
- **Feature requests**: Use GitHub Issues
- **Questions**: Use GitHub Discussions

### **Contact**
- **Project Lead**: Engineering Guild
- **Repository**: https://github.com/EngineeringGuild/engineering-forge
- **Documentation**: https://engineeringforge.guildeng.com/docs

## 📄 License
This project is part of the Engineering Guild ecosystem and follows the guild's development standards and practices.

---

**Last Updated**: September 2024  
**Version**: 1.0.0  
**Status**: Active Development  

**Don't forget to commit** 🚀
