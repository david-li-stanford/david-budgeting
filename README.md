# David's Budget

A local-first personal budgeting app with data visualizations, forecasting, and income distribution. Runs entirely on your machine — no cloud, no login.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Charts | Recharts |
| Backend | json-server (flat JSON file) |
| Routing | React Router v6 |

## Getting Started

### Prerequisites

- Node.js 18+

### Install

```bash
npm install
cd client && npm install
```

### Run

```bash
# from the root
npm run dev
```

This starts both servers concurrently:

- **http://localhost:5173** — React app
- **http://localhost:3001** — json-server REST API

## Features

### Dashboard
- Total net worth across all accounts with a donut chart breakdown
- Monthly income input with per-account distribution (supports both % and fixed $ modes)
- Account overview cards with allocated income displayed

### Checking Accounts
- Create as many as you need via the sidebar
- Track monthly recurring expenses with categories and due dates
- Cash flow bar chart (income vs. expenses vs. surplus/deficit)
- Expense breakdown pie chart by category

### Investment Accounts
- Supports savings, brokerage, retirement, and CD account types
- Compound interest forecasting: 1, 5, 10, 20, and 30-year projections
- Interactive growth chart with scenario comparison (add alternate rates to compare)
- Allocated income from the global distribution shown per account

### Income Distribution
- Single global monthly income value
- Allocate to each account by percentage or fixed dollar amount
- Fixed allocations are deducted first; percent-mode accounts split the remainder
- Unallocated remainder shown in real time

## Data

All data lives in `db.json` at the project root. You can edit it directly in any text editor — json-server will hot-reload on save.

```
db.json
├── settings          — monthly income + distribution config
├── checkingAccounts  — checking account records
├── investmentAccounts — investment account records
├── expenses          — recurring expenses (linked to checking accounts by accountId)
└── forecastScenarios — comparison scenarios (linked to investment accounts by accountId)
```

## Project Structure

```
david-budgeting/
├── db.json
├── package.json
└── client/
    └── src/
        ├── api/client.js          — all fetch calls
        ├── hooks/                 — data hooks (useSettings, useAccounts, useExpenses, ...)
        ├── utils/
        │   ├── forecasting.js     — compound interest math (FV formula)
        │   └── distribution.js   — income allocation logic
        ├── components/
        │   ├── layout/            — AppShell, Sidebar
        │   ├── ui/                — Card, Button, Input, Modal, Badge, Spinner
        │   ├── charts/            — NetWorthDonut, CashFlowBar, ExpensePie, ForecastLine
        │   ├── dashboard/         — IncomeDistributionForm, MiniAccountCard
        │   ├── checking/          — ExpenseList, ExpenseForm
        │   └── investment/        — ForecastSection
        └── pages/
            ├── Dashboard.jsx
            ├── CheckingAccountPage.jsx
            └── InvestmentAccountPage.jsx
```

## Forecasting Math

Uses the Future Value of a series formula with monthly compounding:

```
FV = P × (1 + r)^n  +  PMT × [((1 + r)^n - 1) / r]

P   = current balance
r   = annual rate / 12  (monthly rate)
n   = years × 12        (total months)
PMT = monthly contribution
```
