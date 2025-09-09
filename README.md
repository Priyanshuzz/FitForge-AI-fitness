# 🏋️ FitForge AI - Your Personal Fitness Coach

> **AI-Powered Fitness Coaching Platform** with personalized workouts, nutrition guidance, and progress tracking.

![FitForge AI](https://img.shields.io/badge/Next.js-14.2.16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange?style=for-the-badge&logo=openai)

## 🚀 Quick Start (30 seconds)

Get started immediately with **demo mode** - no configuration required!

```bash
# Clone and install
git clone <repository-url>
cd platform
npm install

# Start in demo mode
npm run dev
```

**Demo Mode Features:**

- ✅ Full UI/UX experience
- ✅ Component interactions
- ✅ Visual feedback
- ❌ No data persistence
- ❌ No authentication
- ❌ Limited AI features

**→ Open [http://localhost:3000](http://localhost:3000) to explore!**

## ⚙️ Full Setup (5 minutes)

Unlock all features with database, authentication, and AI:

### Option 1: Interactive Setup (Recommended)

```bash
npm run setup
```

### Option 2: Manual Setup

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your credentials:
# - Supabase URL and key
# - OpenAI API key
```

**Get Your Credentials:**

- **Supabase**: [supabase.com](https://supabase.com) → Create project → Settings → API
- **OpenAI**: [platform.openai.com](https://platform.openai.com) → Create API key

## ✨ Features

### 🤖 AI-Powered Coaching

- Personalized workout plans
- Nutrition guidance and meal planning
- Real-time chat with AI coach
- Adaptive plan adjustments based on progress

### 📊 Progress Tracking

- Photo progress comparisons
- Detailed analytics and insights
- Workout and nutrition logging
- Performance metrics

### 🔐 Authentication & Security

- Email/password authentication
- Google OAuth integration
- Secure session management
- Protected routes and data

### 📱 Modern Experience

- Progressive Web App (PWA)
- Offline functionality
- Mobile-responsive design
- Dark/light mode support

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4 with Vercel AI SDK
- **Charts**: Recharts
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel, Netlify compatible

## 📋 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run setup        # Interactive environment setup

# Building
npm run build        # Production build
npm run start        # Start production server
npm run type-check   # TypeScript validation

# Testing
npm run test         # Unit tests
npm run test:watch   # Watch mode
npm run test:e2e     # End-to-end tests

# Code Quality
npm run lint         # ESLint
```

## 📁 Project Structure

```
platform/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── coach/             # AI coach interface
│   └── setup/             # Setup guide
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── chat/             # Chat components
│   └── progress/         # Progress tracking
├── lib/                  # Utilities and services
│   ├── ai/              # AI integration
│   ├── supabase/        # Database client
│   └── utils/           # Helper functions
├── contexts/            # React contexts
├── hooks/              # Custom hooks
└── public/             # Static assets
```

## 🔧 Configuration Options

### Environment Variables

| Variable                        | Required | Description                       |
| ------------------------------- | -------- | --------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes\*    | Supabase project URL              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes\*    | Supabase anon key                 |
| `OPENAI_API_KEY`                | Yes\*    | OpenAI API key                    |
| `NEXT_PUBLIC_APP_URL`           | No       | App URL (default: localhost:3000) |
| `SENTRY_DSN`                    | No       | Error monitoring                  |
| `NEXT_PUBLIC_GA_ID`             | No       | Google Analytics                  |

_\*Required for full functionality. App works in demo mode without these._

### Feature Flags

Control features via environment variables:

```bash
# Disable features (set to 'false')
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_PROGRESS_PHOTOS=true
NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES=true
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

### Docker

```bash
# Build image
docker build -t fitforge-ai .

# Run container
docker run -p 3000:3000 fitforge-ai
```

## 📖 Documentation

- [📋 Production Deployment Guide](./PRODUCTION_CONFIG.md)
- [✅ Production Readiness Checklist](./PRODUCTION_CHECKLIST.md)
- [🚀 Quick Setup Guide](./SETUP.md)
- [🔧 API Documentation](./docs/api.md)

## 🧪 Testing

Comprehensive testing suite included:

- **Unit Tests**: Component and utility testing
- **Integration Tests**: API and database testing
- **E2E Tests**: Full user journey testing
- **Visual Tests**: UI component regression testing

```bash
# Run all tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Setup Issues**: Check the [Setup Guide](./SETUP.md)
- **Bugs**: Open an issue on GitHub
- **Feature Requests**: Open a discussion
- **Documentation**: Check the [docs](./docs/) folder

## 🎯 Roadmap

- [ ] **Mobile App** - React Native companion app
- [ ] **Wearable Integration** - Apple Watch, Fitbit sync
- [ ] **Social Features** - Community challenges, sharing
- [ ] **Advanced Analytics** - ML-powered insights
- [ ] **Marketplace** - Equipment and supplement recommendations
- [ ] **Telehealth** - Connect with certified trainers

---

**Built with ❤️ by the FitForge AI Team**

_Transform your fitness journey with the power of AI_ 💪
