# Nama - AI-Powered Smart Contact Management System

[![CI](https://github.com/mcuteangel/Nama/actions/workflows/ci.yml/badge.svg)](https://github.com/mcuteangel/Nama/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/mcuteangel/Nama/badge.svg?branch=main)](https://coveralls.io/github/mcuteangel/Nama?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌐 Available Versions

- 🇺🇸 [English README](README.md) - English version
- 🇮🇷 [فارسی README](README-fa.md) - Persian version

## 📱 Overview

Nama is a modern and intelligent contact management application that revolutionizes how you organize and interact with your personal and professional networks through the power of artificial intelligence. Built with React, TypeScript, and Supabase, this application provides intelligent contact organization, AI-powered data extraction, and real-time cross-platform accessibility.

### ✨ Key Features

- 🤖 **Smart Contact Extraction**: Automatically extract structured contact information from unstructured text using Google's Generative AI (Gemini)
- 📱 **Cross-Platform**: Web and mobile support through Capacitor
- 🌐 **Internationalization**: Full support for English and Persian languages with RTL design
- 🎨 **Modern UI**: Built with shadcn/ui, Radix UI, and Tailwind CSS
- 🔐 **Secure Authentication**: Supabase Auth with Row Level Security (RLS)
- 📊 **Analytics & Insights**: Comprehensive contact insights and trends
- 🎯 **Custom Fields**: Flexible contact organization with user-defined fields
- 👥 **Group Management**: Organize contacts into customizable groups
- 👤 **Advanced User Management**: Modular user management system with enhanced features
- 🏗️ **Domain Architecture**: Structured domain models and business logic
- 📊 **Data Management**: Centralized data and configuration management
- 🔧 **Constants Configuration**: Centralized application constants and settings
- 🌙 **Dark/Light Theme**: Auto theme detection with manual toggle
- ♿ **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation

## 🏗️ Technology Stack

### Frontend

- **Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 6.3.4 with SWC compiler
- **UI Components**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS 3.4.11
- **State Management**: TanStack React Query 5.56.2
- **Forms**: React Hook Form 7.53.0 + Zod 3.23.8
- **Routing**: React Router DOM 6.26.2
- **Mobile**: Capacitor 7.4.2

### Backend

- **BaaS**: Supabase 2.55.0 (PostgreSQL + Auth + Edge Functions)
- **AI**: Google Generative AI 0.24.1
- **Authentication**: Supabase Auth with RLS
- **Database**: PostgreSQL with Row Level Security

### Development

- **Testing**: Vitest 3.2.4 + Testing Library + Cypress
- **Linting**: ESLint 9.9.0 + TypeScript ESLint
- **Performance**: Bundle analysis + performance monitoring
- **Accessibility**: axe-core testing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended: 20+)
- pnpm (recommended) or npm
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mcuteangel/Nama.git
   cd nama
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment**

   Create `.env.local` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_google_ai_api_key
   ```

4. **Set up database**

   Run Supabase migrations:

   ```bash
   npx supabase migration up
   ```

5. **Start development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

   The application will be available at `http://localhost:8000`

## 📱 Mobile Development

### Android

1. **Install Android Studio** and set up Android SDK
2. **Build the web app**:

   ```bash
   pnpm build
   ```

3. **Add Android platform**:

   ```bash
   npx cap add android
   ```

4. **Sync and open in Android Studio**:

   ```bash
   npx cap sync android
   npx cap open android
   ```

### iOS

1. **Install Xcode** (macOS only)
2. **Build the web app**:

   ```bash
   pnpm build
   ```

3. **Add iOS platform**:

   ```bash
   npx cap add ios
   ```

4. **Sync and open in Xcode**:

   ```bash
   npx cap sync ios
   npx cap open ios
   ```

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Integration Tests

```bash
# Run integration tests
pnpm test:integration
```

### End-to-End Tests

```bash
# Install Cypress (if not installed)
pnpm add -D cypress

# Open Cypress Test Runner
npx cypress open

# Run E2E tests in headless mode
npx cypress run
```

### Accessibility Tests

```bash
# Run accessibility tests
pnpm test:a11y
```

## 🏁 Build and Deployment

### Production Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Bundle Analysis

```bash
# Analyze bundle size
pnpm analyze

# Generate bundle report
pnpm analyze:bundle
```

### Performance Monitoring

```bash
# Run performance tests
pnpm test:performance

# Monitor bundle size
pnpm test:bundle
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_GEMINI_API_KEY` | Google AI API key | ✅ |
| `VITE_ENVIRONMENT` | Environment (development/production) | ❌ |

### Supabase Setup

1. Create a new Supabase project
2. Run the provided migrations in `supabase/migrations/`
3. Set up Edge Functions in `supabase/functions/`
4. Configure RLS policies for security

### AI Configuration

1. Get your Google AI API key from [Google AI Studio](https://aistudio.google.com/)
2. Add the key to your environment variables
3. Configure AI settings in the app settings page

## 📚 Architecture

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── contact-form/   # Contact form components
│   ├── common/         # Common components
│   ├── auth/           # Authentication components
│   ├── ai/             # AI-related components
│   └── __tests__/      # Component tests
├── features/           # Feature-based modules
│   ├── user-management/ # User management feature
│   └── contact-management/ # Contact management feature
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── integrations/       # Third-party integrations
├── lib/                # Configuration and helpers
├── constants/          # Application constants
├── data/               # Static data and configurations
├── domain/             # Domain models and business logic
└── locales/            # Internationalization files

supabase/
├── functions/          # Edge Functions
└── migrations/         # Database migrations

cypress/
├── e2e/               # End-to-end tests
├── fixtures/          # Test data
└── support/           # Test utilities
```

### Key Architecture Patterns

- **Component-Based Architecture**: Modular and reusable UI components
- **Service Layer Pattern**: Separation of business logic from presentation
- **Hook-Based State Management**: Custom hooks for state encapsulation
- **Lazy Loading**: Performance optimization with code splitting
- **Error Boundaries**: Graceful error handling and recovery

## 🤝 Contributing

We welcome contributions! Please see our development workflow below for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Run the test suite (`pnpm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- Follow existing TypeScript and React patterns
- Use meaningful names for components and variables
- Write tests for new features
- Follow accessibility best practices
- Ensure internationalization support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 🐛 Issues: [GitHub Issues](https://github.com/mcuteangel/Nama/issues)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the amazing BaaS platform
- [Google AI](https://ai.google.dev/) for generative AI capabilities
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📈 Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced AI-powered contact insights
- [ ] Integration with popular CRM systems
- [ ] Voice-based contact extraction
- [ ] Enhanced bulk import/export
- [ ] Advanced search and filtering
- [ ] Contact sharing and collaboration

---

**Built with ❤️ by the Nama Team**
