# AfterMe - Digital Legacy Platform

<div align="center">

**Preserve your legacy. Protect your loved ones.**

A modern digital legacy platform that helps you organize life's important information and create meaningful memories for future generations.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## Overview

**AfterMe** is a thoughtfully designed digital legacy platform that empowers individuals to organize, preserve, and share life's most important information with their loved ones. Whether it's capturing precious memories, documenting final wishes, or securing vital documents, AfterMe ensures nothing important is ever lost.

### Why AfterMe?

- **Peace of Mind**: Know that your loved ones will have access to everything they need
- **Organized Information**: Keep all important documents, accounts, and instructions in one secure place
- **Meaningful Memories**: Record voice messages, stories, and photo memories for future generations
- **Family Connection**: Build and maintain your family tree and legacy

---

## Features

### Voice Vault
Record heartfelt voice messages for your loved ones. Leave birthday wishes, life advice, or simply say the things that matter most.

### Memory Vault
Store and organize photos with rich descriptions. Create a visual timeline of life's precious moments with searchable tags and categories.

### Life Stories
Write your life story through guided prompts. Document childhood memories, career milestones, life lessons, and wisdom to pass on.

### Family Tree
Build an interactive family tree. Connect generations and preserve family history for future descendants.

### Life Vault
Securely store and organize critical life information:
- **Financial Records**: Bank accounts, investments, property details
- **Identity Documents**: Passport, Aadhaar, PAN, driving license
- **Insurance Policies**: Life, health, vehicle, and property insurance
- **Subscriptions**: Digital services, memberships, recurring payments
- **Emergency Contacts**: Important contacts and medical information
- **Nominee Information**: Beneficiary details for all accounts

### Legacy Instructions
Document your final wishes:
- Step-by-step instructions for loved ones
- Important contacts and what to do first
- Funeral and memorial preferences
- Personal messages to be delivered

### Progress Tracking
Track your legacy completion with:
- Overall readiness score
- Pillar-by-pillar progress
- Achievement badges
- Suggested next steps

### Eldercare
Resources and tools for managing eldercare responsibilities with compassion.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript 5** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Lucide React** | Beautiful icons |
| **bcryptjs** | Secure password hashing |
| **Zod** | Runtime validation |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/afterme.git
   cd afterme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

### Complete Directory Structure

```
afterme/
├── app/                          # Next.js App Router (Pages & Layouts)
│   ├── layout.tsx                # Root layout (fonts, global providers)
│   ├── page.tsx                  # Landing page (/)
│   ├── globals.css               # Global styles & Tailwind
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # 404 page
│   │
│   ├── auth/                     # Authentication pages
│   │   ├── layout.tsx            # Auth layout (centered, decorative)
│   │   ├── login/page.tsx        # Login page
│   │   ├── register/page.tsx     # Registration page
│   │   └── forgot-password/page.tsx
│   │
│   ├── dashboard/                # Protected dashboard area
│   │   ├── layout.tsx            # Dashboard layout (header, sidebar)
│   │   ├── page.tsx              # Dashboard home
│   │   ├── loading.tsx           # Dashboard loading state
│   │   ├── settings/page.tsx     # User settings
│   │   ├── progress/page.tsx     # Progress tracking
│   │   │
│   │   ├── voice/page.tsx        # Voice recordings
│   │   ├── memories/page.tsx     # Photo memories
│   │   ├── stories/page.tsx      # Life stories
│   │   ├── family/page.tsx       # Family tree
│   │   ├── legacy/page.tsx       # Legacy instructions
│   │   ├── eldercare/page.tsx    # Eldercare resources
│   │   ├── messages/page.tsx     # Messages for loved ones
│   │   │
│   │   └── vault/                # Life vault (nested routes)
│   │       ├── layout.tsx        # Vault sub-navigation
│   │       ├── page.tsx          # Vault overview
│   │       ├── finance/page.tsx
│   │       ├── identity/page.tsx
│   │       ├── insurance/page.tsx
│   │       ├── subscriptions/page.tsx
│   │       ├── emergency/page.tsx
│   │       └── nominees/page.tsx
│   │
│   └── api/                      # API routes
│       └── auth/
│           ├── login/route.ts
│           ├── register/route.ts
│           ├── logout/route.ts
│           └── me/route.ts
│
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── animated.tsx          # Animated decorative components
│   │   └── index.ts              # Barrel export
│   │
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── DashboardHeader.tsx   # Top navigation header
│   │   ├── InteractiveDashboard.tsx # Main dashboard view
│   │   └── index.ts
│   │
│   ├── auth/                     # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── index.ts
│   │
│   ├── marketing/                # Landing page sections
│   │   ├── HeroSection.tsx
│   │   ├── FeatureSection.tsx
│   │   ├── ProblemSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── TrustSection.tsx
│   │   ├── CTASection.tsx
│   │   └── index.ts
│   │
│   ├── shared/                   # Shared across pages
│   │   ├── Header.tsx            # Landing page header
│   │   ├── Footer.tsx
│   │   └── index.ts
│   │
│   └── decorative/               # SVG decorations & animations
│       └── index.tsx
│
├── lib/                          # Utilities & business logic
│   ├── utils.ts                  # General utilities (cn, getGreeting, etc.)
│   ├── auth.ts                   # Authentication helpers
│   ├── auth-context.tsx          # Auth React context
│   ├── constants/                # Centralized data
│   │   └── index.ts              # PILLARS, QUOTES, PROMPTS, etc.
│   └── hooks/                    # Custom React hooks
│       ├── useScrollAnimation.ts
│       └── index.ts
│
├── public/                       # Static assets
│   ├── images/
│   └── fonts/
│
├── middleware.ts                 # Auth route protection
├── tailwind.config.ts            # Tailwind configuration
├── next.config.ts                # Next.js configuration
└── package.json
```

---

### Where to Put Your Code

#### Adding a New Page

| Page Type | Location | Example |
|-----------|----------|---------|
| Public page | `app/page-name/page.tsx` | `app/about/page.tsx` |
| Dashboard page | `app/dashboard/page-name/page.tsx` | `app/dashboard/goals/page.tsx` |
| Auth page | `app/auth/page-name/page.tsx` | `app/auth/reset-password/page.tsx` |
| Nested vault page | `app/dashboard/vault/page-name/page.tsx` | `app/dashboard/vault/crypto/page.tsx` |

#### Adding a New Component

| Component Type | Location | Naming |
|----------------|----------|--------|
| UI primitive (button, input) | `components/ui/` | `button.tsx` (lowercase) |
| Dashboard component | `components/dashboard/` | `PillarCard.tsx` (PascalCase) |
| Marketing section | `components/marketing/` | `PricingSection.tsx` |
| Shared component | `components/shared/` | `Modal.tsx` |
| Auth component | `components/auth/` | `ResetPasswordForm.tsx` |
| Decorative SVG | `components/decorative/` | Export from `index.tsx` |

#### Adding Utilities & Data

| Type | Location | Example |
|------|----------|---------|
| Helper function | `lib/utils.ts` | `formatDate()`, `cn()` |
| React hook | `lib/hooks/` | `useLocalStorage.ts` |
| Constants/data | `lib/constants/index.ts` | `PILLARS`, `QUOTES` |
| Auth logic | `lib/auth.ts` | `getCurrentUser()` |
| Context provider | `lib/` | `theme-context.tsx` |

#### Adding API Routes

| API Type | Location | Example |
|----------|----------|---------|
| Auth endpoints | `app/api/auth/` | `app/api/auth/verify/route.ts` |
| Resource CRUD | `app/api/[resource]/` | `app/api/memories/route.ts` |
| Dynamic routes | `app/api/[resource]/[id]/` | `app/api/memories/[id]/route.ts` |

---

### Component Architecture Guidelines

#### 1. Page Components (`app/**/page.tsx`)
- Should be thin wrappers that compose components
- Handle data fetching (Server Components)
- Pass data to client components

```tsx
// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { InteractiveDashboard } from "@/components/dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return <InteractiveDashboard userName={user?.name || "Friend"} />;
}
```

#### 2. Feature Components (`components/dashboard/`)
- Large, feature-specific components
- Use `"use client"` for interactivity
- Import from `@/lib/constants` for data

```tsx
// components/dashboard/VoiceRecorder.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui";

export function VoiceRecorder() { ... }
```

#### 3. UI Components (`components/ui/`)
- Small, reusable primitives
- Accept variants via props
- Use `cn()` for class merging

```tsx
// components/ui/button.tsx
import { cn } from "@/lib/utils";

export function Button({ variant, className, ...props }) {
  return <button className={cn(baseStyles, variants[variant], className)} {...props} />;
}
```

#### 4. Constants & Data (`lib/constants/`)
- Single source of truth for static data
- Export TypeScript interfaces
- Used across components

```tsx
// lib/constants/index.ts
export interface Pillar {
  id: string;
  name: string;
  icon: LucideIcon;
  href: string;
}

export const PILLARS: Pillar[] = [ ... ];
```

---

### Import Aliases

Use these path aliases (configured in `tsconfig.json`):

```tsx
// Instead of relative imports
import { Button } from "../../../components/ui/button";

// Use aliases
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { PILLARS } from "@/lib/constants";
```

---

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | `page.tsx` | `app/dashboard/page.tsx` |
| Layouts | `layout.tsx` | `app/dashboard/layout.tsx` |
| Loading | `loading.tsx` | `app/dashboard/loading.tsx` |
| Error | `error.tsx` | `app/error.tsx` |
| Components | PascalCase | `DashboardHeader.tsx` |
| UI primitives | lowercase | `button.tsx`, `card.tsx` |
| Utilities | camelCase | `utils.ts`, `auth.ts` |
| Hooks | camelCase with `use` | `useScrollAnimation.ts` |
| Constants | camelCase | `constants/index.ts` |
| API routes | `route.ts` | `app/api/auth/login/route.ts` |

---

## Design Philosophy

### Sage Green Theme
AfterMe uses a calming sage green color palette that evokes:
- **Tranquility**: A peaceful environment for sensitive topics
- **Growth**: Life, nature, and legacy
- **Trust**: Stability and reliability

### Artistic Animations
Thoughtfully designed micro-interactions featuring:
- Floating leaves and nature elements
- Gentle breathing animations
- Subtle sparkles and fireflies
- Smooth page transitions

### Accessibility
- Full keyboard navigation
- ARIA labels and roles
- Focus management
- Screen reader support

---

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Zod schemas for all user input
- **HTTP-only Cookies**: Secure session management
- **CSRF Protection**: SameSite cookie policy

---

## Roadmap

### Phase 1 (Current)
- [x] User authentication
- [x] Dashboard with progress tracking
- [x] Voice vault
- [x] Memory vault
- [x] Life stories
- [x] Family tree
- [x] Life vault (finance, identity, insurance, subscriptions)
- [x] Legacy instructions
- [x] Eldercare resources

### Phase 2 (Upcoming)
- [ ] Database integration (PostgreSQL + Prisma)
- [ ] File upload storage (S3/Cloudinary)
- [ ] Email notifications
- [ ] Family sharing and permissions
- [ ] PDF export of legacy documents
- [ ] Mobile app (React Native)

### Phase 3 (Future)
- [ ] AI-powered story prompts
- [ ] Voice-to-text transcription
- [ ] Scheduled message delivery
- [ ] Legal document templates
- [ ] Multi-language support

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (for future use)
DATABASE_URL=your_database_url

# Session Secret (for future JWT implementation)
SESSION_SECRET=your_secret_key

# File Storage (for future use)
CLOUDINARY_URL=your_cloudinary_url
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

<div align="center">

**Built with love for the ones we love**

*AfterMe - Because your legacy matters*

</div>
