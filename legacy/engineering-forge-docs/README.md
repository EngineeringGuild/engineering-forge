# Engineering Forge Documentation Web App

A modern, responsive web application for hosting the comprehensive documentation of the Engineering Forge project - a revolutionary 3D engineering and forging game with blockchain integration.

## 🚀 Features

- **Dual Document Support**: Seamlessly switch between GDD (Game Design Document) and TDD (Technical Design Document)
- **Responsive Design**: Mobile-first approach with collapsible sidebar navigation
- **Dark/Light Theme**: Toggle between themes with persistent user preferences
- **Advanced Search**: Real-time search across all documentation content
- **Markdown Rendering**: Full Markdown support with syntax highlighting
- **Table of Contents**: Auto-generated navigation based on document structure
- **Performance Optimized**: Built with React 18, TypeScript, and Tailwind CSS

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing

### Key Components
- **Header**: Document switching and search functionality
- **Sidebar**: Hierarchical navigation with collapsible sections
- **Content**: Markdown renderer with custom styling
- **Search**: Real-time search with filters and history

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout/          # Header, Sidebar, Navigation
│   ├── Content/         # Markdown renderer, TOC
│   └── UI/              # Reusable UI components
├── store/               # Zustand stores (navigation, search)
├── types/               # TypeScript interfaces
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── data/                # Static data and content
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EngineeringGuild/engineering-forge.git
   cd engineering-forge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎨 Customization

### Themes
The app supports custom theming through Tailwind CSS. Modify `tailwind.config.js` to customize:
- Color palette
- Typography
- Spacing
- Animations

### Content
- Add new sections in the sidebar data structure
- Customize Markdown rendering in `MarkdownRenderer.tsx`
- Modify search functionality in the search store

## 📱 Responsive Design

- **Mobile**: Collapsible sidebar with overlay
- **Tablet**: Adaptive layout with touch-friendly controls
- **Desktop**: Full sidebar with keyboard navigation

## 🔍 Search Features

- **Real-time Search**: Instant results as you type
- **Filters**: Filter by document type and section
- **History**: Remember recent searches
- **Relevance Scoring**: Intelligent result ranking

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Docker
```bash
docker build -t engineering-forge-docs .
docker run -p 3000:3000 engineering-forge-docs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Ensure responsive design works on all devices
- Add tests for new functionality
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS approach
- **Vite** - For the fast build tool
- **Engineering Guild** - For the vision and support

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/EngineeringGuild/engineering-forge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/EngineeringGuild/engineering-forge/discussions)
- **Wiki**: [Project Wiki](https://github.com/EngineeringGuild/engineering-forge/wiki)

---

**Built with ❤️ by the Engineering Guild Team**
