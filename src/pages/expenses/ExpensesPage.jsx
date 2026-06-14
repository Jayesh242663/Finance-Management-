import { useState, useMemo } from 'react';
import {
  Plus,
  TrendingDown,
  TrendingUp,
  BarChart3,
  PiggyBank,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import MeasuredResponsiveContainer from '../../components/ui/MeasuredResponsiveContainer';
import ExpenseForm from './ExpenseForm';
import ExpensesTable from './ExpensesTable';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Expenses.css';

const mapExpenseFromSupabase = (expense) => ({
  id: expense.id,
  name: expense.name,
  date: expense.date,
  amount: expense.amount,
  paymentMethod: expense.payment_method || expense.paymentMethod,
  bankMoneyReceived: expense.bank_money_received || expense.bankMoneyReceived,
  chequeNumber: expense.cheque_number || expense.chequeNumber,
  transactionType: expense.transaction_type || expense.transactionType,
  remarks: expense.remarks,
  isSelfTransaction: expense.is_self_transaction !== undefined ? expense.is_self_transaction : expense.isSelfTransaction,
  batchId: expense.batch_id || expense.batchId,
  createdAt: expense.created_at || expense.createdAt,
  updatedAt: expense.updated_at || expense.updatedAt,
});

const getCalendarDays = (year, month) => {
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Previous month trailing days
  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  const trailingDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    trailingDays.push({
      day: prevMonthTotalDays - i,
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false
    });
  }

  // Current month days
  const currentDays = [];
  for (let i = 1; i <= totalDays; i++) {
    currentDays.push({
      day: i,
      month,
      year,
      isCurrentMonth: true
    });
  }

  // Next month leading days (fill grid to dynamic weeks total)
  const currentTotal = trailingDays.length + currentDays.length;
  const targetTotal = Math.ceil(currentTotal / 7) * 7;
  const remainingCells = targetTotal - currentTotal;
  const leadingDays = [];
  for (let i = 1; i <= remainingCells; i++) {
    leadingDays.push({
      day: i,
      month: month === 11 ? 0 : month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false
    });
  }

  return [...trailingDays, ...currentDays, ...leadingDays];
};

const ExpensesPage = () => {
  const { expenses, deleteExpense, payments, placements } = useStudents();
const { user } = useAuth();
const [showForm, setShowForm] = useState(false);
const [selectedExpense, setSelectedExpense] = useState(null);
const [loading, setLoading] = useState(false);

// Withdrawals Dashboard States
const [showWithdrawalsDashboard, setShowWithdrawalsDashboard] = useState(false);
const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
const [selectedDate, setSelectedDate] = useState(null);

const isAuditor = user?.role === 'auditor';

// Use all expenses (no batch filtering) to show every transaction
const allExpenses = useMemo(() => {
  return (expenses || []).map(mapExpenseFromSupabase);
}, [expenses]);

// Calculate statistics
const stats = useMemo(() => {
  const debitExpenses = allExpenses.filter((exp) => exp.transactionType === 'debit');
  const creditExpenses = allExpenses.filter((exp) => exp.transactionType === 'credit');

  const totalDebit = debitExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalCredit = creditExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Sum of student payments
  const studentPaymentsTotal = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

  // Sum of placement payments
  const placementInstallments = (placements || []).flatMap((p) => p.installments || []);
  const placementPaymentsTotal = placementInstallments.reduce((sum, inst) => sum + (inst.amount || 0), 0);

  // Business Income = credit transactions + student payments + placement installments
  const businessIncome = totalCredit + studentPaymentsTotal + placementPaymentsTotal;

  // Business Expenses = Debit transactions (money going out)
  const businessExpenses = totalDebit;

  // Business Profit = Income - Expenses
  const businessProfit = businessIncome - businessExpenses;

  // Owner Withdrawals = Debit transactions from self/owner transactions
  const ownerWithdrawals = debitExpenses
    .filter((exp) => exp.isSelfTransaction)
    .reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate breakdown by withdrawal method
  const cashWithdrawals = debitExpenses
    .filter((exp) => exp.isSelfTransaction && exp.paymentMethod === 'cash')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const bankWithdrawals = debitExpenses
    .filter((exp) => exp.isSelfTransaction && exp.paymentMethod !== 'cash')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const ownerBreakdown = {
    cash: cashWithdrawals,
    bank: bankWithdrawals
  };

  // Cash Credits: credit expenses + cash student payments + cash placement installments
  const cashStudentCredits = (payments || [])
    .filter((p) => p.paymentMethod === 'cash')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const cashPlacementCredits = placementInstallments
    .filter((inst) => inst.method === 'cash')
    .reduce((sum, inst) => sum + (inst.amount || 0), 0);
  const cashExpenseCredits = creditExpenses
    .filter((exp) => exp.paymentMethod === 'cash')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const cashCredits = cashStudentCredits + cashPlacementCredits + cashExpenseCredits;

  // Cash Debits: cash debit expenses
  const cashDebits = debitExpenses
    .filter((exp) => exp.paymentMethod === 'cash')
    .reduce((sum, exp) => sum + exp.amount, 0);

  // Cash in Hand
  const cashInHand = cashCredits - cashDebits;

  // Bank Credits: all non-cash student payments + non-cash placement installments + non-cash credit expenses
  const bankStudentCredits = (payments || [])
    .filter((p) => p.paymentMethod !== 'cash')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const bankPlacementCredits = placementInstallments
    .filter((inst) => inst.method !== 'cash')
    .reduce((sum, inst) => sum + (inst.amount || 0), 0);
  const bankExpenseCredits = creditExpenses
    .filter((exp) => exp.paymentMethod !== 'cash')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const bankCredits = bankStudentCredits + bankPlacementCredits + bankExpenseCredits;

  // Bank Debits: non-cash debit expenses
  const bankDebits = debitExpenses
    .filter((exp) => exp.paymentMethod !== 'cash')
    .reduce((sum, exp) => sum + exp.amount, 0);

  // Bank Balance
  const bankBalance = bankCredits - bankDebits;

  const netAmount = businessIncome - businessExpenses;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyDebits = allExpenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear && exp.transactionType === 'debit';
  });
  const monthlyCredits = allExpenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear && exp.transactionType === 'credit';
  });
  const monthlyDebitTotal = monthlyDebits.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyCreditTotal = monthlyCredits.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyTotal = monthlyDebitTotal - monthlyCreditTotal;

  return {
    totalDebit,
    totalCredit,
    netAmount,
    monthlyTotal,
    transactionCount: allExpenses.length,
    businessIncome,
    businessExpenses,
    businessProfit,
    ownerWithdrawals,
    ownerBreakdown,
    cashInHand,
    bankBalance,
  };
}, [allExpenses, payments, placements]);

const calendarDays = useMemo(() => getCalendarDays(calendarYear, calendarMonth), [calendarYear, calendarMonth]);

const handleMonthChange = (direction) => {
  let newMonth = calendarMonth + direction;
  let newYear = calendarYear;
  if (newMonth < 0) {
    newMonth = 11;
    newYear -= 1;
  } else if (newMonth > 11) {
    newMonth = 0;
    newYear += 1;
  }
  setCalendarMonth(newMonth);
  setCalendarYear(newYear);
  setSelectedDate(null);
};

const handleSelectedDateChange = (daysOffset) => {
  if (!selectedDate) return;
  const currentDate = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
  currentDate.setDate(currentDate.getDate() + daysOffset);

  const newYear = currentDate.getFullYear();
  const newMonth = currentDate.getMonth();
  const newDay = currentDate.getDate();

  if (newMonth !== calendarMonth || newYear !== calendarYear) {
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  }

  setSelectedDate({
    year: newYear,
    month: newMonth,
    day: newDay
  });
};

const lineGraphData = useMemo(() => {
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const data = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const cashAmt = allExpenses
      .filter((exp) => {
        if (!exp.isSelfTransaction || exp.transactionType !== 'debit' || exp.paymentMethod !== 'cash') return false;
        const expDate = new Date(exp.date);
        return expDate.getFullYear() === calendarYear && expDate.getMonth() === calendarMonth && expDate.getDate() === day;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    const bankAmt = allExpenses
      .filter((exp) => {
        if (!exp.isSelfTransaction || exp.transactionType !== 'debit' || exp.paymentMethod === 'cash') return false;
        const expDate = new Date(exp.date);
        return expDate.getFullYear() === calendarYear && expDate.getMonth() === calendarMonth && expDate.getDate() === day;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    data.push({
      day: day,
      dateStr: `${day} ${new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'short' })}`,
      Cash: cashAmt,
      Bank: bankAmt,
      Total: cashAmt + bankAmt,
    });
  }
  return data;
}, [allExpenses, calendarMonth, calendarYear]);

const selectedWithdrawals = useMemo(() => {
  return allExpenses.filter((exp) => {
    if (!exp.isSelfTransaction || exp.transactionType !== 'debit') return false;
    const expDate = new Date(exp.date);

    if (selectedDate) {
      return (
        expDate.getFullYear() === selectedDate.year &&
        expDate.getMonth() === selectedDate.month &&
        expDate.getDate() === selectedDate.day
      );
    } else {
      return (
        expDate.getFullYear() === calendarYear &&
        expDate.getMonth() === calendarMonth
      );
    }
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}, [allExpenses, selectedDate, calendarMonth, calendarYear]);

const handleEdit = (expense) => {
  setSelectedExpense(expense);
  setShowForm(true);
};

const handleDelete = (expenseId) => {
  if (window.confirm('Are you sure you want to delete this expense?')) {
    deleteExpense(expenseId);
  }
};

const handleFormClose = () => {
  setShowForm(false);
  setSelectedExpense(null);
};

const handleSubmitSuccess = () => {
  setShowForm(false);
  setSelectedExpense(null);
};

return (
  <div className="expenses-page">
    {/* Page Header */}
    <div className="expenses-page-header">
      <div className="expenses-header-content">
        <h1 className="expenses-page-title">Expenses Management</h1>
        <p className="expenses-page-subtitle">
          Track and manage all business transactions and personal expenses
        </p>
      </div>
      {!isAuditor && (
        <button
          onClick={() => {
            setSelectedExpense(null);
            setShowForm(true);
          }}
          className="expenses-btn-add"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      )}
    </div>

    {!showWithdrawalsDashboard && (
      <>
        {/* Stats Cards - Row 1: Business Metrics */}
        <div className="expenses-stats-section">
          <h3 className="expenses-stats-section-title">Business Overview</h3>
          <div className="expenses-stats-grid">
            {/* Business Income */}
            <div className="expenses-stat-card">
              <div className="expenses-stat-content">
                <div className="expenses-stat-icon green">
                  <TrendingUp />
                </div>
                <div>
                  <p className="expenses-stat-label">Business Income</p>
                  <p className="expenses-stat-value green">{formatCurrency(stats.businessIncome)}</p>
                </div>
              </div>
            </div>

            {/* Business Expenses */}
            <div className="expenses-stat-card">
              <div className="expenses-stat-content">
                <div className="expenses-stat-icon red">
                  <TrendingDown />
                </div>
                <div>
                  <p className="expenses-stat-label">Business Expenses</p>
                  <p className="expenses-stat-value red">{formatCurrency(stats.businessExpenses)}</p>
                </div>
              </div>
            </div>

            {/* Business Profit */}
            <div className="expenses-stat-card">
              <div className="expenses-stat-content">
                <div className={`expenses-stat-icon ${stats.businessProfit >= 0 ? 'green' : 'red'}`}>
                  <BarChart3 />
                </div>
                <div>
                  <p className="expenses-stat-label">Business Profit</p>
                  <p className={`expenses-stat-value ${stats.businessProfit >= 0 ? 'green' : 'red'}`}>
                    {formatCurrency(stats.businessProfit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Row 2: Owner & Bank Metrics */}
        <div className="expenses-stats-section">
          <h3 className="expenses-stats-section-title">Cash Management</h3>
          <div className="expenses-stats-grid">
            {/* Owner Withdrawals */}
            <div
              className={`expenses-stat-card expenses-stat-card-tooltip clickable ${showWithdrawalsDashboard ? 'active' : ''}`}
              onClick={() => setShowWithdrawalsDashboard(!showWithdrawalsDashboard)}
              style={{ cursor: 'pointer' }}
            >
              <div className="expenses-stat-content">
                <div className="expenses-stat-icon blue">
                  <Wallet />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="expenses-stat-label">Owner Withdrawals</p>
                  <p className="expenses-stat-value blue">{formatCurrency(stats.ownerWithdrawals)}</p>
                </div>
                <div className="expenses-stat-indicator">
                  {showWithdrawalsDashboard ? (
                    <ChevronUp className="w-4 h-4 text-blue-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-blue-400" />
                  )}
                </div>
              </div>
              {/* Tooltip */}
              <div className="expenses-stat-tooltip">
                <div className="expenses-tooltip-header">Withdrawals Breakdown</div>
                <div className="expenses-tooltip-row">
                  <span className="expenses-tooltip-label">Cash Withdrawals:</span>
                  <span className="expenses-tooltip-value">{formatCurrency(stats.ownerBreakdown.cash)}</span>
                </div>
                <div className="expenses-tooltip-row">
                  <span className="expenses-tooltip-label">Bank Withdrawals:</span>
                  <span className="expenses-tooltip-value">{formatCurrency(stats.ownerBreakdown.bank)}</span>
                </div>
                <div className="expenses-tooltip-footer" style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                  Click card to toggle calendar & graph insights
                </div>
              </div>
            </div>

            {/* Cash in Hand */}
            <div className="expenses-stat-card">
              <div className="expenses-stat-content">
                <div className={`expenses-stat-icon ${stats.cashInHand >= 0 ? 'green' : 'red'}`}>
                  <Wallet />
                </div>
                <div>
                  <p className="expenses-stat-label">Cash in Hand</p>
                  <p className={`expenses-stat-value ${stats.cashInHand >= 0 ? 'green' : 'red'}`}>
                    {formatCurrency(stats.cashInHand)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Balance */}
            <div className="expenses-stat-card">
              <div className="expenses-stat-content">
                <div className={`expenses-stat-icon ${stats.bankBalance >= 0 ? 'green' : 'red'}`}>
                  <PiggyBank />
                </div>
                <div>
                  <p className="expenses-stat-label">Bank Balance</p>
                  <p className={`expenses-stat-value ${stats.bankBalance >= 0 ? 'green' : 'red'}`}>
                    {formatCurrency(stats.bankBalance)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )}

    {/* Owner Withdrawals Dashboard Section */}
    {showWithdrawalsDashboard && (
      <div className="expenses-withdrawals-dashboard-section">
        <div className="expenses-dashboard-header">
          <div className="expenses-dashboard-header-left">
            <h3 className="expenses-dashboard-title">Owner Withdrawals Insights</h3>
            <p className="expenses-dashboard-subtitle">
              Calendar and Trend Analysis for Personal Withdrawals
            </p>
          </div>
          <div className="expenses-dashboard-header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="expenses-dashboard-controls">
              <button
                type="button"
                className="dashboard-nav-btn"
                onClick={() => handleMonthChange(-1)}
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="dashboard-current-month">
                {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                type="button"
                className="dashboard-nav-btn"
                onClick={() => handleMonthChange(1)}
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              type="button"
              className="dashboard-close-btn"
              onClick={() => {
                setShowWithdrawalsDashboard(false);
                setSelectedDate(null);
              }}
            >
              <ChevronLeft />

            </button>
          </div>
        </div>

        <div className="expenses-dashboard-grid">
          {/* Calendar Card */}
          <div className="dashboard-card calendar-card">
            <div className="calendar-header-row">
              <h4 className="calendar-title">Withdrawal Calendar</h4>
              <div className="calendar-legend">
                <div className="legend-item">
                  <span className="legend-dot sushant"></span>
                  <span className="legend-text">Cash</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot priti"></span>
                  <span className="legend-text">Bank/UPI</span>
                </div>
              </div>
            </div>

            <div className="calendar-grid">
              {/* Weekday headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="calendar-day-header">{d}</div>
              ))}

              {/* Days of month grid */}
              {calendarDays.map((dateObj, idx) => {
                const dayWithdrawals = allExpenses.filter((exp) => {
                  if (!exp.isSelfTransaction || exp.transactionType !== 'debit') return false;
                  const expDate = new Date(exp.date);
                  return (
                    expDate.getFullYear() === dateObj.year &&
                    expDate.getMonth() === dateObj.month &&
                    expDate.getDate() === dateObj.day
                  );
                });

                const hasCash = dayWithdrawals.some(exp => exp.paymentMethod === 'cash');
                const hasBank = dayWithdrawals.some(exp => exp.paymentMethod !== 'cash');

                const isSelected = selectedDate &&
                  selectedDate.year === dateObj.year &&
                  selectedDate.month === dateObj.month &&
                  selectedDate.day === dateObj.day;

                return (
                  <div
                    key={idx}
                    className={`calendar-day-cell ${!dateObj.isCurrentMonth ? 'outside' : ''} ${isSelected ? 'selected' : ''} ${dayWithdrawals.length > 0 ? 'has-withdrawals' : ''}`}
                    onClick={() => dayWithdrawals.length > 0 && setSelectedDate(isSelected ? null : dateObj)}
                    title={dayWithdrawals.length > 0 ? `${dayWithdrawals.length} withdrawal(s). Click to view details.` : 'No withdrawals'}
                  >
                    <span className="day-number">{dateObj.day}</span>
                    <div className="day-dots">
                      {hasCash && <span className="dot sushant" title="Cash Withdrawal"></span>}
                      {hasBank && <span className="dot priti" title="Bank/UPI Withdrawal"></span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Line Graph Card */}
          <div className="dashboard-card graph-card">
            <div className="graph-header-row">
              <div>
                <h4 className="graph-title">Withdrawal Daily Trends</h4>
                <span className="graph-subtitle">Daily withdrawal amounts for the selected month</span>
              </div>
            </div>
            <div className="graph-container-wrapper">
              <MeasuredResponsiveContainer minHeight={200}>
                <LineChart data={lineGraphData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis
                    dataKey="day"
                    stroke="rgba(255, 255, 255, 0.4)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <YAxis
                    stroke="rgba(255, 255, 255, 0.4)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    tickFormatter={(value) => value >= 1000 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141414',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(value, name) => [formatCurrency(value), name]}
                    labelFormatter={(label) => `Day ${label} of ${new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long' })}`}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}
                  />
                  <Line
                    name="Cash Withdrawals"
                    type="monotone"
                    dataKey="Cash"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    dot={{ r: 2, strokeWidth: 0, fill: '#3b82f6' }}
                  />
                  <Line
                    name="Bank/UPI Withdrawals"
                    type="monotone"
                    dataKey="Bank"
                    stroke="#a78bfa"
                    strokeWidth={2.5}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    dot={{ r: 2, strokeWidth: 0, fill: '#a78bfa' }}
                  />
                </LineChart>
              </MeasuredResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Withdrawals Modal Overlay */}
        {selectedDate && (
          <div className="dashboard-details-overlay" onClick={() => setSelectedDate(null)}>
            <div className="dashboard-details-modal" onClick={(e) => e.stopPropagation()}>
              <div className="details-header-row">
                <div className="details-header-left-nav">
                  <button
                    type="button"
                    className="details-nav-day-btn"
                    onClick={() => handleSelectedDateChange(-1)}
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h4 className="details-title">
                    Withdrawals on {new Date(selectedDate.year, selectedDate.month, selectedDate.day).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </h4>
                  <button
                    type="button"
                    className="details-nav-day-btn"
                    onClick={() => handleSelectedDateChange(1)}
                    title="Next Day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  className="details-close-btn"
                  onClick={() => setSelectedDate(null)}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="details-content">
                {selectedWithdrawals.length === 0 ? (
                  <div className="no-withdrawals-wrapper">
                    <p className="no-withdrawals-text">No withdrawals recorded for this date.</p>
                  </div>
                ) : (
                  <div className="dashboard-withdrawals-list">
                    {selectedWithdrawals.map((exp) => {
                      const isCash = exp.paymentMethod === 'cash';
                      return (
                        <div key={exp.id} className="dashboard-withdrawal-item">
                          <div className="item-left">
                            <div className={`item-avatar ${isCash ? 'sushant' : 'priti'}`}>
                              {isCash ? 'C' : 'B'}
                            </div>
                            <div className="item-info">
                              <p className="item-name">
                                {isCash ? 'Cash Withdrawal' : 'Bank/UPI Withdrawal'}
                              </p>
                              <p className="item-remarks">{exp.remarks || 'No remarks provided'}</p>
                              <p className="item-meta">{formatDate(exp.date)} • {exp.paymentMethod.toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="item-right">
                            <span className="item-amount">{formatCurrency(exp.amount)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Transactions Table */}
    <div className="expenses-section">
      <div className="expenses-section-header">
        <h2 className="expenses-section-title">Transaction History</h2>
      </div>
      <ExpensesTable
        expenses={allExpenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        isAuditor={isAuditor}
      />
    </div>

    {/* Expense Form Modal */}
    {showForm && !isAuditor && (
      <ExpenseForm
        onClose={handleFormClose}
        expense={selectedExpense}
        onSubmitSuccess={handleSubmitSuccess}
      />
    )}
  </div>
);
};

export default ExpensesPage;
