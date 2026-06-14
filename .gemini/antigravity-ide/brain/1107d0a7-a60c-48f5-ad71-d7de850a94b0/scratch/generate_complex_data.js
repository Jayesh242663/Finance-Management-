const fs = require('fs');
const path = require('path');

const contextPath = 'c:\\Users\\Jayesh Channe\\Downloads\\Sarathi Demo\\sarathi_demo\\src\\context\\StudentContext.jsx';

// Deterministic pseudo-random helper to make data generation reproducible
let seed = 42;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function randomRange(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

const cashRemarks = [
  "Office petty cash replenishment",
  "Cash for office snacks & refreshments",
  "Vendor cash payment for local repair",
  "Petty cash for courier & local travel",
  "Emergency office supplies cash payment",
  "Miscellaneous cash draw",
  "Cash advance for weekend team event",
  "Cash for stationery supplies",
  "Pooja ceremony cash expenses"
];

const upiRemarks = [
  "Fuel charge via UPI",
  "Dinner with client (UPI)",
  "Hardware store payment (UPI)",
  "Broadband refill via GPay",
  "Mobile recharge company phone",
  "Water dispenser refill payment",
  "Office desk plants purchase",
  "Team evening snacks (UPI)"
];

const bankRemarks = [
  "Director personal draw",
  "Personal reimbursement payout",
  "Owner monthly draw transfer",
  "Online printer maintenance pay"
];

const bankAccounts = ["hdfc_sss", "hdfc_1_shmt", "india_overseas"];

const batches = [
  { id: "b2024-25", startYear: 2024, endYear: 2025 },
  { id: "b2025-26", startYear: 2025, endYear: 2026 },
  { id: "b2026-27", startYear: 2026, endYear: 2027 }
];

const expenses = [];
let expCount = 1;
let selfCount = 1;

batches.forEach((batch) => {
  const { id: batchId, startYear, endYear } = batch;
  
  // 12 months: July of startYear to June of endYear
  for (let m = 0; m < 12; m++) {
    const monthIndex = (6 + m) % 12; // July is index 6
    const year = monthIndex >= 6 ? startYear : endYear;
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    
    // 1. Office Rent
    const rentId = `exp_rent_${String(year).slice(-2)}_${monthStr}`;
    expenses.push({
      id: rentId,
      name: "Office Rent",
      date: `${year}-${monthStr}-01`,
      amount: 25000,
      paymentMethod: "bank_transfer",
      bankMoneyReceived: "hdfc_1_shmt",
      chequeNumber: "",
      transactionType: "debit",
      category: "Rent",
      remarks: "Rent",
      isSelfTransaction: false,
      batchId,
      createdAt: `${year}-${monthStr}-01T10:00:00Z`,
      updatedAt: `${year}-${monthStr}-01T10:00:00Z`
    });
    
    // 2. Utilities
    const utilId = `exp_util_${String(year).slice(-2)}_${monthStr}`;
    const utilAmount = 8000 + randomRange(500, 2000);
    expenses.push({
      id: utilId,
      name: "Electricity & Internet",
      date: `${year}-${monthStr}-10`,
      amount: utilAmount,
      paymentMethod: "upi",
      bankMoneyReceived: "hdfc_sss",
      chequeNumber: "",
      transactionType: "debit",
      category: "Utilities",
      remarks: "Utilities",
      isSelfTransaction: false,
      batchId,
      createdAt: `${year}-${monthStr}-10T12:00:00Z`,
      updatedAt: `${year}-${monthStr}-10T12:00:00Z`
    });

    // 3. Owner Withdrawals (2 to 4 per month)
    const withdrawalsCount = randomRange(2, 4);
    const usedDays = new Set([1, 10]); // avoid rent/utilities days
    
    for (let w = 0; w < withdrawalsCount; w++) {
      let day;
      do {
        day = randomRange(3, 28);
      } while (usedDays.has(day));
      usedDays.add(day);
      
      const dayStr = String(day).padStart(2, '0');
      const date = `${year}-${monthStr}-${dayStr}`;
      
      const methodIndex = randomRange(0, 2);
      let paymentMethod, bankMoneyReceived, remarks, amount;
      
      if (methodIndex === 0) {
        // Cash
        paymentMethod = "cash";
        bankMoneyReceived = "";
        remarks = cashRemarks[randomRange(0, cashRemarks.length - 1)];
        amount = randomRange(4, 12) * 1000; // 4000 to 12000
      } else if (methodIndex === 1) {
        // UPI
        paymentMethod = "upi";
        bankMoneyReceived = "hdfc_sss";
        remarks = upiRemarks[randomRange(0, upiRemarks.length - 1)];
        amount = randomRange(5, 15) * 1000; // 5000 to 15000
      } else {
        // Bank transfer
        paymentMethod = "bank_transfer";
        bankMoneyReceived = bankAccounts[randomRange(0, bankAccounts.length - 1)];
        remarks = bankRemarks[randomRange(0, bankRemarks.length - 1)];
        amount = randomRange(10, 30) * 1000; // 10000 to 30000
      }
      
      const selfId = `exp_self_${String(selfCount++).padStart(3, '0')}`;
      expenses.push({
        id: selfId,
        name: "personal",
        date,
        amount,
        paymentMethod,
        bankMoneyReceived,
        chequeNumber: "",
        transactionType: "debit",
        category: "Self",
        remarks,
        isSelfTransaction: true,
        batchId,
        createdAt: `${date}T12:00:00Z`,
        updatedAt: `${date}T12:00:00Z`
      });
    }
  }
});

// Sort all expenses by date ascending to keep the array ordered
expenses.sort((a, b) => new Date(a.date) - new Date(b.date));

// Format as a JavaScript array string
const expensesArrayString = JSON.stringify(expenses, null, 2);

// Read the StudentContext.jsx file
let contextContent = fs.readFileSync(contextPath, 'utf8');

// Find and replace the DEFAULT_EXPENSES definition
const startIdx = contextContent.indexOf('const DEFAULT_EXPENSES = [');
const endIdx = contextContent.indexOf('];', startIdx) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  const newExpensesDeclaration = `const DEFAULT_EXPENSES = ${expensesArrayString};`;
  const updatedContent = contextContent.slice(0, startIdx) + newExpensesDeclaration + contextContent.slice(endIdx);
  fs.writeFileSync(contextPath, updatedContent, 'utf8');
  console.log(`Successfully updated DEFAULT_EXPENSES with ${expenses.length} highly complex and varied transactions.`);
} else {
  console.error("Could not find DEFAULT_EXPENSES declaration in StudentContext.jsx");
}
