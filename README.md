# 🌍 Carbon Footprint Awareness Platform

**PromptWars Challenge 3 Submission**

This platform helps individuals **understand, track, and reduce** their carbon footprint through simple actions and personalized AI insights.

## 🔗 Live Links
- **GitHub Repository**: [https://github.com/bcvinay8072/PromptWars-CarbonFootPrint](https://github.com/bcvinay8072/PromptWars-CarbonFootPrint)
- **Live Demo**: [https://prompt-wars-carbon-foot-print.vercel.app](https://prompt-wars-carbon-foot-print.vercel.app)

## 🎯 Chosen Vertical & Problem Statement
**Vertical:** Environmental Sustainability / Carbon Footprint Tracking

The problem statement required building a solution to help individuals understand their carbon footprint and reduce it through simple actions. This platform achieves this via:

1. **Understand**: A multi-step Calculator that assesses transport, diet, energy, and shopping habits to provide a heuristic footprint estimation.
2. **Track**: A Dashboard visualizing total emissions against global averages, with data persisted across sessions via `localStorage`.
3. **Reduce**: An AI-powered `EcoAssistant` with real-time streaming responses, plus a personalized `ActionPlan` with "Green Pledges" the user can commit to.

### Assumptions
- Emission factors are based on EPA and IPCC heuristic data for individual lifestyle assessment.
- The global average footprint is set to 4.0 tons CO2/year per capita (world average).
- The AI model used is `gpt-4o-mini` via an OpenAI-compatible proxy API.

## 🛠️ Technical Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript | Robust, type-safe UI |
| **Styling** | Vanilla CSS (Custom Properties) | Eco-Premium Dark Theme with Glassmorphism |
| **Icons** | Lucide React | Lightweight, accessible iconography |
| **AI Engine** | OpenAI API (Streaming) & React Markdown | Powers the `EcoAssistant` for real-time streaming advice |
| **API Proxy** | Vercel Serverless Functions | Server-side API route (`/api/chat`) — API key never exposed to browser |
| **State** | Custom Hooks + localStorage | Persistent footprint data and pledge tracking |
| **Deployment** | Vercel | Automated CI/CD with GitHub integration |
| **Testing** | Jest, React Testing Library | 60+ tests across 7 test suites |

## 📁 Project Structure

```
api/
└── chat.ts                  # Vercel serverless function — proxies OpenAI server-side
src/
├── components/
│   ├── ActionPlan.tsx       # Green Pledges based on footprint breakdown
│   ├── Calculator.tsx       # 4-step footprint estimation wizard
│   ├── Dashboard.tsx        # Emissions visualization & comparison
│   ├── EcoAssistant.tsx     # AI chat with streaming markdown responses
│   ├── ErrorBoundary.tsx    # Graceful runtime error recovery
│   └── __tests__/           # Co-located component test files
├── hooks/
│   ├── useCalculator.ts     # Calculator business logic (step mgmt, emission calc)
│   ├── useChat.ts           # Chat state, streaming, auto-scroll logic
│   └── useLocalStorage.ts   # Generic persistent state hook
├── lib/
│   ├── constants.ts         # All magic numbers, emission factors, pledge data
│   ├── openai.ts            # OpenAI streaming API integration
│   ├── utils.ts             # Sanitization, rate limiting, shared types
│   └── __tests__/           # Co-located utility test files
├── App.tsx                  # Root component with lazy loading & ErrorBoundary
├── index.tsx                # Entry point with Web Vitals monitoring
└── index.css                # Complete design system (no inline styles)
```

## 🛡️ Security Features
- **Server-Side API Proxy**: The OpenAI API key is never exposed to the client. All AI requests are routed through a Vercel serverless function (`/api/chat`), ensuring the key stays server-side.
- **Defense in Depth**: Input sanitization and validation happens on BOTH the client AND the server.
- **Token Bucket Rate Limiter**: Client-side token bucket rate limiter (`RateLimiter` class) prevents API spam and abuse with configurable refill rates.
- **Input Sanitization**: All user inputs are scrubbed of HTML tags, `javascript:` protocols, event handlers, and data URIs via `sanitizeInput()`.
- **Length Constraints**: Inputs are truncated to 1000 characters (configurable via `MAX_INPUT_LENGTH` constant).
- **Error Boundary**: A React Error Boundary component catches runtime crashes and renders a recovery UI instead of a blank screen.

## ♿ Accessibility Features
- **Semantic Landmarks**: Uses `<header>`, `<main>`, `<footer>`, and `<section>` with proper `role` and `aria-labelledby` attributes.
- **ARIA Attributes**: `aria-live="polite"`, `role="log"`, `role="status"`, and `aria-pressed` (on pledge toggles) for dynamic content.
- **Keyboard Navigation**: All buttons have `aria-label` attributes; form progression is linear and intuitive.
- **Contrast**: The Eco-Premium dark theme maintains WCAG-compliant contrast ratios.

## ⚡ Performance Optimizations (Efficiency)
- **Code Splitting**: `Dashboard`, `EcoAssistant`, and `ActionPlan` are loaded via `React.lazy()` + `<Suspense>` to minimize initial bundle size.
- **Dynamic Import**: The `openai` SDK is dynamically imported only as a fallback, keeping it out of the main client bundle.
- **Memoization**: All components wrapped in `React.memo`; handlers use `useCallback`; derived values use `useMemo`.
- **CSS Containment**: `contain: content` on glass panels and `will-change` on animated elements for compositing optimization.
- **Resource Hints**: `<link rel="preconnect">` and `<link rel="dns-prefetch">` for external domains in `index.html`.
- **Web Vitals Monitoring**: `reportWebVitals` wired to log CLS, FID, FCP, LCP, and TTFB metrics.
- **Zero Dead Dependencies**: No unused packages (removed `framer-motion`), no dead files.
- **Custom Hooks**: Business logic extracted from UI components into reusable hooks for separation of concerns and reduced re-renders.

## 🧪 Testing

**60+ tests across 7 test suites**, co-located alongside the code they test:

| Suite | Tests | Covers |
| :--- | :---: | :--- |
| `utils.test.ts` | 13 | XSS sanitization, rate limiter behavior |
| `App.test.tsx` | 9 | App layout, landmarks, routing |
| `Calculator.test.tsx` | 8 | Step progression, emission calc, a11y |
| `Dashboard.test.tsx` | 7 | Rendering, above/below avg, a11y |
| `EcoAssistant.test.tsx` | 9 | Chat interaction, input, streaming, a11y |
| `ActionPlan.test.tsx` | 8 | Pledge rendering, toggle, localStorage, a11y |
| `ErrorBoundary.test.tsx` | 5 | Error catching, fallback UI, recovery |

Run tests:
```bash
npm test
```

## 🚀 Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/bcvinay8072/PromptWars-CarbonFootPrint.git
   cd PromptWars-CarbonFootPrint/carbon-platform
   ```
2. Create a `.env` file based on `.env.example` and add your OpenAI proxy keys:
   ```env
   REACT_APP_OPENAI_API_KEY=your_key_here
   REACT_APP_OPENAI_BASE_URL=https://aipipe.org/openai/v1
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
