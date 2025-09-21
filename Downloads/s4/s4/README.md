# INskillify - AI-Powered Website Testing Platform

A comprehensive blackbox testing platform for modern websites. Discover bugs, security vulnerabilities, and optimization opportunities with our AI-powered testing platform.

## Features

- 🔍 **Automated Bug Detection** - Comprehensive scanning for accessibility issues, broken links, form errors, and UI/UX problems
- 🛡️ **Security Analysis** - Advanced security testing including vulnerability scanning and SSL analysis
- ⚡ **Performance Optimization** - Detailed performance metrics and Core Web Vitals analysis
- 🧠 **AI-Powered Insights** - Intelligent analysis with actionable recommendations
- 📊 **Market Analysis** - Comprehensive market research and competitor analysis
- 🌐 **Universal Compatibility** - Test any website - localhost, staging, or production

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pushkar-web/INskillify.git
cd INskillify
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

The app will work without Supabase configuration but authentication features will be disabled.

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── project/           # Project pages
├── components/            # Reusable components
│   ├── dashboard/         # Dashboard-specific components
│   ├── project/           # Project-specific components
│   └── ui/                # UI components (shadcn/ui)
├── lib/                   # Utility functions
│   ├── ai/                # AI testing modules
│   └── supabase/          # Supabase configuration
└── public/                # Static assets
```

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Language**: TypeScript

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.