# Broke But Functional — Survive the Month
> **PROMPT RUN 2026 Web Development Competition Entry**  
> *A high-precision, interactive personal finance web application built for Gen Z to master a limited ₹10,000 budget over a 30-day survival horizon.*

---

## 🌟 Executive Summary

**Broke But Functional** goes beyond passive expense tracking. It models an interconnected, consequence-driven financial reality for young adults living on a strict ₹10,000 monthly budget. Every decision produces visible, mathematically consistent ripples across spendable balances, daily allowances, upcoming commitments, protected savings, 30-day forecasts, and financial health scores.

---

## 🛠️ Technology Stack

- **Framework**: React 19 with TypeScript
- **Bundler & Tooling**: Vite 8 with optimized manual code-splitting (Rollup)
- **Styling**: Tailwind CSS with custom dark navy/deep charcoal theme & neon mint accents
- **Data Visualizations**: Recharts (`ResponsiveContainer`, `AreaChart`, `ReferenceLine`, Custom Tooltips)
- **Icons**: Lucide React
- **Persistence**: LocalStorage with schema validation, error recovery, and demo reset
- **Unit Testing**: Vitest (11 comprehensive unit tests verifying accounting consistency)
- **Linter**: Oxlint (0 warnings, 0 errors)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+` or `v11+`

### Installation & Execution
```bash
# Navigate to the project directory
cd broke-but-functional

# Install dependencies (already pre-installed)
npm install

# Start the Vite development server
npm run dev

# Run the unit test suite (Vitest)
npm test

# Run code linter
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🧮 Core Accounting & Mathematical Model

The application enforces a single source of truth (`src/utils/financialEngine.ts`) across all views:

1. **Starting Monthly Budget**: Default ₹10,000.
2. **Current Cash Balance**:
   $$\text{Cash Balance} = \text{Starting Budget} + \sum \text{Income} - \sum \text{Expenses}$$
3. **Protected Savings**:
   $$\text{Protected Savings} = \sum \text{SavingsGoal}.\text{currentAmount}$$
4. **Outstanding Commitments**:
   $$\text{Outstanding Commitments} = \sum_{\text{isPaid} = \text{false}} \text{Commitment}.\text{amount}$$
5. **Spendable Balance (The Golden Rule)**:
   $$\text{Spendable Balance} = \text{Current Cash Balance} - \text{Outstanding Commitments} - \text{Protected Savings}$$
   *Rule: Money earmarked for upcoming bills or ring-fenced in emergency savings cannot be spent today without risking default.*
6. **Recommended Daily Allowance**:
   $$\text{Daily Allowance} = \max\left(0, \left\lfloor \frac{\text{Spendable Balance}}{\max(1, \text{Days Remaining})} \right\rfloor\right)$$
7. **Zero Double-Counting Guarantee**:
   When an upcoming commitment is paid, an expense transaction with `linkedCommitmentId` is recorded and the commitment is marked `isPaid: true`. Cash drops by ₹X and outstanding commitments drops by ₹X—leaving spendable balance mathematically exact!
8. **Financial Health Score (0–100)**:
   - **Pillar 1: Runway & Daily Allowance Viability** (Max 35 pts)
   - **Pillar 2: Commitment Coverage Ratio** (Max 25 pts)
   - **Pillar 3: Emergency Savings Cushion** (Max 20 pts)
   - **Pillar 4: Spending Burn Rate Velocity** (Max 20 pts)

---

## 🧭 Feature Overview

### 1. Main Dashboard
- **KPI Overview Cards**: Spendable Balance, Daily Allowance, Recorded Spending, and Locked Buffer.
- **Budget Allocation Progress Bar**: Accessible multi-segment indicator (Spent, Unpaid Bills, Savings, Runway) with over-budget alerts.
- **Daily Spending Engine**: Detailed breakdown of today's spending cap with concrete ripple-effect examples (-₹500 splurges vs +₹200 savings).
- **Live Data-Derived Insights**: Contextual explanations based on calculated figures.
- **Recent Activity Ledger**: Synchronized transactions with category badges.

### 2. Decision Simulator ("Before You Spend / What-If?")
- Preview proposed financial decisions before spending a single rupee.
- Realistic Gen Z presets: Swiggy midnight orders, sneakers flash sales, Netflix UHD, freelance gigs, dental emergencies, and savings contributions.
- Live before-vs-after comparison grid: Spendable balance, daily allowance, month-end projection, health score, and risk rating.
- Deficit warnings & actionable advice.
- **Apply Decision** (commits to live ledger exactly once) vs **Discard Simulation**.

### 3. Commitments & Subscriptions Manager
- Track fixed bills and recurring subscriptions (WiFi, mobile, Spotify, room electricity, mess advance).
- Urgency badges ("Due in 2 days", "Overdue", "Due Today").
- Cash coverage ratio indicator.
- Single-click **Mark as Paid** without double-counting.

### 4. Protected Savings Goals
- Ring-fence funds away from daily spending (Emergency Cushion, Noise-Cancelling Headphones).
- Interactive Deposit / Withdraw modal displaying live impact on daily allowance before confirming.
- Visual progress bars and countdown timers.

### 5. Unexpected Expense Triage Flow
- Stress-test emergency expenses (Medical clinics, scooter repairs, burnt laptop chargers, surge commute).
- Quantifies financial shockwaves across the remaining month.
- Generates actionable recovery trade-offs (e.g. "Cut dining by ₹65/day for 18 days" or "Pause ₹59 Spotify").

### 6. 30-Day Financial Forecast
- Interactive Recharts Area Chart displaying daily cash balance and spendable runway.
- Historical factual data (Days 1–12) seamlessly joined with deterministic baseline projections (Days 13–30).
- Scheduled bill milestone calendar.

### 7. Financial Health & Risk Engine
- Circular score gauge (0–100) and risk level rating (Low, Moderate, High, Critical).
- Detailed 4-pillar mathematical breakdown with transparency notes.
- Sensitivity links into Decision Simulator.

### 8. Dynamic Action Plan ("Your Next Best Moves")
- Ranked, non-judgmental recommendations with calculated numerical impact.

---

## 🏆 FAIE Self-Evaluation Summary

1. **Performance**: Optimized Vite 8 production build (708ms); rollup code-splitting into lightweight vendor chunks; index JS bundle gzipped to 30.2 kB; pure CSS transitions; zero layout shifts.
2. **Code Quality**: Strict TypeScript with zero errors; Oxlint check with 0 warnings; 11 passing Vitest unit tests; robust separation of accounting engine and UI components.
3. **Functionality**: All 15 required user journeys fully implemented and verified; dual simulate-versus-apply workflows; persistence across page refreshes with demo reset capability.
4. **UI/UX & Accessibility**: Distinctive Gen Z fintech art direction; dark navy theme (`#080d1a`) with neon mint accents (`#10b981`); high-contrast typography; semantic HTML; visible keyboard focus states; full mobile responsiveness with bottom navigation.
5. **Problem Alignment**: 100% compliant with the "Broke But Functional — Survive the Month" challenge specification, featuring ₹10,000 budget, 30-day horizon, and INR formatting throughout.
