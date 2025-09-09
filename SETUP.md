# 🚀 Quick Setup Guide - FitForge AI

## Getting Started Immediately

You can run the app right now without any configuration! The app will run in **demo mode** with mock data.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Full Setup (5 minutes)

To enable all features (database, authentication, AI), follow these steps:

### 1. Copy Environment Template
```bash
cp .env.local.example .env.local
```

### 2. Set Up Supabase (Database & Auth)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings > API**
4. Copy your values to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Set Up OpenAI (AI Features)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_key
   ```

### 4. Restart the Development Server
```bash
npm run dev
```

## ✨ What You Get

### Demo Mode (No Setup Required)
- ✅ Full UI/UX experience
- ✅ Component interactions
- ✅ Visual feedback
- ❌ No data persistence
- ❌ No authentication
- ❌ Limited AI features

### Full Mode (With Setup)
- ✅ Complete authentication system
- ✅ Database persistence
- ✅ AI-powered fitness coaching
- ✅ Progress tracking
- ✅ Real-time chat
- ✅ PWA capabilities

## 📱 Features Overview

- **AI Fitness Coach** - Personalized workout and nutrition plans
- **Progress Tracking** - Photos, measurements, and analytics
- **Smart Workouts** - Adaptive exercise routines
- **Nutrition Guidance** - Meal planning and tracking
- **Community Features** - Social fitness challenges
- **PWA Support** - Install on mobile devices

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📖 Documentation

- [Production Deployment Guide](./PRODUCTION_CONFIG.md)
- [Production Readiness Checklist](./PRODUCTION_CHECKLIST.md)
- [API Documentation](./docs/api.md) (auto-generated)

## 🆘 Troubleshooting

### Common Issues

**Error: "Missing Supabase environment variables"**
- Solution: Copy `.env.local.example` to `.env.local` and add your Supabase credentials

**Error: "OpenAI API key not found"**
- Solution: Add your OpenAI API key to `.env.local`

**Error: Build fails**
- Solution: Run `npm run type-check` to see TypeScript errors

### Need Help?

1. Check the [troubleshooting guide](./docs/troubleshooting.md)
2. Review the [production config](./PRODUCTION_CONFIG.md)
3. Open an issue on GitHub

## 🎯 Next Steps

1. **Try Demo Mode** - Run the app immediately to explore features
2. **Set Up Full Mode** - Follow the 5-minute setup for complete functionality
3. **Deploy to Production** - Use the production guide for deployment
4. **Customize** - Modify components and features to fit your needs

---

**Happy coding! 💪** Your AI fitness coaching platform awaits!