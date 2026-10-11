# Broke But Functional — Survive the Month
> **PROMPT RUN 2026 Web Development Competition Entry**  
> *A consequence-driven, mathematically rigorous personal finance web application built for Gen Z to master a limited ₹10,000 budget across a 30-day survival horizon.*

[![Live Application](https://img.shields.io/badge/Live_Deployment-Vercel-10b981?style=for-the-badge&logo=vercel)](https://broke-but-functional-mu.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-1e293b?style=for-the-badge&logo=github)](https://github.com/gunja-ramana/broke-but-functional)
[![Tests Passing](https://img.shields.io/badge/Vitest-16%2F16_Passed-10b981?style=for-the-badge)](https://vitest.dev/)
[![Linter](https://img.shields.io/badge/Oxlint-0_Warnings-10b981?style=for-the-badge)](https://oxc-project.github.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Checked-3178c6?style=for-the-badge)](https://www.typescriptlang.org/)

---

## 📌 Project Overview & URLs

* **Live Deployment URL**: [https://broke-but-functional-mu.vercel.app/](https://broke-but-functional-mu.vercel.app/)
* **GitHub Repository URL**: [https://github.com/gunja-ramana/broke-but-functional](https://github.com/gunja-ramana/broke-but-functional)
* **Local Project Directory**: `C:\Users\gunja\.gemini\antigravity\scratch\broke-but-functional`

---

## 🎯 Problem Statement & Target Audience

### The Challenge
Most personal finance tools are passive bookkeeping diaries: they log past transactions without modeling future constraints. For young adults and students operating on a strict monthly budget—specifically **₹10,000 over 30 days**—spending ₹500 on impulse food delivery isn't just a minor line item; it directly shrinks their remaining daily spending allowance, imperils scheduled utility bills, and forces emergency trade-offs.

### Target Audience
* **Gen Z College Students & Early Career Professionals**: Individuals navigating hostel fees, shared rent, internet recharges, streaming subscriptions, and unpredictable day-to-day discretionary spending.
* **Budget Survivors**: Users who need real-time clarity on **Spendable Balance** (money that can actually be spent today without defaulting on upcoming bills or draining emergency savings).

---

## 🧠 Architectural Overview & Data Flow

All calculations originate from a **single, pure functional source of truth** (`src/utils/financialEngine.ts`). Components never independently compute totals, preventing state desynchronization and double-subtraction anomalies.

```mermaid
flowchart TD
    subgraph Storage [Persistent Storage & Hydration]
        LS[(Browser LocalStorage)] <--> S[Safe Storage Layer<br/>src/utils/storage.ts]
    end

    subgraph State [React Context State Management]
        S --> FC[FinanceContext Provider<br/>src/context/FinanceContext.tsx]
        TX[Transactions Ledger] --> FC
        CM[Commitments & Bills] --> FC
        SG[Savings Goals Vault] --> FC
        CFG[Config: ₹10k Budget, Day N] --> FC
    end

    subgraph Engine [Pure Mathematical Calculation Engine]
        FC --> FE[financialEngine.ts<br/>O(N) Pure Functions]
        FE --> SUM[Financial Summary<br/>Spendable, Daily Cap, Cash]
        FE --> FCST[30-Day Forecast Path]
        FE --> HLT[4-Pillar Health Score 0-100]
        FE --> ACT[Dynamic Action Moves]
        FE --> SIM[Decision Simulator Engine]
    end

    subgraph Presentation [Responsive UI Layer]
        SUM --> DASH[Dashboard & KPIs]
        FCST --> CHART[30-Day Forecast: Chart & Table]
        HLT --> HLTH[Health & Risk View]
        SIM --> SIMVIEW[Before-vs-After Simulator]
        ACT --> ACTVIEW[Action Plan Cards]
    end
```

---

## 🛠️ Technology Stack & Dependencies

Built with a modern, high-performance, frontend-first stack with zero external server dependencies or API key requirements:

| Layer | Technology | Version | Rationale & Usage |
|---|---|---|---|
| **Core Framework** | React | `^19.2.8` | Concurrent rendering, strict state transitions, hooks architecture. |
| **Language** | TypeScript | `~6.0.2` | Complete type safety with `verbatimModuleSyntax: true` and 0 `any` types. |
| **Bundler & Tooling** | Vite | `^8.3.0` | Sub-second HMR and optimized production Rollup packaging. |
| **Styling** | Tailwind CSS | `^3.4.17` | Utility-first responsive design, dark navy palette, custom contrast tokens. |
| **PostCSS & Prefixes** | PostCSS / Autoprefixer | `^8.5.29` / `^10.6.1` | Cross-browser CSS compatibility and vendor prefixing. |
| **Data Visualizations** | Recharts | `^3.10.1` | Responsive SVG area charts with accessible data table equivalents. |
| **Icons** | Lucide React | `^1.55.0` | Accessible, tree-shakeable SVG icons for fintech metrics. |
| **Test Runner** | Vitest | `^5.0.3` | High-speed unit test runner verifying accounting invariants. |
| **Linter** | Oxlint | `^1.81.0` | Ultra-fast Rust-based linter enforcing clean code rules. |
| **Persistence** | Browser LocalStorage | Native Web API | Client-side persistence with schema validation and fallback recovery. |

---

## 🧮 Core Accounting & Mathematical Model

The application enforces strict financial invariant formulas to guarantee complete coherence:

### 1. Cash in Hand vs. Spendable Balance
$$\text{Current Cash Balance} = \text{Starting Budget} + \sum \text{Income} - \sum \text{Expenses}$$

$$\text{Outstanding Commitments} = \sum_{\text{isPaid} = \text{false}} \text{Commitment}.\text{amount}$$

$$\text{Protected Savings} = \sum \text{SavingsGoal}.\text{currentAmount}$$

$$\mathbf{Spendable\ Balance} = \text{Current Cash Balance} - \text{Outstanding Commitments} - \text{Protected Savings}$$

> **The Golden Rule**: Money already committed to upcoming utility bills or locked in emergency savings **cannot be spent today**. Spending from spendable cash protects you from bill default.

### 2. Recommended Daily Spending Allowance
$$\mathbf{Daily\ Allowance} = \begin{cases} 
\max(0, \lfloor\text{Spendable Balance}\rfloor) & \text{if } \text{Days Remaining} = 0 \\
\max\left(0, \left\lfloor \frac{\text{Spendable Balance}}{\text{Days Remaining}} \right\rfloor\right) & \text{if } \text{Days Remaining} > 0 
\end{cases}$$

### 3. Zero Double-Counting Guarantee
When a user marks a scheduled bill as **Paid**:
1. An expense transaction is created with `linkedCommitmentId = commitment.id`.
2. The commitment status updates to `isPaid = true`.
3. Total expenses increase by ₹X $\rightarrow$ Cash balance decreases by ₹X.
4. Outstanding commitments decrease by ₹X.
5. **Result**: Spendable balance remains mathematically identical. No double subtraction!

### 4. 4-Pillar Financial Health Breakdown (0–100)
A transparent, non-fabricated heuristic evaluating resilience across 4 distinct dimensions:
* **Pillar 1: Runway & Daily Cap Viability** (Max 35 pts): Ratio of current daily allowance to the ₹333/day baseline.
* **Pillar 2: Commitment Coverage Ratio** (Max 25 pts): Ability of existing cash to cover all outstanding bills.
* **Pillar 3: Emergency Savings Cushion** (Max 20 pts): Progress toward ring-fencing safety-net reserves.
* **Pillar 4: Spending Burn Rate Discipline** (Max 20 pts): Ratio of recorded daily velocity to ideal budget burn.

---

## 🧭 Verified Feature Tour

### 1. Main Survival Dashboard
* **KPI Metric Cards**: Spendable Balance, Daily Allowance, Recorded Spending, and Ring-Fenced Funds.
* **Budget Allocation Progress Bar**: Dynamic breakdown of Spent, Unpaid Bills, Protected Savings, and Spendable Runway relative to total effective budget (`₹10,000` base + income).
* **Daily Spending Engine**: Detailed view of today's spending cap with concrete ripple-effect scenarios (-₹500 splurges vs +₹200 savings).
* **Dynamic Action Plan ("Your Next Best Moves")**: Ranked, non-judgmental recommendations with calculated numerical impact.
* **Synchronized Activity Ledger**: Real-time list of recent transactions with category badges.

### 2. Decision Simulator ("Before You Spend / What-If?")
* **Preview Without State Mutation**: Test-drive financial moves before committing a single rupee.
* **6-Dimension Comparison Grid**:
  1. Spendable Balance (Before vs. After vs. $\Delta$)
  2. Daily Allowance (Before vs. After vs. $\Delta$)
  3. Ring-Fenced Savings (Before vs. After vs. $\Delta$)
  4. Projected Month-End Finish (Before vs. After vs. $\Delta$)
  5. Health Score (Before vs. After vs. $\Delta$)
  6. Financial Risk Level (Low / Moderate / High / Critical)
* **Survival Mode: Practical Compensatory Options**:
  * *Option 1 (Daily Belt-Tightening)*: Exact reduction in daily allowance to absorb the cost over remaining days.
  * *Option 2 (Subscription Freeze)*: Identifies active unpaid subscriptions that can be deferred to offset the expense.
  * *Option 3 (Vault Cushion Drawdown)*: Quantifies buffer available from protected savings.
* **Dual Action Workflow**: Clear "Discard Simulation" (resets preview cleanly) vs. "Apply Decision" (commits to live ledger exactly once).

### 3. Commitments & Subscriptions Manager
* **Bill Tracking**: Manage fixed bills and recurring streaming subscriptions (WiFi, mobile postpaid, Spotify, hostel catering).
* **Urgency Indicators**: "Overdue", "Due Today", "Due in N days", and "Settled".
* **Single-Click Settlement**: "Mark as Paid" converts liabilities into transactions without double-counting.

### 4. Protected Savings Vault
* **Ring-Fenced Savings Goals**: Isolate emergency funds and planned purchases away from daily spending allowance.
* **Deposit & Withdraw Modal**: Interactive controls with live impact preview on daily allowance.
* **Recent Vault Activity Feed**: Timestamped deposit and withdrawal log displayed directly on goal cards.

### 5. Unexpected Expense Triage Flow
* **Emergency Shock Scenarios**: Medical visits, transit surge, device repair, and urgent tuition prints.
* **Shockwave Quantification**: Calculates immediate drop in spendable cash and daily allowance across the remaining month.
* **Tagged Ledger Logging**: Automatically tags emergency expenses with `[EMERGENCY]` for separate auditing.

### 6. 30-Day Financial Forecast
* **Interactive Area Chart**: Visual path of running cash balance vs. spendable runway across Days 1–30.
* **Accessible Data Table View**: WCAG 2.1 compliant tabular view providing complete text alternatives for chart data.
* **Scheduled Bill Milestones**: Highlights exact calendar dates where bills are due.

### 7. Financial Health & Risk Heuristic
* **Circular Score Gauge (0–100)**: Visual resilience score with Low, Moderate, High, or Critical risk grading.
* **Transparent Formula Notes**: Explains the exact mathematical weights for each pillar.
* **Educational Disclaimer**: Explicitly identifies the score as an educational simulation tool rather than formal regulated financial advice.

---

## 💻 Step-by-Step Local Setup & Execution Guide

### Prerequisites
* **Node.js**: `v20.x` or `v24.x` (tested on Node `v24.12.0`)
* **npm**: `v10.x` or `v11.x` (tested on npm `11.6.2`)

### 1. Clone the Repository
```bash
git clone https://github.com/gunja-ramana/broke-but-functional.git
cd broke-but-functional
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Unit Test Suite
```bash
npm test
```
Executes the Vitest test suite (`16/16 unit tests passing`).

### 5. Run Linter
```bash
npm run lint
```
Executes Oxlint across all TypeScript files (`0 errors, 0 warnings`).

### 6. Build for Production
```bash
npm run build
```
Executes `tsc -b` (strict TypeScript compilation) followed by Vite production bundling.

### 7. Preview Production Build Locally
```bash
npm run preview
```
Serves the generated `dist/` directory locally to verify production assets and routing.

---

## 📁 Project Directory Structure

```text
broke-but-functional/
├── .github/                       # GitHub workflow and repo configurations
├── .oxlintrc.json                 # Oxlint linter rules configuration
├── dist/                          # Production build output
├── public/                        # Static assets (favicon.svg, icons.svg)
├── src/
│   ├── components/
│   │   ├── commitments/          # CommitmentsManager & CommitmentModal
│   │   ├── common/               # Button, Badge, Modal (focus-trapped), ConfirmModal
│   │   ├── dashboard/            # OverviewCards, DailyAllowanceCard, BudgetProgressBar, etc.
│   │   ├── forecast/             # ThirtyDayForecast (Recharts + Accessible Table)
│   │   ├── health/               # FinancialHealthView & 4-Pillar Breakdown
│   │   ├── layout/               # Header, Sidebar, MobileNav (responsive shell)
│   │   ├── savings/              # SavingsGoalsManager, GoalModal, ContributeModal
│   │   ├── simulator/            # DecisionSimulator & Survival Mode Trade-Offs
│   │   ├── transactions/         # TransactionList & TransactionModal
│   │   └── unexpected/           # UnexpectedExpenseFlow triage
│   ├── context/
│   │   ├── FinanceContext.tsx    # Central state provider & action handlers
│   │   ├── financeContextCore.ts # Context declaration & types
│   │   └── useFinance.ts         # Fast-refresh isolated hook
│   ├── types/
│   │   └── financial.ts          # Comprehensive TypeScript domain types
│   ├── utils/
│   │   ├── currency.ts           # Indian Rupee (₹) formatting & parsing
│   │   ├── financialEngine.ts    # Single source of truth: pure accounting engine
│   │   ├── financialEngine.test.ts # Vitest suite (16 comprehensive tests)
│   │   ├── sampleData.ts         # Deterministic Day 12 baseline scenario
│   │   └── storage.ts            # LocalStorage persistence with SSR/Node guards
│   ├── App.tsx                   # Main layout container & tab routing
│   ├── index.css                 # Tailwind directives, focus-visible, reduced-motion
│   └── main.tsx                  # Application entry point with React StrictMode
├── index.html                     # HTML5 shell with meta tags & theme-color
├── package.json                   # Verified scripts and dependencies
├── tailwind.config.js             # Theme tokens, font families, custom colors
├── tsconfig.json                  # TypeScript root configuration
├── tsconfig.app.json              # App compilation (strict verbatimModuleSyntax)
└── vite.config.ts                 # Rollup code-splitting chunks configuration
```

---

## 🔒 State Persistence & Data Integrity

1. **LocalStorage Schema**:
   * `bbf_transactions_v1`: Complete transaction ledger.
   * `bbf_commitments_v1`: Scheduled bills and subscriptions.
   * `bbf_savings_v1`: Ring-fenced savings goals and contribution histories.
   * `bbf_starting_budget_v1`: Base starting monthly budget (default ₹10,000).
   * `bbf_current_day_v1`: Current simulation day (default Day 12).
2. **Resilience & Fallback**:
   * Safe parsing prevents JSON corruption from crashing the application.
   * Malformed or missing data automatically triggers a clean restore to initial demo state.
   * SSR/Node environment guards ensure compatibility in headless testing environments.
3. **One-Click Demo Reset**:
   * Users can click "Reset Demo Data" in the sidebar at any time to restore the clean Day 12 baseline.

---

## ♿ Accessibility & Performance Compliance

* **WCAG 2.1 Focus Management**: `Modal.tsx` implements strict focus trapping (Tab / Shift+Tab cycling), auto-focus on the first interactive control, and focus restoration to the triggering element upon close.
* **Reduced Motion**: Full support for `prefers-reduced-motion` in CSS to disable animations for users with vestibular sensitivities.
* **Screen Reader Accessibility**: Form inputs have explicitly bound `id` and `<label htmlFor="...">` attributes; icon buttons have descriptive `aria-label` tags; Recharts area chart includes an accessible data table alternative.
* **Production Bundle Footprint**:
  * Application Core (`index.js`): **32.16 kB (gzip)**
  * Vendor Charts (`vendor-charts`): **107.21 kB (gzip)**
  * Vendor React (`vendor-react`): **64.96 kB (gzip)**
  * Stylesheet (`index.css`): **6.36 kB (gzip)**
  * Total Production Build Time: **752ms**

---

## ⚠️ Known Limitations & Design Boundaries

1. **Client-Side Scope**: In accordance with the prompt guidelines, no backend database or external authentication service is required; persistence is localized to browser storage.
2. **Single Currency Focus**: Built specifically for Indian Rupee (`₹`) numbering conventions (`lakhs` and `crores` in compact modes) for Gen Z users in India.
3. **30-Day Bounded Horizon**: The mathematical model is strictly calibrated for a 30-day month survival cycle with deterministic daily burn pacing.

---

## 📜 Competition License & Evaluation Disclosure

This project was built for the **PROMPT RUN 2026** web development competition. All financial calculations, components, and documentation are designed for educational decision modeling and budget resilience analysis.
