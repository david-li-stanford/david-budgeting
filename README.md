# David's Budget

A personal budgeting app with data visualizations, compound interest forecasting, and income distribution. Hosted on GitHub Pages with Supabase as the backend. Login-protected — personal access only.

**Live:** https://david-li-stanford.github.io/david-budgeting/

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | GitHub Pages |
| Routing | React Router v6 (HashRouter) |

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project with the schema set up (see below)

### Setup

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install
```

Create `client/.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Run

```bash
# from the root
npm run dev
```

Opens at **http://localhost:5173**. Sign in with your Supabase Auth credentials.

## Deployment

Pushes to `main` automatically deploy via GitHub Actions. The workflow builds the React app and deploys to GitHub Pages.

**Required GitHub secrets:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**GitHub Pages settings:** Source → GitHub Actions

## Features

### Dashboard
- Total net worth across all accounts with a donut chart breakdown
- **Recurring income** — set a deposit amount and schedule (1st of month, or 1st & 15th), configure per-account distribution, apply deposits manually
- **One-time deposits** — log ad-hoc income with custom distribution, full history table
- Account overview cards with allocated income per account

### Checking Accounts
- Create as many as you need via the sidebar
- Log expenses — each one deducts from the account balance immediately
- Delete an expense to restore the balance
- Monthly cash flow chart (income vs. expenses vs. surplus/deficit)
- Expense breakdown pie chart by category
- Monthly history chart — toggle between monthly spending and monthly surplus

### Investment Accounts
- Supports savings, brokerage, retirement, and CD account types
- Set annual return rate and monthly contribution
- Compound interest forecasting: 1, 5, 10, 20, and 30-year projections
- Interactive growth chart with scenario comparison (add alternate rates)
- Allocated income from the global distribution shown per account

### Income Distribution
- Allocate recurring income to each account by percentage or fixed dollar amount
- Fixed allocations are deducted first; percent-mode accounts split the remainder
- Unallocated remainder shown in real time
- One-time deposits support their own custom distribution per deposit

## Database Schema

Hosted on Supabase. All tables have RLS enabled — authenticated users only.

```
settings          — singleton: monthly income, schedule, distribution config
checkingAccounts  — checking account records
investmentAccounts — investment account records
expenses          — expense history (linked to checking accounts by accountId)
forecastScenarios — comparison scenarios (linked to investment accounts by accountId)
depositHistory    — log of all recurring and one-time deposits
```

## Project Structure

```
david-budgeting/
├── .github/workflows/deploy.yml  — GitHub Actions deploy pipeline
├── package.json                  — root dev scripts
└── client/
    └── src/
        ├── lib/supabase.js        — Supabase client instance
        ├── api/client.js          — all database calls
        ├── hooks/                 — useSettings, useAccounts, useExpenses,
        │                            useForecastScenarios, useDepositHistory, useAuth
        ├── utils/
        │   ├── forecasting.js     — compound interest math (FV formula)
        │   └── distribution.js    — income allocation logic
        ├── components/
        │   ├── layout/            — AppShell, Sidebar
        │   ├── ui/                — Card, Button, Input, Modal, Badge, Spinner
        │   ├── charts/            — NetWorthDonut, CashFlowBar, ExpensePie, ForecastLine
        │   ├── dashboard/         — RecurringIncomeCard, OneTimeDepositSection, MiniAccountCard
        │   ├── checking/          — ExpenseList, ExpenseForm, MonthlyHistoryCard
        │   └── investment/        — ForecastSection
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── CheckingAccountPage.jsx
            └── InvestmentAccountPage.jsx
```

## Forecasting Math

Future Value of a series with monthly compounding:

```
FV = P × (1 + r)^n  +  PMT × [((1 + r)^n - 1) / r]

P   = current balance
r   = annual rate / 12  (monthly rate)
n   = years × 12        (total months)
PMT = monthly contribution
```
