# 🌍 Carbon Footprint Awareness Platform

**Challenge 3 Submission**

This platform helps individuals **understand, track, and reduce** their carbon footprint through simple actions and personalized AI insights.

## 🔗 Live Links
- **GitHub Repository**: [Link here]
- **Live Demo**: [Cloud Run URL here]

## 🎯 Chosen Vertical & Problem Statement
**Vertical:** Environmental Sustainability / Carbon Footprint Tracking

The problem statement required building a solution to help individuals understand their carbon footprint and reduce it through simple actions. This platform achieves this via:
1.  **Understand**: A multi-step Calculator form that assesses transport, diet, energy, and shopping habits to provide a heuristic footprint estimation.
2.  **Track**: A Dashboard visualizing the total emissions against global averages, giving the user context about their impact.
3.  **Reduce**: An AI-powered `EcoAssistant` that takes the user's specific footprint breakdown and provides hyper-personalized, actionable reduction strategies.

## 🛠️ Technical Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript | Robust, type-safe UI |
| **Styling** | Vanilla CSS (Custom Properties) | Eco-Premium Dark Theme with Glassmorphism |
| **Icons** | Lucide React | Lightweight, accessible iconography |
| **AI Engine** | OpenAI API | Powers the `EcoAssistant` for personalized advice |
| **Deployment** | Docker, Nginx, Google Cloud Run | Scalable production hosting |
| **Testing** | Jest, React Testing Library | Ensuring reliability and catching regressions |

## 🛡️ Security Features
- **Token Bucket Rate Limiter**: The AI chat requests are protected by a client-side token bucket rate limiter to prevent API spam and abuse.
- **Input Sanitization**: All user inputs sent to the AI assistant are scrubbed of HTML tags, `javascript:` protocols, and data URIs to prevent XSS attacks.
- **Length Constraints**: Inputs are truncated to 1000 characters to prevent payload bloat.
- **Graceful Error Boundaries**: The chat gracefully handles network/API errors without crashing the app.

## ♿ Accessibility Features
- **Semantic Landmarks**: Uses `<header>`, `<main>`, `<footer>`, and `<section>` to ensure proper document structure for screen readers.
- **ARIA Attributes**: Uses `aria-live="polite"`, `role="log"`, and `role="status"` in the chat and loading states to announce dynamic content changes.
- **Keyboard Navigation**: All buttons and interactive elements are focusable and usable via keyboard. Form progression is linear and intuitive.
- **Contrast**: The Eco-Premium dark theme maintains high contrast ratios for readability.

## ⚡ Performance Optimizations (Efficiency)
- **Lazy Loading**: The `Dashboard` and `EcoAssistant` components are loaded dynamically via `React.lazy()` and `<Suspense>` to reduce the initial bundle size.
- **Debounced Updates**: State updates are managed efficiently.
- **Vanilla CSS**: Avoids the overhead of heavy CSS-in-JS libraries or large frameworks.

## 🧪 Testing Achievement
Achieved high test coverage with **35+ robust unit and integration tests** ensuring code quality across:
- Security Utility Verification
- Application Routing & Rendering
- Calculator Progression State
- Dashboard Visual Logic
- AI Assistant Message Flow

## 🐳 Running Locally & Deployment

### Local Development
1. Clone the repository and navigate to the project directory.
2. Create a `.env` file based on `.env.example` and add your OpenAI proxy keys.
3. Install dependencies: `npm install`
4. Start the server: `npm start`

### Deploying to Google Cloud Run (Free Tier Eligible)
Because Cloud Run provides a generous free tier, this project includes a multi-stage `Dockerfile`.

```bash
# 1. Build the Docker image
docker build -t carbon-platform .

# 2. Deploy to Cloud Run (replace PROJECT_ID and YOUR_PROXY_KEY)
gcloud run deploy carbon-platform \\
  --source . \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --project PROJECT_ID \\
  --port 8080 \\
  --set-build-env-vars REACT_APP_OPENAI_API_KEY=YOUR_PROXY_KEY,REACT_APP_OPENAI_BASE_URL=YOUR_PROXY_BASE_URL
```
