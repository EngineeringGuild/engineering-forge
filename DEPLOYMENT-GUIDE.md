# 🚀 Engineering Forge - Deployment Guide

## 📋 Overview
This guide provides step-by-step instructions for deploying the Engineering Forge project to Cloudflare Pages.

## 🎯 Deployment Architecture
```
engineeringforge.guildeng.com/
├── /docs          → Documentation (engineering-forge-docs)
└── /v1            → Game v1.0 (engineering-forge-v1)
```

## 🔧 Prerequisites
- ✅ GitHub repository: `EngineeringGuild/engineering-forge`
- ✅ Cloudflare account with domain `guildeng.com`
- ✅ Both projects built and tested locally

## 📦 Project Structure
```
Engineering Forge/
├── README.md                      # Main project documentation
├── docs/                          # General documentation
├── engineering-forge-docs/        # Documentation website
└── engineering-forge-v1/          # Game v1.0
```

## 🌐 Cloudflare Pages Setup

### **Step 1: Access Cloudflare Pages**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** in the sidebar
3. Click **"Create a project"**

### **Step 2: Connect GitHub Repository**
1. Click **"Connect to Git"**
2. Select **GitHub** as the source
3. Authorize Cloudflare to access your repositories
4. Select **`EngineeringGuild/engineering-forge`**

## 📚 Project 1: Documentation Website

### **Configuration**
```
Project name: engineering-forge-docs
Repository: EngineeringGuild/engineering-forge
Root directory: engineering-forge-docs
Build command: npm install && npm run build
Build output directory: dist
```

### **Build Settings**
- **Node.js version**: 18
- **Environment variables**: None required
- **Build command**: `npm install && npm run build`
- **Output directory**: `dist`

### **Custom Domain**
1. Go to **Custom domains** tab
2. Click **"Set up a custom domain"**
3. Enter: `engineeringforge.guildeng.com/docs`
4. Cloudflare will configure DNS automatically

## 🎮 Project 2: Game v1.0

### **Configuration**
```
Project name: engineering-forge-v1
Repository: EngineeringGuild/engineering-forge
Root directory: engineering-forge-v1
Build command: npm install && npm run build
Build output directory: dist
```

### **Build Settings**
- **Node.js version**: 18
- **Environment variables**: None required
- **Build command**: `npm install && npm run build`
- **Output directory**: `dist`

### **Custom Domain**
1. Go to **Custom domains** tab
2. Click **"Set up a custom domain"**
3. Enter: `engineeringforge.guildeng.com/v1`
4. Cloudflare will configure DNS automatically

## 🔄 Deployment Workflow

### **Automatic Deployment**
1. **Push to main branch**: `git push origin main`
2. **Cloudflare detects changes**: Automatically triggers build
3. **Build process**: Installs dependencies and builds both projects
4. **Deploy to CDN**: Files deployed to Cloudflare's global network
5. **Live sites**: Both URLs become available

### **Manual Deployment**
1. **Build locally**: `npm run build` in each project
2. **Upload files**: Use Cloudflare Pages upload feature
3. **Configure domains**: Set up custom domains manually

## 🧪 Testing Deployment

### **Local Testing**
```bash
# Test documentation
cd engineering-forge-docs
npm install
npm run build
npm run preview

# Test game
cd engineering-forge-v1
npm install
npm run build
npm run preview
```

### **Production Testing**
1. **Documentation**: Visit `https://engineeringforge.guildeng.com/docs`
2. **Game**: Visit `https://engineeringforge.guildeng.com/v1`
3. **Verify**: Check all features work correctly
4. **Performance**: Test loading speeds

## 🔍 Troubleshooting

### **Build Failures**
- **Check Node.js version**: Ensure version 18 is used
- **Verify dependencies**: Run `npm install` locally first
- **Check build logs**: Review Cloudflare build output
- **Test locally**: Ensure `npm run build` works

### **Domain Issues**
- **DNS propagation**: Wait up to 24 hours for DNS changes
- **SSL certificates**: Cloudflare provides automatic SSL
- **Caching**: Clear Cloudflare cache if needed

### **Performance Issues**
- **CDN**: Cloudflare provides global CDN automatically
- **Compression**: Enable Brotli compression in Cloudflare
- **Caching**: Configure appropriate cache headers

## 📊 Monitoring

### **Analytics**
- **Cloudflare Analytics**: Built-in traffic insights
- **Performance**: Core Web Vitals monitoring
- **Errors**: Automatic error tracking

### **Logs**
- **Build logs**: Available in Cloudflare Pages dashboard
- **Runtime logs**: Access via Cloudflare dashboard
- **Error tracking**: Automatic error reporting

## 🔒 Security

### **SSL/TLS**
- **Automatic HTTPS**: Cloudflare provides SSL certificates
- **HSTS**: HTTP Strict Transport Security enabled
- **TLS 1.3**: Latest encryption protocol

### **DDoS Protection**
- **Automatic protection**: Cloudflare's DDoS mitigation
- **Rate limiting**: Configurable rate limits
- **Bot management**: Advanced bot protection

## 🚀 Optimization

### **Performance**
- **CDN**: Global content delivery network
- **Compression**: Automatic file compression
- **Caching**: Intelligent caching strategies
- **Image optimization**: Automatic image optimization

### **SEO**
- **Meta tags**: Proper meta tags in HTML
- **Sitemap**: Generate and submit sitemap
- **Structured data**: Add JSON-LD structured data

## 📈 Scaling

### **Traffic Handling**
- **Unlimited bandwidth**: Cloudflare Pages free tier
- **Global distribution**: 200+ data centers worldwide
- **Auto-scaling**: Automatic scaling based on demand

### **Future Enhancements**
- **Edge functions**: Serverless functions at the edge
- **KV storage**: Key-value storage for dynamic content
- **D1 database**: Serverless SQL database

## 🎯 Success Metrics

### **Performance Targets**
- **Load time**: < 2 seconds
- **Core Web Vitals**: All metrics in green
- **Uptime**: 99.9% availability
- **Global performance**: Fast loading worldwide

### **User Experience**
- **Mobile responsive**: Works on all devices
- **Accessibility**: WCAG 2.1 AA compliance
- **Cross-browser**: Works in all modern browsers

---

**Last Updated**: September 2024  
**Status**: Ready for deployment  
**Next Steps**: Configure Cloudflare Pages projects  

**Don't forget to commit** 🚀
