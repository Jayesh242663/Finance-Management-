#  Finance & Student Management System

A premium, modern client-side administration dashboard designed for managing educational institutions, student fee receipts, accounts ledger, operational expenses, and financial analytics. 

Featuring a sleek, dark-themed **glassmorphism user interface**, this application offers state-of-the-art visual excellence, micro-animations, and full responsiveness.

---

##  Key Features

* ** Dashboard & Financial Analytics**: Real-time stats on total fees, collections, pending fees, and losses. Contains interactive Area Charts for revenue trends, Pie Charts for fee collection status, and horizontal Bar Charts for course distributions.
* ** Student Directory**: View student records, enrollment status (Active, Graduated, On Leave, Dropped Out), batch assignments, admission dates, and complete individual payment history.
* ** Fee Receipting & Payment Logging**: Log payments through Cash, UPI, Credit/Debit Card, Bank Transfer, or Cheque. Generates vector-accurate PDF receipts with custom terms, institution details, and automated digital signatures.
* ** Ledger & Audit Log**: A comprehensive double-entry chronological log of all transactions (receipts, placements, expense debits, adjustments) matching a physical ledger book theme.
* ** Expenses & Cash Withdrawals**: Log school expenditures, track cash-in-hand accounts, and verify bank balances across multiple accounts.
* ** Fully White-labeled**: Dynamically configured via global constants. No hardcoded names or branding details.
* ** Running Demo Banner**: Includes a constant running top marquee banner indicating the application's mock demonstration state.

---

## 🛠️ Technology Stack

* **Core**: [React 19](https://react.dev/) & [Vite 8](https://vite.dev/) (fast HMR, optimized production assets)
* **Routing**: [React Router DOM v7](https://reactrouter.com/)
* **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Grid, animations, dark theme tokens)
* **Data Visualization**: [Recharts](https://recharts.org/) (responsive vector charts)
* **Icons**: [Lucide React](https://lucide.dev/) (modern minimal outlines)
* **Form Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
* **PDF Engine**: [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)

---

##  Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/Jayesh242663/Finance-Management-.git
cd Finance-Management-

# Install npm packages
npm install
```

### Run Locally

Launch the Vite local development server:

```bash
npm run dev
```

The application will start running on [http://localhost:5173/](http://localhost:5173/).

### Build for Production

Compile production bundles into the `dist/` directory:

```bash
npm run build
```

Verify and preview the production build locally:

```bash
npm run preview
```

---

##  Project Structure

```text
├── public/                # Static assets (favicons, logos)
├── src/
│   ├── assets/            # Component-specific logo assets
│   ├── components/
│   │   ├── layout/        # Navbar, Sidebar, Layout structure
│   │   └── receipt/       # PDF printable template & modals
│   ├── context/           # AuthContext & StudentContext state
│   ├── data/              # Initial simulated database (demoData.json)
│   ├── pages/             # Page components (Dashboard, Fees, Expenses, etc.)
│   ├── services/          # Client-side PDF receipt generation
│   ├── utils/             # Helper formatters, charts, and constants
│   ├── App.jsx            # Routing and providers wrapper
│   ├── main.jsx           # App entrypoint
│   └── index.css          # Design system variables & base styles
├── index.html             # Document template
├── vite.config.js         # Build configuration
└── package.json           # Scripts and dependencies
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
