// File: src/i18n/index.ts
// Engineering Forge Documentation App - i18n Configuration

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Supported languages configuration
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    priority: 1 // Higher priority = more likely to be preloaded
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    rtl: false,
    priority: 2
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    priority: 3
  },
  uk: {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    flag: '🇺🇦',
    rtl: false,
    priority: 4
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    priority: 5
  }
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// NUCLEAR FIX: Ultra-simplified i18n initialization to prevent loops
i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    defaultNS: 'common',
    ns: ['common', 'navigation'],
    supportedLngs: ['en', 'pt', 'fr', 'uk', 'zh'],
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    // Professional configuration with all languages
    resources: {
      en: {
        navigation: {
          // GDD Sections
          'sections.gdd-overview': 'Game Overview & Concept',
          'sections.gdd-core-mechanics': 'Core Mechanics',
          'sections.gdd-game-systems': 'Game Systems',
          'sections.gdd-content-assets': 'Content & Assets',
          'sections.gdd-business-model': 'Business Model',
          'sections.gdd-project-plan': 'Project Plan',

          // TDD Sections
          'sections.tdd-api-design': 'API Design',
          'sections.tdd-frontend-architecture': 'Frontend Architecture',
          'sections.tdd-backend-architecture': 'Backend Architecture',
          'sections.tdd-backend-architecture-part2': 'Backend Architecture Part 2',
          'sections.tdd-blockchain-integration': 'Blockchain Integration',
          'sections.tdd-security-architecture': 'Security Architecture',
          'sections.tdd-performance-scalability': 'Performance & Scalability',
          'sections.tdd-devops-deployment': 'DevOps & Deployment',
          'sections.tdd-testing-strategy': 'Testing Strategy',
          'sections.tdd-monitoring-analytics': 'Monitoring & Analytics',
          'sections.tdd-development-workflow': 'Development Workflow',
          'sections.tdd-database-design': 'Database Design',
          'sections.tdd-technology-stack': 'Technology Stack',
          'sections.tdd-system-architecture': 'System Architecture',
          'sections.tdd-appendices': 'Appendices'
        },
        common: {
          'app.title': 'Engineering Forge',
          'app.subtitle': 'Documentation',
          'app.description': 'Comprehensive documentation for the Engineering Forge project',
          'navigation.home': 'Home',
          'navigation.gdd': 'Game Design Document',
          'navigation.tdd': 'Technical Design Document',
          'navigation.search': 'Search documentation...',
          'navigation.menu': 'Menu',
          'navigation.close': 'Close',
          'actions.search': 'Search',
          'actions.toggleTheme': 'Toggle theme',
          'actions.changeLanguage': 'Change language',
          'actions.reload': 'Reload',
          'actions.loading': 'Loading...',
          'actions.error': 'Error',
          'actions.retry': 'Retry',
          'content.loading': 'Loading content...',
          'content.error': 'Error Loading Content',
          'content.reload': 'Reload Page',
          'content.notFound': 'Content not found',
          'content.lastUpdated': 'Last updated',
          'content.readingTime': 'Reading time',
          'content.wordCount': 'Word count',
          'language.select': 'Select Language',
          'language.current': 'Current Language',
          'language.change': 'Change Language',
          'theme.light': 'Light',
          'theme.dark': 'Dark',
          'theme.toggle': 'Toggle Theme',
          'search.placeholder': 'Search documentation...',
          'search.noResults': 'No results found',
          'search.results': 'results found',
          'search.clear': 'Clear search',
          'search.history': 'Search History',
          'errors.generic': 'Something went wrong',
          'errors.network': 'Network error',
          'errors.notFound': 'Page not found',
          'errors.unauthorized': 'Unauthorized access',
          'errors.serverError': 'Server error'
        }
      },
      pt: {
        navigation: {
          // GDD Sections
          'sections.gdd-overview': 'Visão Geral & Conceito do Jogo',
          'sections.gdd-core-mechanics': 'Mecânicas Principais',
          'sections.gdd-game-systems': 'Sistemas do Jogo',
          'sections.gdd-content-assets': 'Conteúdo & Assets',
          'sections.gdd-business-model': 'Modelo de Negócio',
          'sections.gdd-project-plan': 'Plano do Projeto',

          // TDD Sections
          'sections.tdd-api-design': 'Design da API',
          'sections.tdd-frontend-architecture': 'Arquitetura Frontend',
          'sections.tdd-backend-architecture': 'Arquitetura Backend',
          'sections.tdd-backend-architecture-part2': 'Arquitetura Backend Parte 2',
          'sections.tdd-blockchain-integration': 'Integração Blockchain',
          'sections.tdd-security-architecture': 'Arquitetura de Segurança',
          'sections.tdd-performance-scalability': 'Performance & Escalabilidade',
          'sections.tdd-devops-deployment': 'DevOps & Deploy',
          'sections.tdd-testing-strategy': 'Estratégia de Testes',
          'sections.tdd-monitoring-analytics': 'Monitoramento & Analytics',
          'sections.tdd-development-workflow': 'Fluxo de Desenvolvimento',
          'sections.tdd-database-design': 'Design do Banco de Dados',
          'sections.tdd-technology-stack': 'Stack Tecnológico',
          'sections.tdd-system-architecture': 'Arquitetura do Sistema',
          'sections.tdd-appendices': 'Apêndices'
        },
        common: {
          'app.title': 'Engineering Forge',
          'app.subtitle': 'Documentação',
          'app.description': 'Documentação abrangente para o projeto Engineering Forge',
          'navigation.home': 'Início',
          'navigation.gdd': 'Documento de Design do Jogo',
          'navigation.tdd': 'Documento de Design Técnico',
          'navigation.search': 'Pesquisar documentação...',
          'navigation.menu': 'Menu',
          'navigation.close': 'Fechar',
          'actions.search': 'Pesquisar',
          'actions.toggleTheme': 'Alternar tema',
          'actions.changeLanguage': 'Alterar idioma',
          'actions.reload': 'Recarregar',
          'actions.loading': 'Carregando...',
          'actions.error': 'Erro',
          'actions.retry': 'Tentar novamente',
          'content.loading': 'Carregando conteúdo...',
          'content.error': 'Erro ao Carregar Conteúdo',
          'content.reload': 'Recarregar Página',
          'content.notFound': 'Conteúdo não encontrado',
          'content.lastUpdated': 'Última atualização',
          'content.readingTime': 'Tempo de leitura',
          'content.wordCount': 'Contagem de palavras',
          'language.select': 'Selecionar Idioma',
          'language.current': 'Idioma Atual',
          'language.change': 'Alterar Idioma',
          'theme.light': 'Claro',
          'theme.dark': 'Escuro',
          'theme.toggle': 'Alternar Tema',
          'search.placeholder': 'Pesquisar documentação...',
          'search.noResults': 'Nenhum resultado encontrado',
          'search.results': 'resultados encontrados',
          'search.clear': 'Limpar pesquisa',
          'search.history': 'Histórico de Pesquisa',
          'errors.generic': 'Algo deu errado',
          'errors.network': 'Erro de rede',
          'errors.notFound': 'Página não encontrada',
          'errors.unauthorized': 'Acesso não autorizado',
          'errors.serverError': 'Erro do servidor'
        }
      },
      fr: {
        navigation: {
          // GDD Sections
          'sections.gdd-overview': 'Aperçu & Concept du Jeu',
          'sections.gdd-core-mechanics': 'Mécaniques Principales',
          'sections.gdd-game-systems': 'Systèmes de Jeu',
          'sections.gdd-content-assets': 'Contenu & Assets',
          'sections.gdd-business-model': 'Modèle Commercial',
          'sections.gdd-project-plan': 'Plan de Projet',

          // TDD Sections
          'sections.tdd-api-design': 'Conception API',
          'sections.tdd-frontend-architecture': 'Architecture Frontend',
          'sections.tdd-backend-architecture': 'Architecture Backend',
          'sections.tdd-backend-architecture-part2': 'Architecture Backend Partie 2',
          'sections.tdd-blockchain-integration': 'Intégration Blockchain',
          'sections.tdd-security-architecture': 'Architecture de Sécurité',
          'sections.tdd-performance-scalability': 'Performance & Évolutivité',
          'sections.tdd-devops-deployment': 'DevOps & Déploiement',
          'sections.tdd-testing-strategy': 'Stratégie de Test',
          'sections.tdd-monitoring-analytics': 'Surveillance & Analytics',
          'sections.tdd-development-workflow': 'Flux de Développement',
          'sections.tdd-database-design': 'Conception Base de Données',
          'sections.tdd-technology-stack': 'Stack Technologique',
          'sections.tdd-system-architecture': 'Architecture Système',
          'sections.tdd-appendices': 'Annexes'
        },
        common: {
          'app.title': 'Engineering Forge',
          'app.subtitle': 'Documentation',
          'app.description': 'Documentation complète pour le projet Engineering Forge',
          'navigation.home': 'Accueil',
          'navigation.gdd': 'Document de Conception de Jeu',
          'navigation.tdd': 'Document de Conception Technique',
          'navigation.search': 'Rechercher dans la documentation...',
          'navigation.menu': 'Menu',
          'navigation.close': 'Fermer',
          'actions.search': 'Rechercher',
          'actions.toggleTheme': 'Basculer le thème',
          'actions.changeLanguage': 'Changer de langue',
          'actions.reload': 'Recharger',
          'actions.loading': 'Chargement...',
          'actions.error': 'Erreur',
          'actions.retry': 'Réessayer',
          'content.loading': 'Chargement du contenu...',
          'content.error': 'Erreur de Chargement du Contenu',
          'content.reload': 'Recharger la Page',
          'content.notFound': 'Contenu non trouvé',
          'content.lastUpdated': 'Dernière mise à jour',
          'content.readingTime': 'Temps de lecture',
          'content.wordCount': 'Nombre de mots',
          'language.select': 'Sélectionner la Langue',
          'language.current': 'Langue Actuelle',
          'language.change': 'Changer de Langue',
          'theme.light': 'Clair',
          'theme.dark': 'Sombre',
          'theme.toggle': 'Basculer le Thème',
          'search.placeholder': 'Rechercher dans la documentation...',
          'search.noResults': 'Aucun résultat trouvé',
          'search.results': 'résultats trouvés',
          'search.clear': 'Effacer la recherche',
          'search.history': 'Historique de Recherche',
          'errors.generic': 'Quelque chose s\'est mal passé',
          'errors.network': 'Erreur réseau',
          'errors.notFound': 'Page non trouvée',
          'errors.unauthorized': 'Accès non autorisé',
          'errors.serverError': 'Erreur serveur'
        }
      },
      uk: {
        navigation: {
          // GDD Sections - Using English as base for Ukrainian
          'sections.gdd-overview': 'Огляд Гри & Концепція',
          'sections.gdd-core-mechanics': 'Основні Механіки',
          'sections.gdd-game-systems': 'Системи Гри',
          'sections.gdd-content-assets': 'Контент & Ресурси',
          'sections.gdd-business-model': 'Бізнес Модель',
          'sections.gdd-project-plan': 'План Проекту',

          // TDD Sections
          'sections.tdd-api-design': 'Дизайн API',
          'sections.tdd-frontend-architecture': 'Архітектура Frontend',
          'sections.tdd-backend-architecture': 'Архітектура Backend',
          'sections.tdd-backend-architecture-part2': 'Архітектура Backend Частина 2',
          'sections.tdd-blockchain-integration': 'Інтеграція Blockchain',
          'sections.tdd-security-architecture': 'Архітектура Безпеки',
          'sections.tdd-performance-scalability': 'Продуктивність & Масштабованість',
          'sections.tdd-devops-deployment': 'DevOps & Розгортання',
          'sections.tdd-testing-strategy': 'Стратегія Тестування',
          'sections.tdd-monitoring-analytics': 'Моніторинг & Аналітика',
          'sections.tdd-development-workflow': 'Робочий Процес Розробки',
          'sections.tdd-database-design': 'Дизайн Бази Даних',
          'sections.tdd-technology-stack': 'Технологічний Стек',
          'sections.tdd-system-architecture': 'Системна Архітектура',
          'sections.tdd-appendices': 'Додатки'
        },
        common: {
          'app.title': 'Engineering Forge',
          'app.subtitle': 'Документація',
          'app.description': 'Повна документація для проекту Engineering Forge',
          'navigation.home': 'Головна',
          'navigation.gdd': 'Документ Дизайну Гри',
          'navigation.tdd': 'Технічний Документ Дизайну',
          'navigation.search': 'Пошук в документації...',
          'navigation.menu': 'Меню',
          'navigation.close': 'Закрити',
          'actions.search': 'Пошук',
          'actions.toggleTheme': 'Перемкнути тему',
          'actions.changeLanguage': 'Змінити мову',
          'actions.reload': 'Перезавантажити',
          'actions.loading': 'Завантаження...',
          'actions.error': 'Помилка',
          'actions.retry': 'Спробувати знову',
          'content.loading': 'Завантаження контенту...',
          'content.error': 'Помилка Завантаження Контенту',
          'content.reload': 'Перезавантажити Сторінку',
          'content.notFound': 'Контент не знайдено',
          'content.lastUpdated': 'Останнє оновлення',
          'content.readingTime': 'Час читання',
          'content.wordCount': 'Кількість слів',
          'language.select': 'Вибрати Мову',
          'language.current': 'Поточна Мова',
          'language.change': 'Змінити Мову',
          'theme.light': 'Світла',
          'theme.dark': 'Темна',
          'theme.toggle': 'Перемкнути Тему',
          'search.placeholder': 'Пошук в документації...',
          'search.noResults': 'Результатів не знайдено',
          'search.results': 'знайдено результатів',
          'search.clear': 'Очистити пошук',
          'search.history': 'Історія Пошуку',
          'errors.generic': 'Щось пішло не так',
          'errors.network': 'Помилка мережі',
          'errors.notFound': 'Сторінку не знайдено',
          'errors.unauthorized': 'Неавторизований доступ',
          'errors.serverError': 'Помилка сервера'
        }
      },
      zh: {
        navigation: {
          // GDD Sections
          'sections.gdd-overview': '游戏概览与概念',
          'sections.gdd-core-mechanics': '核心机制',
          'sections.gdd-game-systems': '游戏系统',
          'sections.gdd-content-assets': '内容与资产',
          'sections.gdd-business-model': '商业模式',
          'sections.gdd-project-plan': '项目计划',

          // TDD Sections
          'sections.tdd-api-design': 'API设计',
          'sections.tdd-frontend-architecture': '前端架构',
          'sections.tdd-backend-architecture': '后端架构',
          'sections.tdd-backend-architecture-part2': '后端架构第2部分',
          'sections.tdd-blockchain-integration': '区块链集成',
          'sections.tdd-security-architecture': '安全架构',
          'sections.tdd-performance-scalability': '性能与可扩展性',
          'sections.tdd-devops-deployment': 'DevOps与部署',
          'sections.tdd-testing-strategy': '测试策略',
          'sections.tdd-monitoring-analytics': '监控与分析',
          'sections.tdd-development-workflow': '开发工作流',
          'sections.tdd-database-design': '数据库设计',
          'sections.tdd-technology-stack': '技术栈',
          'sections.tdd-system-architecture': '系统架构',
          'sections.tdd-appendices': '附录'
        },
        common: {
          'app.title': 'Engineering Forge',
          'app.subtitle': '文档',
          'app.description': 'Engineering Forge 项目的综合文档',
          'navigation.home': '首页',
          'navigation.gdd': '游戏设计文档',
          'navigation.tdd': '技术设计文档',
          'navigation.search': '搜索文档...',
          'navigation.menu': '菜单',
          'navigation.close': '关闭',
          'actions.search': '搜索',
          'actions.toggleTheme': '切换主题',
          'actions.changeLanguage': '更改语言',
          'actions.reload': '重新加载',
          'actions.loading': '加载中...',
          'actions.error': '错误',
          'actions.retry': '重试',
          'content.loading': '正在加载内容...',
          'content.error': '内容加载错误',
          'content.reload': '重新加载页面',
          'content.notFound': '未找到内容',
          'content.lastUpdated': '最后更新',
          'content.readingTime': '阅读时间',
          'content.wordCount': '字数统计',
          'language.select': '选择语言',
          'language.current': '当前语言',
          'language.change': '更改语言',
          'theme.light': '浅色',
          'theme.dark': '深色',
          'theme.toggle': '切换主题',
          'search.placeholder': '搜索文档...',
          'search.noResults': '未找到结果',
          'search.results': '个结果',
          'search.clear': '清除搜索',
          'search.history': '搜索历史',
          'errors.generic': '出现错误',
          'errors.network': '网络错误',
          'errors.notFound': '页面未找到',
          'errors.unauthorized': '未授权访问',
          'errors.serverError': '服务器错误'
        }
      }
    }
  });

// Language utilities
export const getLanguageInfo = (code: string) => {
  return SUPPORTED_LANGUAGES[code as SupportedLanguage] || SUPPORTED_LANGUAGES.en;
};

export const getLanguageDirection = (code: string): 'ltr' | 'rtl' => {
  const language = getLanguageInfo(code);
  return language.rtl ? 'rtl' : 'ltr';
};

export const isRTL = (code: string): boolean => {
  return getLanguageDirection(code) === 'rtl';
};

// Change language with professional error handling and direction management
export const changeLanguage = async(language: string): Promise<boolean> => {
  try {
    await i18n.changeLanguage(language);

    // Use the professional language initializer to update direction
    languageInitializer.updateLanguageDirection(language);

    return true;
  } catch (error) {
    console.error(`Failed to change language to ${language}:`, error);
    return false;
  }
};

// Get current language with fallback
export const getCurrentLanguage = (): SupportedLanguage => {
  const currentLang = i18n.language;
  return Object.keys(SUPPORTED_LANGUAGES).includes(currentLang)
    ? currentLang as SupportedLanguage
    : 'en';
};

// Professional language initialization system
class LanguageInitializer {
  private static instance: LanguageInitializer;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): LanguageInitializer {
    if (!LanguageInitializer.instance) {
      LanguageInitializer.instance = new LanguageInitializer();
    }
    return LanguageInitializer.instance;
  }

  public initializeLanguageDirection(): void {
    if (this.isInitialized) {
return;
}

    try {
      // Only initialize if document is available (browser environment)
      if (typeof document !== 'undefined') {
        const currentLang = getCurrentLanguage();
        const direction = getLanguageDirection(currentLang);
        document.documentElement.dir = direction;
        document.documentElement.lang = currentLang;
        this.isInitialized = true;
      }
    } catch (error) {
      console.warn('Language direction initialization failed:', error);
    }
  }

  public updateLanguageDirection(language: string): void {
    try {
      if (typeof document !== 'undefined') {
        const direction = getLanguageDirection(language);
        document.documentElement.dir = direction;
        document.documentElement.lang = language;
      }
    } catch (error) {
      console.warn('Language direction update failed:', error);
    }
  }
}

// Export singleton instance
export const languageInitializer = LanguageInitializer.getInstance();

// NUCLEAR FIX: Disabled language initialization to prevent infinite loops
// if (typeof window !== 'undefined') {
//   // Use requestAnimationFrame to ensure DOM is ready
//   requestAnimationFrame(() => {
//     languageInitializer.initializeLanguageDirection();
//   });
// }

export default i18n;
