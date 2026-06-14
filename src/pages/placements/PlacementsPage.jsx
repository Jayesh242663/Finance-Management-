import { useMemo, useState, Fragment } from 'react';
import { Briefcase, Globe2, IndianRupee, TrendingUp, ChevronDown, Plus, DollarSign, Calendar, CreditCard, MessageSquare, MapPin, Building2, X, Edit2, Save, Search, Filter, Banknote, Trash2, CheckCircle2 } from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getInitials, formatNumberWithCommas } from '../../utils/formatters';
import { COURSES } from '../../utils/constants';
import { COUNTRIES, getCountryData, getCountryCode } from '../../utils/countries';
import hdfcBankLogo from '../../assets/hdfc-bank-logo.png';
import indiaOverseasBankLogo from '../../assets/india-overseas-bank-logo.png';
import './PlacementsPage.css';

const PlacementsPage = () => {
  const { getPlacementsByBatch, students, currentBatch, addPlacementInstallment, addCompanyPayment, updatePlacementInstallment, deletePlacementInstallment, updatePlacementCosts } = useStudents();
  const { canEdit } = useAuth();
  const placements = getPlacementsByBatch();
  const [expandedId, setExpandedId] = useState(null);
  const [formState, setFormState] = useState({});
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [editingInstallmentId, setEditingInstallmentId] = useState(null);
  const [installmentEditForm, setInstallmentEditForm] = useState(null);
  const [savingInstallment, setSavingInstallment] = useState(false);
  const [deletingInstallment, setDeletingInstallment] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSucceeded, setDeleteSucceeded] = useState(false);
  const [editingCosts, setEditingCosts] = useState(null);
  const [costForm, setCostForm] = useState({ country: '', companyCosting: '', myCosting: '' });
  const [recentCountry, setRecentCountry] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('regular'); // 'regular' or 'company-payment'

  const formatPreview = (val) => {
    const raw = (val ?? '').toString().replace(/,/g, '').trim();
    return raw ? formatNumberWithCommas(raw) : '';
  };

  const hdfcAccountLastFourRaw =
    import.meta.env.VITE_demo_HDFC_BANK_ACCOUNT_NUMBER_LAST_FOUR ||
    import.meta.env.VITE_HDFC_BANK_ACCOUNT_NUMBER_LAST_FOUR ||
    '8512';
  const hdfcAccountLastFour = hdfcAccountLastFourRaw.toString().slice(-4).padStart(4, '0');
  const hdfcBankLabel = `HDFC (A/C ••••${hdfcAccountLastFour})`;
  const hdfc1BankLabel = 'HDFC-1 (A/C ••••0781)';
  const indiaOverseasBankLabel = 'India Overseas (A/C ••••0377)';

  const placementBankMetaMap = {
    hdfc: { label: hdfcBankLabel, logo: hdfcBankLogo, logoAlt: 'HDFC Bank logo' },
    tgsb: { label: hdfcBankLabel, logo: hdfcBankLogo, logoAlt: 'HDFC Bank logo' },
    hdfc_1_dsmt: { label: hdfc1BankLabel, logo: hdfcBankLogo, logoAlt: 'HDFC Bank logo' },
    hdfc_sss: { label: 'HDFC (SSS)', logo: hdfcBankLogo, logoAlt: 'HDFC Bank logo' },
    india_overseas: { label: indiaOverseasBankLabel, logo: indiaOverseasBankLogo, logoAlt: 'India Overseas Bank logo' },
  };

  const PLACEMENT_BANKS = [{ value: 'hdfc', label: hdfcBankLabel }];
  const getPlacementBankMeta = (value) => {
    if (placementBankMetaMap[value]) return placementBankMetaMap[value];

    return {
      label: getPlacementBankLabel(value),
      logo: hdfcBankLogo,
      logoAlt: 'Bank logo',
    };
  };
  const getPlacementBankLabel = (value) => {
    const label = PLACEMENT_BANKS.find((b) => b.value === value)?.label;
    if (label) return label;
    const legacy = {
      tgsb: hdfcBankLabel,
      hdfc_1_dsmt: hdfc1BankLabel,
      india_overseas: indiaOverseasBankLabel,
      hdfc_sss: 'HDFC (SSS)',
    };
    return legacy[value] || 'N/A';
  };

  const renderBankSelect = (value, onChange) => {
    const selectedBank = getPlacementBankMeta(value);

    return (
      <div className="bank-select-wrapper">
        <div className="bank-select-display" aria-hidden="true">
          {selectedBank.logo && (
            <span className="bank-select-logo-shell">
              <img src={selectedBank.logo} alt={selectedBank.logoAlt} className="bank-select-logo" />
            </span>
          )}
          <span className="bank-select-name">{selectedBank.label}</span>
        </div>
        <select
          value={value}
          onChange={onChange}
          className="bank-select"
          aria-label="Bank Account"
        >
          {PLACEMENT_BANKS.map((bank) => (
            <option key={bank.value} value={bank.value}>
              {bank.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Get unique countries for filter
  const uniqueCountries = useMemo(() => {
    const countries = placements
      .map(p => p.country)
      .filter(c => c && c.trim())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
    return countries;
  }, [placements]);

  // Sort countries with recently used at the top
  const sortedCountries = useMemo(() => {
    if (!recentCountry) return COUNTRIES;

    const recentCountryData = COUNTRIES.find(c => c.name === recentCountry);
    if (!recentCountryData) return COUNTRIES;

    return [
      recentCountryData,
      ...COUNTRIES.filter(c => c.name !== recentCountry)
    ];
  }, [recentCountry]);

  const placementsWithStudent = useMemo(() => {
    const allPlacements = placements.map((placement) => {
      const student = students.find((s) => s.id === placement.studentId);

      // Only count my_costing installments for totalPaid (not company payments)
      const myCostingInstallments = (placement.installments || []).filter(
        (inst) => !inst.installmentType || inst.installmentType === 'my_costing'
      );
      const companyCostingInstallments = (placement.installments || []).filter(
        (inst) => inst.installmentType === 'company_costing'
      );

      // Sort myCostingInstallments chronologically to find the first one
      const sortedMyInstallments = [...myCostingInstallments].sort(
        (a, b) => new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0)
      );
      // Find advance installment: explicitly marked as advance
      const hasPaidAdvance = sortedMyInstallments.some(inst => inst.isAdvance);
      const advanceInstallment = hasPaidAdvance ? sortedMyInstallments.find(inst => inst.isAdvance) : null;

      const advancePaymentAmount = placement.advancePayment !== undefined ? placement.advancePayment : 15000;
      const effectiveAdvancePaymentAmount = hasPaidAdvance ? advancePaymentAmount : 0;
      const advancePaid = advanceInstallment ? (advanceInstallment.amount || 0) : 0;

      const otherInstallments = sortedMyInstallments.filter(
        (inst) => !advanceInstallment || inst.id !== advanceInstallment.id
      );
      
      const myCosting = placement.myCosting || 0;
      const mainPaid = otherInstallments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
      const totalPaid = mainPaid;

      const mainMyCosting = myCosting;
      const remainingMainAmount = Math.max(0, mainMyCosting - mainPaid);
      const remainingAdvanceAmount = Math.max(0, effectiveAdvancePaymentAmount - advancePaid);
      const remainingAmount = remainingMainAmount;

      const isPlaceholder = !placement.company || placement.companyCosting <= 1;
      const hasFirstInstallment = (placement.installments || []).length > 0;
      const needsCostsSetup = hasFirstInstallment && isPlaceholder;

      return {
        ...placement,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
        studentEmail: student?.email,
        courseLabel: COURSES.find((c) => c.value === student?.course)?.label || student?.course || 'N/A',
        installments: placement.installments || [],
        totalPaid,
        remainingAmount,
        advancePaymentAmount,
        effectiveAdvancePaymentAmount,
        advancePaid,
        mainMyCosting,
        mainPaid,
        remainingMainAmount,
        remainingAdvanceAmount,
        hasPaidAdvance,
        isPlaceholder,
        hasFirstInstallment,
        needsCostsSetup,
        collectionPercent: myCosting ? Math.min(100, Math.round((totalPaid / myCosting) * 100)) : 0,
      };
    });

    // Apply search and filters
    return allPlacements.filter((placement) => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        placement.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (placement.studentEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (placement.country || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (placement.company || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Country filter
      const matchesCountry = countryFilter === 'all' || placement.country === countryFilter;

      return matchesSearch && matchesCountry;
    });
  }, [placements, students, searchQuery, countryFilter]);

  // Filter installments by type based on view mode
  const placementsWithFilteredInstallments = useMemo(() => {
    return placementsWithStudent.map((placement) => {
      const allInstallments = placement.installments || [];

      if (viewMode === 'company-payment') {
        // Only show company_costing installments
        const filteredInstallments = allInstallments.filter(
          (inst) => inst.installmentType === 'company_costing'
        );
        // Calculate company payment totals
        const companyPaid = filteredInstallments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
        const companyRemaining = (placement.companyCosting || 0) - companyPaid;

        return {
          ...placement,
          installments: filteredInstallments,
          companyPaid,
          companyRemaining,
        };
      } else {
        // Only show my_costing installments (or installments without type for backward compatibility)
        const filteredInstallments = allInstallments.filter(
          (inst) => !inst.installmentType || inst.installmentType === 'my_costing'
        );
        return {
          ...placement,
          installments: filteredInstallments,
        };
      }
    });
  }, [placementsWithStudent, viewMode]);

  const totals = useMemo(() => {
    const stats = placementsWithFilteredInstallments.reduce(
      (acc, placement) => {
        if (!placement.isPlaceholder) {
          acc.company += placement.companyCosting || 0;
          acc.my += placement.myCosting || 0;
          acc.remaining += placement.remainingAmount || 0;
          acc.totalInstallments += (placement.installments || []).length;
          acc.totalPaid += placement.totalPaid || 0;
        }
        return acc;
      },
      { company: 0, my: 0, remaining: 0, totalInstallments: 0, totalPaid: 0 }
    );

    stats.collectionPercentage = stats.my > 0 ? Math.round((stats.totalPaid / stats.my) * 100) : 0;

    return stats;
  }, [placementsWithFilteredInstallments]);

  // Filter for company payments - only students with company costing > 1
  const companyPaymentPlacements = useMemo(() => {
    return placementsWithFilteredInstallments.filter((placement) => {
      return placement.companyCosting > 1; // Only include placements with company costing
    });
  }, [placementsWithFilteredInstallments]);

  // Totals for company payments
  const companyPaymentTotals = useMemo(() => {
    const stats = companyPaymentPlacements.reduce(
      (acc, placement) => {
        if (!placement.isPlaceholder) {
          acc.company += placement.companyCosting || 0;
          acc.totalPaid += placement.companyPaid || 0; // Sum of company_costing installments
          acc.remaining += placement.companyRemaining || 0; // Company costing minus company paid
          acc.totalInstallments += (placement.installments || []).length;
        }
        return acc;
      },
      { company: 0, my: 0, remaining: 0, totalInstallments: 0, totalPaid: 0 }
    );

    stats.collectionPercentage = stats.company > 0 ? Math.round((stats.totalPaid / stats.company) * 100) : 0;

    return stats;
  }, [companyPaymentPlacements]);

  const currentBatchLabel = currentBatch === 'all' ? 'All Batches' : currentBatch;

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getForm = (placementId) => formState[placementId] || { amount: '', date: '', method: 'cash', bankMoneyReceived: 'hdfc', chequeNumber: '', remarks: '', isAdvance: false };

  const updateForm = (placementId, keyOrUpdates, value) => {
    setFormState((prev) => {
      const currentForm = prev[placementId] || {
        amount: '',
        date: '',
        method: 'cash',
        bankMoneyReceived: 'hdfc',
        chequeNumber: '',
        remarks: '',
        isAdvance: false,
      };

      const updates = typeof keyOrUpdates === 'string'
        ? { [keyOrUpdates]: value }
        : keyOrUpdates;

      return {
        ...prev,
        [placementId]: {
          ...currentForm,
          ...updates,
        },
      };
    });
  };

  const handleEditCosts = (placement) => {
    setEditingCosts(placement.id);
    setCostForm({
      country: placement.country || '',
      companyCosting: placement.companyCosting || '',
      myCosting: placement.myCosting || '',
      advancePayment: placement.advancePayment ?? '15,000',
    });
  };

  const handleSaveCosts = async (placementId) => {
    const country = costForm.country || '';
    const companyCosting = Number(costForm.companyCosting.toString().replace(/,/g, ''));
    const myCosting = Number(costForm.myCosting.toString().replace(/,/g, ''));
    const advancePayment = Number((costForm.advancePayment || '15,000').toString().replace(/,/g, ''));

    if (!country) {
      alert('Please enter the country');
      return;
    }
    if (!companyCosting || companyCosting <= 0 || !myCosting || myCosting <= 0) {
      alert('Please enter valid amounts for both Company Costing and My Costing');
      return;
    }

    try {
      await updatePlacementCosts(placementId, { country, companyCosting, myCosting, advancePayment });
      setRecentCountry(country); // Track the recently used country
      setEditingCosts(null);
      setCostForm({ country: '', companyCosting: '', myCosting: '', advancePayment: '' });
    } catch (error) {
      console.error('Error updating costs:', error);
      alert(error.message || 'Failed to update costs. Please try again.');
    }
  };

  const handleCancelEditCosts = () => {
    setEditingCosts(null);
    setCostForm({ country: '', companyCosting: '', myCosting: '', advancePayment: '' });
  };

  const handleAddInstallment = async (placementId) => {
    const currentForm = getForm(placementId);
    const amountValue = Number(currentForm.amount.toString().replace(/,/g, ''));

    if (!amountValue || amountValue <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      // Use appropriate function based on view mode
      const paymentFunc = viewMode === 'company-payment' ? addCompanyPayment : addPlacementInstallment;

      await paymentFunc(placementId, {
        amount: amountValue,
        date: currentForm.date || new Date().toISOString(),
        method: currentForm.method || 'cash',
        bankMoneyReceived: currentForm.bankMoneyReceived || 'hdfc',
        chequeNumber: currentForm.chequeNumber || null,
        country: currentForm.country || '', // Will be set in costs step
        remarks: currentForm.remarks || '',
        isAdvance: currentForm.isAdvance || false,
      });

      // Clear form after successful installment
      setFormState((prev) => ({
        ...prev,
        [placementId]: {
          amount: '',
          date: '',
          method: 'cash',
          bankMoneyReceived: 'hdfc',
          chequeNumber: '',
          country: '',
          remarks: '',
          isAdvance: false
        },
      }));

      // Auto-expand to show confirmation and next step
      setExpandedId(placementId);
    } catch (error) {
      console.error('Error adding installment:', error);

      // Handle duplicate installment error
      if (error.response?.status === 409) {
        const details = error.response?.data?.details;
        if (details) {
          alert(
            `Duplicate payment detected!\n\n` +
            `An installment of ₹${amountValue.toLocaleString('en-IN')} on ${currentForm.date} already exists for this placement.\n\n` +
            `Please verify if this is intentional.`
          );
        } else {
          alert(error.response?.data?.error || 'This installment has already been recorded. Please check existing installments.');
        }
      } else {
        alert(error.message || 'Failed to add installment. Please try again.');
      }
    }
  };

  const formatMethod = (method) => {
    if (!method) return 'Unknown';
    return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleInstallmentClick = (placement, installment) => {
    setSelectedInstallment({ placement, installment });
    setEditingInstallmentId(null);
    setInstallmentEditForm(null);
  };

  const closeInstallmentDetail = () => {
    setSelectedInstallment(null);
    setDeleteConfirmOpen(false);
    setDeleteSucceeded(false);
    setEditingInstallmentId(null);
    setInstallmentEditForm(null);
  };

  const startEditInstallment = () => {
    if (!selectedInstallment) return;
    const { installment, placement } = selectedInstallment;
    setEditingInstallmentId(installment.id);
    setInstallmentEditForm({
      amount: installment.amount ?? '',
      date: installment.date ? installment.date.toString().split('T')[0] : '',
      method: installment.method || 'cash',
      bankMoneyReceived: installment.bankMoneyReceived || 'hdfc',
      chequeNumber: installment.chequeNumber || '',
      remarks: installment.remarks || '',
      country: placement.country || '',
      companyCosting: placement.companyCosting ?? '',
      myCosting: placement.myCosting ?? '',
      isAdvance: installment.isAdvance || false,
      advancePayment: placement.advancePayment ?? 15000,
    });
  };

  const cancelEditInstallment = () => {
    setEditingInstallmentId(null);
    setInstallmentEditForm(null);
  };

  const handleDeleteInstallment = async () => {
    if (!selectedInstallment) return;
    setDeleteSucceeded(false);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    if (deletingInstallment) return;
    setDeleteConfirmOpen(false);
    setDeleteSucceeded(false);
  };

  const confirmDeleteInstallment = async () => {
    if (!selectedInstallment) return;

    try {
      setDeletingInstallment(true);
      await deletePlacementInstallment(selectedInstallment.installment.id);
      setEditingInstallmentId(null);
      setInstallmentEditForm(null);
      setDeleteSucceeded(true);
      setTimeout(() => {
        setDeleteConfirmOpen(false);
        setDeleteSucceeded(false);
        setSelectedInstallment(null);
      }, 1200);
    } catch (error) {
      console.error('Error deleting installment:', error);
      alert(error.message || 'Failed to delete installment. Please try again.');
    } finally {
      setDeletingInstallment(false);
    }
  };

  const updateInstallmentForm = (keyOrUpdates, value) => {
    setInstallmentEditForm((prev) => {
      const updates = typeof keyOrUpdates === 'string'
        ? { [keyOrUpdates]: value }
        : keyOrUpdates;
      return {
        ...prev,
        ...updates,
      };
    });
  };

  const handleSaveInstallment = async () => {
    if (!selectedInstallment || !installmentEditForm) return;
    const amountValue = Number(installmentEditForm.amount.toString().replace(/,/g, ''));
    const companyCostingValue = Number(installmentEditForm.companyCosting.toString().replace(/,/g, ''));
    const myCostingValue = Number(installmentEditForm.myCosting.toString().replace(/,/g, ''));
    const advancePaymentValue = Number((installmentEditForm.advancePayment || '15,000').toString().replace(/,/g, ''));

    if (!amountValue || amountValue <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!installmentEditForm.date) {
      alert('Please select a valid date');
      return;
    }
    if (!installmentEditForm.country) {
      alert('Please enter the country');
      return;
    }
    if (!companyCostingValue || companyCostingValue <= 0 || !myCostingValue || myCostingValue <= 0) {
      alert('Please enter valid company and my costing amounts');
      return;
    }

    const method = installmentEditForm.method || 'cash';
    const needsBank = ['bank_transfer', 'upi', 'card', 'cheque'].includes(method);

    try {
      setSavingInstallment(true);
      await updatePlacementCosts(selectedInstallment.placement.id, {
        country: installmentEditForm.country,
        companyCosting: companyCostingValue,
        myCosting: myCostingValue,
        advancePayment: advancePaymentValue,
      });
      const updated = await updatePlacementInstallment(selectedInstallment.installment.id, {
        amount: amountValue,
        date: installmentEditForm.date,
        method,
        bankMoneyReceived: needsBank ? installmentEditForm.bankMoneyReceived : null,
        chequeNumber: method === 'cheque' ? installmentEditForm.chequeNumber : null,
        remarks: installmentEditForm.remarks,
        isAdvance: installmentEditForm.isAdvance || false,
      });

      setSelectedInstallment((prev) => (prev ? {
        ...prev,
        installment: updated,
        placement: {
          ...prev.placement,
          country: installmentEditForm.country,
          companyCosting: companyCostingValue,
          myCosting: myCostingValue,
          advancePayment: advancePaymentValue,
        },
      } : prev));
      setEditingInstallmentId(null);
      setInstallmentEditForm(null);
    } catch (error) {
      console.error('Error updating installment:', error);
      alert(error.message || 'Failed to update installment. Please try again.');
    } finally {
      setSavingInstallment(false);
    }
  };

  return (
    <>
      <div className="placements-page">
        {/* Header */}
        <div className="placements-header">
          <div className="placements-header-text">
            <h1>Placements</h1>
            <p>
              {currentBatch === 'all'
                ? "Showing placements for all batches"
                : `Batch ${currentBatch} International Placements`}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="placements-view-toggle">
            <div className={`toggle-slider ${viewMode === 'company-payment' ? 'slide-right' : 'slide-left'}`}></div>
            <button
              className={`toggle-btn ${viewMode === 'regular' ? 'active' : ''}`}
              onClick={() => setViewMode('regular')}
            >
              <Briefcase className="w-4 h-4" />
              <span>Placement</span>
            </button>
            <button
              className={`toggle-btn ${viewMode === 'company-payment' ? 'active' : ''}`}
              onClick={() => setViewMode('company-payment')}
            >
              <Banknote className="w-4 h-4" />
              <span>Company</span>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="placements-stats">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon blue">
                <Briefcase />
              </div>
              <div>
                <p className="stat-label">Total Placements</p>
                <p className="stat-value">{viewMode === 'regular' ? placementsWithFilteredInstallments.length : companyPaymentPlacements.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon green">
                <IndianRupee />
              </div>
              <div>
                <p className="stat-label">Total Paid</p>
                <p className="stat-value green">{formatCurrency(viewMode === 'regular' ? totals.totalPaid : companyPaymentTotals.totalPaid)}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon orange">
                <TrendingUp />
              </div>
              <div>
                <p className="stat-label">Total Remaining</p>
                <p className="stat-value orange">{formatCurrency(viewMode === 'regular' ? totals.remaining : companyPaymentTotals.remaining)}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon yellow">
                <CreditCard />
              </div>
              <div>
                <p className="stat-label">Total Installments</p>
                <p className="stat-value">{viewMode === 'regular' ? totals.totalInstallments : companyPaymentTotals.totalInstallments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section with integrated search */}
        <div className="placements-table-card">
          {/* Search and Filter Bar */}
          <div className="placements-table-controls">
            <div className="placements-search-bar">
              <div className="placements-search-input-group">
                <Search className="w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by student name, email, country, company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="placements-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="placements-search-clear"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="placements-filter-actions">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="placements-filter-toggle"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {countryFilter !== 'all' && (
                    <span className="placements-filter-badge">1</span>
                  )}
                </button>

                {(searchQuery || countryFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCountryFilter('all');
                    }}
                    className="placements-clear-all-btn"
                    title="Clear all filters and search"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="placements-filter-panel">
                <div className="placements-filter-group">
                  <label className="placements-filter-label">Country</label>
                  <select
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="placements-filter-select"
                  >
                    <option value="all">All Countries</option>
                    {uniqueCountries.map((country) => {
                      const countryData = getCountryData(country);
                      return (
                        <option key={country} value={country}>
                          {countryData ? `${countryData.flag} ${country}` : country}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {(searchQuery || countryFilter !== 'all') && (
              <div className="placements-active-filters">
                <div className="placements-filter-chips">
                  {searchQuery && (
                    <div className="placements-filter-chip">
                      <span className="filter-chip-label">Search: "{searchQuery}"</span>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="filter-chip-remove"
                        title="Remove filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {countryFilter !== 'all' && (
                    <div className="placements-filter-chip">
                      <span className="filter-chip-label">Country: {countryFilter}</span>
                      <button
                        onClick={() => setCountryFilter('all')}
                        className="filter-chip-remove"
                        title="Remove filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="placements-results-count">
                  <span className="results-count-text">
                    Showing <strong>{viewMode === 'regular' ? placementsWithFilteredInstallments.length : companyPaymentPlacements.length}</strong> of <strong>{placements.length}</strong> placements
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="table-wrapper">
            <table className="placements-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Country</th>
                  <th>Company Costing</th>
                  {viewMode === 'regular' && (
                    <>
                      <th>My Costing</th>
                      <th>Advance Payment</th>
                    </>
                  )}
                  <th>Paid / Remaining</th>
                  <th>Placement Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(viewMode === 'regular' ? placementsWithFilteredInstallments : companyPaymentPlacements).length === 0 ? (
                  <tr>
                    <td colSpan={viewMode === 'regular' ? 8 : 6} className="empty-state">
                      <p className="empty-text">No placements found for this batch.</p>
                      <p className="empty-subtext">Try selecting another batch to view its placements.</p>
                    </td>
                  </tr>
                ) : (
                  (viewMode === 'regular' ? placementsWithFilteredInstallments : companyPaymentPlacements).map((placement) => (
                    <Fragment key={placement.id}>
                      <tr>
                        <td data-label="Student">
                          <div className="student-cell">
                            <div className="student-avatar">{getInitials(placement.studentName)}</div>
                            <div className="student-info">
                              <p className="student-name">{placement.studentName}</p>
                              <p className="student-email">{placement.studentEmail || 'Email not available'}</p>
                            </div>
                          </div>
                        </td>
                        <td data-label="Country">
                          {editingCosts === placement.id ? (
                            <select
                              className="cost-input country-select"
                              value={costForm.country}
                              onChange={(e) => setCostForm({ ...costForm, country: e.target.value })}
                            >
                              <option value="">Select a country</option>
                              {sortedCountries.map((country) => (
                                <option key={country.name} value={country.name}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                          ) : placement.country ? (
                            <span
                              className="country-code-badge"
                              title={`${getCountryData(placement.country)?.flag || ''} ${placement.country}`}
                            >
                              {getCountryCode(placement.country) || placement.country}
                            </span>
                          ) : (
                            <span className="country-chip">-</span>
                          )}
                        </td>
                        <td data-label="Company Costing" className="number">
                          {editingCosts === placement.id ? (
                            <input
                              type="text"
                              className="cost-input"
                              value={costForm.companyCosting}
                              onChange={(e) => {
                                const value = e.target.value.replace(/,/g, '');
                                setCostForm({ ...costForm, companyCosting: formatNumberWithCommas(value) });
                              }}
                              placeholder="Company Cost"
                            />
                          ) : (
                            placement.isPlaceholder ? (
                              <span className="placeholder-text">Not set</span>
                            ) : (
                              formatCurrency(placement.companyCosting)
                            )
                          )}
                        </td>
                        {viewMode === 'regular' && (
                          <>
                            <td data-label="My Costing" className="number">
                              {editingCosts === placement.id ? (
                                <input
                                  type="text"
                                  className="cost-input"
                                  value={costForm.myCosting}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/,/g, '');
                                    setCostForm({ ...costForm, myCosting: formatNumberWithCommas(value) });
                                  }}
                                  placeholder="My Cost"
                                />
                              ) : (
                                placement.isPlaceholder ? (
                                  <span className="placeholder-text">Not set</span>
                                ) : (
                                  formatCurrency(placement.mainMyCosting || 0)
                                )
                              )}
                            </td>
                            <td data-label="Advance Payment" className="number">
                              {editingCosts === placement.id ? (
                                <input
                                  type="text"
                                  className="cost-input"
                                  value={costForm.advancePayment}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/,/g, '');
                                    setCostForm({ ...costForm, advancePayment: formatNumberWithCommas(value) });
                                  }}
                                  placeholder="Advance Payment"
                                />
                              ) : (
                                placement.isPlaceholder ? (
                                  <span className="placeholder-text">Not set</span>
                                ) : (
                                  placement.hasPaidAdvance ? (
                                    formatCurrency(placement.advancePaymentAmount || 15000)
                                  ) : (
                                    <span className="not-paid-text" style={{ color: '#ef4444', fontWeight: '500' }}>Not paid</span>
                                  )
                                )
                              )}
                            </td>
                          </>
                        )}
                        <td data-label="Paid / Remaining" className="number">
                          {placement.isPlaceholder ? (
                            <span className="placeholder-text">-</span>
                          ) : (
                            <div className="payment-status">
                              {viewMode === 'company-payment' ? (
                                <>
                                  <span className="paid-amount">{formatCurrency(placement.companyPaid || 0)}</span>
                                  <span className="separator">/</span>
                                  <span className="remaining-amount pending">
                                    {formatCurrency(placement.companyRemaining || placement.companyCosting)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="paid-amount">{formatCurrency(placement.totalPaid)}</span>
                                  <span className="separator">/</span>
                                  <span className={`remaining-amount ${placement.remainingAmount > 0 ? 'pending' : 'complete'}`}>
                                    {formatCurrency(placement.remainingAmount)}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                        <td data-label="Placement Date">{formatDate(placement.placementDate)}</td>
                        <td data-label="Actions" className="text-right">
                          {editingCosts === placement.id ? (
                            <div className="edit-actions">
                              <button className="btn-save" onClick={() => handleSaveCosts(placement.id)} title="Save">
                                <Save size={16} />
                              </button>
                              <button className="btn-cancel" onClick={handleCancelEditCosts} title="Cancel">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              {canEdit() && !placement.hasFirstInstallment && (
                                <button className="btn-add-first" onClick={() => toggleExpand(placement.id)} title="Add First Installment">
                                  <Plus size={16} /> {viewMode === 'company-payment' ? 'First Payment' : 'First Payment'}
                                </button>
                              )}
                              {canEdit() && placement.needsCostsSetup && (
                                <button className="btn-edit-costs" onClick={() => handleEditCosts(placement)} title="Set Costs">
                                  <Edit2 size={16} /> Set Costs
                                </button>
                              )}
                              {!placement.isPlaceholder && (
                                <button
                                  className={`installment-toggle ${expandedId === placement.id ? 'open' : ''}`}
                                  onClick={() => toggleExpand(placement.id)}
                                  aria-expanded={expandedId === placement.id}
                                  aria-label={`View ${viewMode === 'company-payment' ? 'company payments' : 'installments'} for ${placement.studentName}`}
                                >
                                  {viewMode === 'company-payment' ? (
                                    <span className="installment-count">{placement.installments.length} payments</span>
                                  ) : (
                                    <span className="installment-count">{placement.installments.length} installments</span>
                                  )}
                                  <ChevronDown />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                      {expandedId === placement.id && (
                        <tr className="installments-row">
                          <td colSpan={viewMode === 'regular' ? 8 : 6}>
                            <div className="installments-card">
                              {viewMode === 'company-payment' ? (
                                <div className="company-payment-section">
                                  <div className="company-payment-header">
                                    <p>{placement.studentName}</p>
                                    <div className="company-costing-breakdown">
                                      <span className="label">Company Costing:</span>
                                      <span className="value">{formatCurrency(placement.companyCosting)}</span>
                                      <span className="separator">·</span>
                                      <span className="paid">Paid: {formatCurrency(placement.companyPaid || 0)}</span>
                                      <span className="separator">·</span>
                                      <span className="remaining">Remaining: {formatCurrency(placement.companyRemaining || placement.companyCosting)}</span>
                                    </div>
                                  </div>

                                  {/* Show existing company payments */}
                                  {placement.installments.length > 0 && (
                                    <div className="installments-list">
                                      <div className="installments-list-header">
                                        <p>Company Payments ({placement.installments.length})</p>
                                      </div>
                                      {placement.installments.map((inst) => (
                                        <button
                                          type="button"
                                          className="installment-item actionable"
                                          key={inst.id}
                                          onClick={() => handleInstallmentClick(placement, inst)}
                                        >
                                          <div>
                                            <p className="installment-amount">{formatCurrency(inst.amount)}</p>
                                            <p className="installment-date">{formatDate(inst.date)}</p>
                                            {inst.remarks && <p className="installment-remarks">{inst.remarks}</p>}
                                          </div>
                                          <span className="installment-method">{formatMethod(inst.method)}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  {canEdit() && (
                                    <div className="add-installment">
                                      <div className="add-installment-header">
                                        <Plus size={18} />
                                        <span>Add Company Payment</span>
                                      </div>
                                      <div className="add-installment-fields">
                                        <div className="form-group">
                                          <div className="form-label-row">
                                            <label className="form-label">
                                              <DollarSign size={16} />
                                              Amount *
                                            </label>
                                            {formatPreview(getForm(placement.id).amount) && (
                                              <span className="amount-hint">{formatPreview(getForm(placement.id).amount)}</span>
                                            )}
                                          </div>
                                          <input
                                            type="text"
                                            min="0"
                                            placeholder=""
                                            value={getForm(placement.id).amount}
                                            onChange={(e) => {
                                              updateForm(placement.id, 'amount', e.target.value);
                                            }}
                                          />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">
                                            <Calendar size={16} />
                                            Payment Date
                                          </label>
                                          <input
                                            type="date"
                                            value={getForm(placement.id).date}
                                            onChange={(e) => updateForm(placement.id, 'date', e.target.value)}
                                          />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">
                                            <CreditCard size={16} />
                                            Payment Method
                                          </label>
                                          <select
                                            value={getForm(placement.id).method}
                                            onChange={(e) => updateForm(placement.id, 'method', e.target.value)}
                                          >
                                            <option value="cash">Cash</option>
                                            <option value="upi">UPI</option>
                                            <option value="card">Card</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cheque">Cheque</option>
                                          </select>
                                        </div>
                                        {(getForm(placement.id).method === 'bank_transfer' || getForm(placement.id).method === 'upi' || getForm(placement.id).method === 'card' || getForm(placement.id).method === 'cheque') && (
                                          <div className="form-group">
                                            <label className="form-label">
                                              <Building2 size={16} />
                                              Bank Account
                                            </label>
                                            {renderBankSelect(
                                              getForm(placement.id).bankMoneyReceived,
                                              (e) => updateForm(placement.id, 'bankMoneyReceived', e.target.value)
                                            )}
                                          </div>
                                        )}
                                        {getForm(placement.id).method === 'cheque' && (
                                          <div className="form-group">
                                            <label className="form-label">
                                              <MessageSquare size={16} />
                                              Cheque Number
                                            </label>
                                            <input
                                              type="text"
                                              placeholder=""
                                              value={getForm(placement.id).chequeNumber}
                                              onChange={(e) => updateForm(placement.id, 'chequeNumber', e.target.value)}
                                            />
                                          </div>
                                        )}
                                        <div className="form-group full-width">
                                          <label className="form-label">
                                            <MessageSquare size={16} />
                                            Remarks
                                          </label>
                                          <textarea
                                            placeholder="Add any notes or remarks (optional)"
                                            value={getForm(placement.id).remarks}
                                            onChange={(e) => updateForm(placement.id, 'remarks', e.target.value)}
                                            className="remarks-textarea"
                                            rows="2"
                                          />
                                        </div>
                                      </div>
                                      <button
                                        className="add-installment-btn"
                                        onClick={() => handleAddInstallment(placement.id)}
                                        aria-label={`Add company payment for ${placement.studentName}`}
                                      >
                                        <Plus size={16} />
                                        Add Company Payment
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div className="installments-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{placement.studentName} · {placement.installments.length} installments</p>
                                    <div className="company-costing-breakdown">
                                      <span className="label">My Costing (Main):</span>
                                      <span className="value">{formatCurrency(placement.mainMyCosting)}</span>
                                      <span className="separator">·</span>
                                      <span className="paid">Paid: {formatCurrency(placement.mainPaid)}</span>
                                      <span className="separator">·</span>
                                      <span className="remaining">Remaining: {formatCurrency(placement.remainingMainAmount)}</span>
                                    </div>
                                    <div className="company-costing-breakdown">
                                      <span className="label">Advance Payment:</span>
                                      <span className="value">{formatCurrency(placement.effectiveAdvancePaymentAmount)}</span>
                                      <span className="separator">·</span>
                                      <span className="paid">Paid: {formatCurrency(placement.advancePaid)}</span>
                                      <span className="separator">·</span>
                                      <span className="remaining">Remaining: {formatCurrency(placement.remainingAdvanceAmount)}</span>
                                    </div>
                                  </div>
                                  <div className="installments-list">
                                    {placement.installments.length === 0 ? (
                                      <p className="installment-empty">No installments recorded</p>
                                    ) : (
                                      placement.installments.map((inst) => (
                                        <button
                                          type="button"
                                          className="installment-item actionable"
                                          key={inst.id}
                                          onClick={() => handleInstallmentClick(placement, inst)}
                                        >
                                          <div>
                                            <p className="installment-amount">
                                              {formatCurrency(inst.amount)}
                                              {inst.isAdvance && <span className="advance-tag" style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', borderRadius: '4px', fontWeight: 'bold' }}>Advance</span>}
                                            </p>
                                            <p className="installment-date">{formatDate(inst.date)}</p>
                                            {inst.remarks && <p className="installment-remarks">{inst.remarks}</p>}
                                          </div>
                                          <span className="installment-method">{formatMethod(inst.method)}</span>
                                        </button>
                                      ))
                                    )}
                                  </div>
                                  {canEdit() && (
                                    <div className="add-installment">
                                      <div className="add-installment-header">
                                        <Plus size={18} />
                                        <span>Add New Installment</span>
                                      </div>
                                      <div className="add-installment-fields">
                                        <div className="form-group checkbox-group full-width" style={{ margin: '4px 0' }}>
                                          <label className="advance-payment-radio-toggle">
                                            <input
                                              type="checkbox"
                                              id={`isAdvance-${placement.id}`}
                                              checked={getForm(placement.id).isAdvance || false}
                                              onChange={(e) => {
                                                const checked = e.target.checked;
                                                updateForm(placement.id, {
                                                  isAdvance: checked,
                                                  amount: checked ? formatNumberWithCommas(placement.advancePaymentAmount || 15000) : (getForm(placement.id).amount === formatNumberWithCommas(placement.advancePaymentAmount || 15000) ? '' : getForm(placement.id).amount)
                                                });
                                              }}
                                              className="advance-toggle-radio-input"
                                            />
                                            <span className="radio-button-custom"></span>
                                            <span className="radio-label-text">Advance Payment</span>
                                          </label>
                                        </div>
                                        <div className="form-group">
                                          <div className="form-label-row">
                                            <label className="form-label">
                                              <DollarSign size={16} />
                                              Amount *
                                            </label>
                                            {formatPreview(getForm(placement.id).amount) && (
                                              <span className="amount-hint">{formatPreview(getForm(placement.id).amount)}</span>
                                            )}
                                          </div>
                                          <input
                                            type="text"
                                            min="0"
                                            placeholder=""
                                            value={getForm(placement.id).amount}
                                            onChange={(e) => {
                                              updateForm(placement.id, 'amount', e.target.value);
                                            }}
                                          />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">
                                            <Calendar size={16} />
                                            Payment Date
                                          </label>
                                          <input
                                            type="date"
                                            value={getForm(placement.id).date}
                                            onChange={(e) => updateForm(placement.id, 'date', e.target.value)}
                                          />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">
                                            <CreditCard size={16} />
                                            Payment Method
                                          </label>
                                          <select
                                            value={getForm(placement.id).method}
                                            onChange={(e) => updateForm(placement.id, 'method', e.target.value)}
                                          >
                                            <option value="cash">Cash</option>
                                            <option value="upi">UPI</option>
                                            <option value="card">Card</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cheque">Cheque</option>
                                          </select>
                                        </div>
                                        {(getForm(placement.id).method === 'bank_transfer' || getForm(placement.id).method === 'upi' || getForm(placement.id).method === 'card' || getForm(placement.id).method === 'cheque') && (
                                          <div className="form-group">
                                            <label className="form-label">
                                              <Building2 size={16} />
                                              Bank Account
                                            </label>
                                            {renderBankSelect(
                                              getForm(placement.id).bankMoneyReceived,
                                              (e) => updateForm(placement.id, 'bankMoneyReceived', e.target.value)
                                            )}
                                          </div>
                                        )}
                                        {getForm(placement.id).method === 'cheque' && (
                                          <div className="form-group">
                                            <label className="form-label">
                                              <MessageSquare size={16} />
                                              Cheque Number
                                            </label>
                                            <input
                                              type="text"
                                              placeholder=""
                                              value={getForm(placement.id).chequeNumber}
                                              onChange={(e) => updateForm(placement.id, 'chequeNumber', e.target.value)}
                                            />
                                          </div>
                                        )}
                                        <div className="form-group full-width">
                                          <label className="form-label">
                                            <MessageSquare size={16} />
                                            Remarks
                                          </label>
                                          <textarea
                                            placeholder="Add any notes or remarks (optional)"
                                            value={getForm(placement.id).remarks}
                                            onChange={(e) => updateForm(placement.id, 'remarks', e.target.value)}
                                            className="remarks-textarea"
                                            rows="2"
                                          />
                                        </div>
                                      </div>
                                      <button
                                        className="add-installment-btn"
                                        onClick={() => handleAddInstallment(placement.id)}
                                        aria-label={`Add installment for ${placement.studentName}`}
                                      >
                                        <Plus size={16} />
                                        Add Installment
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="placements-cards">
            {(viewMode === 'regular' ? placementsWithFilteredInstallments : companyPaymentPlacements).length === 0 ? (
              <div className="placement-card empty-card">
                <p className="empty-text">No placements found for this batch.</p>
                <p className="empty-subtext">Try selecting another batch to view its placements.</p>
              </div>
            ) : (
              (viewMode === 'regular' ? placementsWithFilteredInstallments : companyPaymentPlacements).map((placement) => (
                <div className="placement-card" key={placement.id}>
                  <div className="placement-card-header">
                    <div className="placement-card-student">
                      <div className="student-avatar">{getInitials(placement.studentName)}</div>
                      <div className="placement-card-meta">
                        <p className="student-name">{placement.studentName}</p>
                        <p className="student-email">{placement.studentEmail || 'Email not available'}</p>
                      </div>
                    </div>
                    <div className="placement-card-badges">
                      <span className="course-chip">{placement.courseLabel}</span>
                      {placement.country ? (
                        <span
                          className="country-code-badge"
                          title={`${getCountryData(placement.country)?.flag || ''} ${placement.country}`}
                        >
                          {getCountryCode(placement.country) || placement.country}
                        </span>
                      ) : (
                        <span className="country-chip">-</span>
                      )}
                      <span className="date-chip">{formatDate(placement.placementDate)}</span>
                    </div>
                  </div>

                  <div className="placement-card-body">
                    <div className="placement-card-grid two-by-two">
                      {editingCosts === placement.id && (
                        <div className="placement-card-stat full">
                          <div className="label-row">
                            <span className="label">Country *</span>
                          </div>
                          <select
                            className="cost-input country-select"
                            value={costForm.country}
                            onChange={(e) => {
                              setCostForm({ ...costForm, country: e.target.value });
                            }}
                          >
                            <option value="">Select a country</option>
                            {sortedCountries.map((country) => (
                              <option key={country.name} value={country.name}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="placement-card-stat">
                        <div className="label-row">
                          <span className="label">Company Costing</span>
                          {editingCosts === placement.id && formatPreview(costForm.companyCosting) && (
                            <span className="amount-hint">{formatPreview(costForm.companyCosting)}</span>
                          )}
                        </div>
                        {editingCosts === placement.id ? (
                          <input
                            type="text"
                            className="cost-input"
                            value={costForm.companyCosting}
                            onChange={(e) => {
                              setCostForm({ ...costForm, companyCosting: e.target.value });
                            }}
                            placeholder="Company Cost"
                          />
                        ) : (
                          <span className="value">{placement.isPlaceholder ? 'Not set' : formatCurrency(placement.companyCosting)}</span>
                        )}
                      </div>
                      <div className="placement-card-stat">
                        <div className="label-row">
                          <span className="label">My Costing</span>
                          {editingCosts === placement.id && formatPreview(costForm.myCosting) && (
                            <span className="amount-hint">{formatPreview(costForm.myCosting)}</span>
                          )}
                        </div>
                        {editingCosts === placement.id ? (
                          <input
                            type="text"
                            className="cost-input"
                            value={costForm.myCosting}
                            onChange={(e) => {
                              setCostForm({ ...costForm, myCosting: e.target.value });
                            }}
                            placeholder="My Cost"
                          />
                        ) : (
                          <span className="value">{placement.isPlaceholder ? 'Not set' : formatCurrency(placement.mainMyCosting || 0)}</span>
                        )}
                      </div>
                      {viewMode === 'regular' && (
                        <div className="placement-card-stat">
                          <div className="label-row">
                            <span className="label">Advance Payment</span>
                            {editingCosts === placement.id && formatPreview(costForm.advancePayment) && (
                              <span className="amount-hint">{formatPreview(costForm.advancePayment)}</span>
                            )}
                          </div>
                          {editingCosts === placement.id ? (
                            <input
                              type="text"
                              className="cost-input"
                              value={costForm.advancePayment}
                              onChange={(e) => {
                                setCostForm({ ...costForm, advancePayment: e.target.value });
                              }}
                              placeholder="Advance Cost"
                            />
                          ) : (
                            <span className="value">
                              {placement.isPlaceholder ? 'Not set' : (
                                placement.hasPaidAdvance ? (
                                  formatCurrency(placement.advancePaymentAmount || 15000)
                                ) : (
                                  <span className="not-paid-text" style={{ color: '#ef4444', fontWeight: '500' }}>Not paid</span>
                                )
                              )}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="placement-card-stat">
                        <span className="label">Paid</span>
                        <span className="value paid">{placement.isPlaceholder ? '-' : formatCurrency(placement.totalPaid)}</span>
                      </div>
                      <div className="placement-card-stat">
                        <span className="label">Remaining</span>
                        <span className={`value remaining ${placement.remainingAmount > 0 ? 'pending' : 'complete'}`}>
                          {placement.isPlaceholder ? '-' : formatCurrency(placement.remainingAmount)}
                        </span>
                      </div>
                    </div>
                    <div className="placement-card-row inline">
                      <span className="label">Installments</span>
                      <span className="value">{placement.installments.length}</span>
                    </div>
                  </div>

                  <div className="placement-card-actions">
                    {editingCosts === placement.id ? (
                      <>
                        <button className="btn-save" onClick={() => handleSaveCosts(placement.id)} title="Save">
                          <Save size={16} />
                          Save
                        </button>
                        <button className="btn-cancel" onClick={handleCancelEditCosts} title="Cancel">
                          <X size={16} />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {canEdit() && !placement.hasFirstInstallment && (
                          <button className="btn-add-first" onClick={() => toggleExpand(placement.id)} title="Add First Installment">
                            <Plus size={16} /> First Payment
                          </button>
                        )}
                        {canEdit() && placement.needsCostsSetup && (
                          <button className="btn-edit-costs" onClick={() => handleEditCosts(placement)} title="Set Costs">
                            <Edit2 size={16} /> Set Costs
                          </button>
                        )}
                        {!placement.isPlaceholder && (
                          <button
                            className={`installment-toggle ${expandedId === placement.id ? 'open' : ''}`}
                            onClick={() => toggleExpand(placement.id)}
                            aria-expanded={expandedId === placement.id}
                            aria-label={`View installments for ${placement.studentName}`}
                          >
                            <span className="installment-count">{placement.installments.length} installments</span>
                            <ChevronDown />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {expandedId === placement.id && (
                    <div className="installments-card mobile">
                      <div className="installments-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>{placement.studentName} · {placement.installments.length} installments</p>
                        {viewMode === 'regular' && (
                          <>
                            <div className="company-costing-breakdown">
                              <span className="label">My Costing:</span>
                              <span className="value">{formatCurrency(placement.mainMyCosting)}</span>
                              <span className="separator">·</span>
                              <span className="paid">Paid: {formatCurrency(placement.mainPaid)}</span>
                              <span className="separator">·</span>
                              <span className="remaining">Rem: {formatCurrency(placement.remainingMainAmount)}</span>
                            </div>
                            <div className="company-costing-breakdown">
                              <span className="label">Advance:</span>
                              <span className="value">{formatCurrency(placement.effectiveAdvancePaymentAmount)}</span>
                              <span className="separator">·</span>
                              <span className="paid">Paid: {formatCurrency(placement.advancePaid)}</span>
                              <span className="separator">·</span>
                              <span className="remaining">Rem: {formatCurrency(placement.remainingAdvanceAmount)}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="installments-list">
                        {placement.installments.length === 0 ? (
                          <p className="installment-empty">No installments recorded</p>
                        ) : (
                          placement.installments.map((inst) => (
                            <button
                              type="button"
                              className="installment-item actionable"
                              key={inst.id}
                              onClick={() => handleInstallmentClick(placement, inst)}
                            >
                              <div>
                                <p className="installment-amount">
                                  {formatCurrency(inst.amount)}
                                  {inst.isAdvance && <span className="advance-tag" style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', borderRadius: '4px', fontWeight: 'bold' }}>Advance</span>}
                                </p>
                                <p className="installment-date">{formatDate(inst.date)}</p>
                                {inst.remarks && <p className="installment-remarks">{inst.remarks}</p>}
                              </div>
                              <span className="installment-method">{formatMethod(inst.method)}</span>
                            </button>
                          ))
                        )}
                      </div>
                      {canEdit() && (
                        <div className="add-installment">
                          <div className="add-installment-header">
                            <Plus size={18} />
                            <span>Add New Installment</span>
                          </div>
                          <div className="add-installment-fields">
                            {viewMode === 'regular' && (
                              <div className="form-group checkbox-group full-width" style={{ margin: '4px 0' }}>
                                <label className="advance-payment-radio-toggle">
                                  <input
                                    type="checkbox"
                                    id={`isAdvance-mobile-${placement.id}`}
                                    checked={getForm(placement.id).isAdvance || false}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      updateForm(placement.id, {
                                        isAdvance: checked,
                                        amount: checked ? formatNumberWithCommas(placement.advancePaymentAmount || 15000) : (getForm(placement.id).amount === formatNumberWithCommas(placement.advancePaymentAmount || 15000) ? '' : getForm(placement.id).amount)
                                      });
                                    }}
                                    className="advance-toggle-radio-input"
                                  />
                                  <span className="radio-button-custom"></span>
                                  <span className="radio-label-text">Advance Payment</span>
                                </label>
                              </div>
                            )}
                            <div className="form-group">
                              <div className="form-label-row">
                                <label className="form-label">
                                  <DollarSign size={16} />
                                  Amount *
                                </label>
                                {formatPreview(getForm(placement.id).amount) && (
                                  <span className="amount-hint">{formatPreview(getForm(placement.id).amount)}</span>
                                )}
                              </div>
                              <input
                                type="text"
                                min="0"
                                placeholder="0.00"
                                value={getForm(placement.id).amount}
                                onChange={(e) => updateForm(placement.id, 'amount', e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">
                                <Calendar size={16} />
                                Payment Date
                              </label>
                              <input
                                type="date"
                                value={getForm(placement.id).date}
                                onChange={(e) => updateForm(placement.id, 'date', e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">
                                <CreditCard size={16} />
                                Payment Method
                              </label>
                              <select
                                value={getForm(placement.id).method}
                                onChange={(e) => updateForm(placement.id, 'method', e.target.value)}
                              >
                                <option value="cash">Cash</option>
                                <option value="upi">UPI</option>
                                <option value="card">Card</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cheque">Cheque</option>
                              </select>
                            </div>
                            {(getForm(placement.id).method === 'bank_transfer' || getForm(placement.id).method === 'upi' || getForm(placement.id).method === 'card' || getForm(placement.id).method === 'cheque') && (
                              <div className="form-group">
                                <label className="form-label">
                                  <Building2 size={16} />
                                  Bank Account
                                </label>
                                {renderBankSelect(
                                  getForm(placement.id).bankMoneyReceived,
                                  (e) => updateForm(placement.id, 'bankMoneyReceived', e.target.value)
                                )}
                              </div>
                            )}
                            {getForm(placement.id).method === 'cheque' && (
                              <div className="form-group">
                                <label className="form-label">
                                  <MessageSquare size={16} />
                                  Cheque Number
                                </label>
                                <input
                                  type="text"
                                  placeholder=""
                                  value={getForm(placement.id).chequeNumber}
                                  onChange={(e) => updateForm(placement.id, 'chequeNumber', e.target.value)}
                                />
                              </div>
                            )}
                            <div className="form-group full-width">
                              <label className="form-label">
                                <MessageSquare size={16} />
                                Remarks
                              </label>
                              <textarea
                                placeholder="Add any notes or remarks (optional)"
                                value={getForm(placement.id).remarks}
                                onChange={(e) => updateForm(placement.id, 'remarks', e.target.value)}
                                className="remarks-textarea"
                                rows="2"
                              />
                            </div>
                          </div>
                          <button
                            className="add-installment-btn"
                            onClick={() => handleAddInstallment(placement.id)}
                            aria-label={`Add installment for ${placement.studentName}`}
                          >
                            <Plus size={16} />
                            Add installment
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedInstallment && (
        <div className="installment-detail-overlay" role="dialog" aria-modal="true">
          <div className="installment-detail-card">
            <div className="installment-detail-header">
              <div>
                <p className="installment-detail-title">{selectedInstallment.placement.studentName}</p>
                <p className="installment-detail-subtitle">
                  {selectedInstallment.installment.installmentType === 'company_costing'
                    ? 'Company Payment details'
                    : 'Installment details'}
                </p>
              </div>
              <div className="installment-detail-actions">
                {canEdit() && editingInstallmentId !== selectedInstallment.installment.id && (
                  <>
                    <button className="btn-save" onClick={startEditInstallment} title={selectedInstallment.installment.installmentType === 'company_costing' ? 'Edit company payment' : 'Edit installment'}>
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={handleDeleteInstallment}
                      title={selectedInstallment.installment.installmentType === 'company_costing' ? 'Delete company payment' : 'Delete installment'}
                      disabled={deletingInstallment}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                {canEdit() && editingInstallmentId === selectedInstallment.installment.id && (
                  <div className="edit-actions">
                    <button
                      className="btn-save"
                      onClick={handleSaveInstallment}
                      title="Save changes"
                      disabled={savingInstallment}
                    >
                      <Save size={16} />
                    </button>
                    <button className="btn-cancel" onClick={cancelEditInstallment} title="Cancel editing">
                      <X size={16} />
                    </button>
                  </div>
                )}
                <button className="installment-detail-close" onClick={closeInstallmentDetail} aria-label="Close details">
                  <X size={18} />
                </button>
              </div>
            </div>

            {editingInstallmentId === selectedInstallment.installment.id ? (
              <div className="installment-edit-form add-installment">
                <div className="add-installment-fields">
                  {selectedInstallment.installment.installmentType !== 'company_costing' && (
                    <div className="form-group checkbox-group full-width" style={{ gridColumn: 'span 2', margin: '4px 0' }}>
                      <label className="advance-payment-radio-toggle">
                        <input
                          type="checkbox"
                          id="edit-isAdvance"
                          checked={installmentEditForm?.isAdvance || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            updateInstallmentForm({
                              isAdvance: checked,
                              amount: checked ? formatNumberWithCommas(selectedInstallment.placement.advancePaymentAmount || 15000) : (installmentEditForm?.amount === formatNumberWithCommas(selectedInstallment.placement.advancePaymentAmount || 15000) ? '' : installmentEditForm?.amount)
                            });
                          }}
                          className="advance-toggle-radio-input"
                        />
                        <span className="radio-button-custom"></span>
                        <span className="radio-label-text">Advance Payment</span>
                      </label>
                    </div>
                  )}
                  {selectedInstallment.installment.installmentType !== 'company_costing' && (
                    <div className="form-group">
                      <label className="form-label">
                        <IndianRupee size={16} />
                        Advance Cost *
                      </label>
                      <input
                        type="text"
                        value={installmentEditForm?.advancePayment ?? 15000}
                        onChange={(e) => updateInstallmentForm('advancePayment', e.target.value)}
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">
                      <MapPin size={16} />
                      Country *
                    </label>
                    <input
                      type="text"
                      value={installmentEditForm?.country ?? ''}
                      onChange={(e) => updateInstallmentForm('country', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <Building2 size={16} />
                      Company Costing *
                    </label>
                    <input
                      type="text"
                      value={installmentEditForm?.companyCosting ?? ''}
                      onChange={(e) => updateInstallmentForm('companyCosting', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <IndianRupee size={16} />
                      My Costing *
                    </label>
                    <input
                      type="text"
                      value={installmentEditForm?.myCosting ?? ''}
                      onChange={(e) => updateInstallmentForm('myCosting', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <DollarSign size={16} />
                      Amount *
                    </label>
                    <input
                      type="text"
                      value={installmentEditForm?.amount ?? ''}
                      onChange={(e) => updateInstallmentForm('amount', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <Calendar size={16} />
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      value={installmentEditForm?.date ?? ''}
                      onChange={(e) => updateInstallmentForm('date', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <CreditCard size={16} />
                      Payment Method
                    </label>
                    <select
                      value={installmentEditForm?.method ?? 'cash'}
                      onChange={(e) => updateInstallmentForm('method', e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  {(installmentEditForm?.method === 'bank_transfer' || installmentEditForm?.method === 'upi' || installmentEditForm?.method === 'card' || installmentEditForm?.method === 'cheque') && (
                    <div className="form-group">
                      <label className="form-label">
                        <Building2 size={16} />
                        Bank Account
                      </label>
                      {renderBankSelect(
                        installmentEditForm?.bankMoneyReceived ?? 'hdfc',
                        (e) => updateInstallmentForm('bankMoneyReceived', e.target.value)
                      )}
                    </div>
                  )}
                  {installmentEditForm?.method === 'cheque' && (
                    <div className="form-group">
                      <label className="form-label">
                        <MessageSquare size={16} />
                        Cheque Number
                      </label>
                      <input
                        type="text"
                        value={installmentEditForm?.chequeNumber ?? ''}
                        onChange={(e) => updateInstallmentForm('chequeNumber', e.target.value)}
                      />
                    </div>
                  )}
                  <div className="form-group full-width">
                    <label className="form-label">
                      <MessageSquare size={16} />
                      Remarks
                    </label>
                    <textarea
                      placeholder="Add any notes or remarks (optional)"
                      value={installmentEditForm?.remarks ?? ''}
                      onChange={(e) => updateInstallmentForm('remarks', e.target.value)}
                      className="remarks-textarea"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="installment-detail-grid">
                <div className="installment-detail-row">
                  <span className="installment-detail-label">Amount</span>
                  <span className="installment-detail-value">{formatCurrency(selectedInstallment.installment.amount)}</span>
                </div>
                <div className="installment-detail-row">
                  <span className="installment-detail-label">Date</span>
                  <span className="installment-detail-value">{formatDate(selectedInstallment.installment.date)}</span>
                </div>
                <div className="installment-detail-row">
                  <span className="installment-detail-label">Payment Method</span>
                  <span className="installment-detail-value">{formatMethod(selectedInstallment.installment.method)}</span>
                </div>
                <div className="installment-detail-row">
                  <span className="installment-detail-label">Course</span>
                  <span className="installment-detail-value">{selectedInstallment.placement.courseLabel}</span>
                </div>
                {selectedInstallment.installment.bankMoneyReceived && (
                  <div className="installment-detail-row">
                    <span className="installment-detail-label">Bank</span>
                    <span className="installment-detail-value">
                      {getPlacementBankLabel(selectedInstallment.installment.bankMoneyReceived)}
                    </span>
                  </div>
                )}
                {selectedInstallment.installment.chequeNumber && (
                  <div className="installment-detail-row">
                    <span className="installment-detail-label">Cheque Number</span>
                    <span className="installment-detail-value">{selectedInstallment.installment.chequeNumber}</span>
                  </div>
                )}
                {selectedInstallment.installment.remarks && (
                  <div className="installment-detail-row full">
                    <span className="installment-detail-label">Remarks</span>
                    <span className="installment-detail-value remarks">{selectedInstallment.installment.remarks}</span>
                  </div>
                )}
                <div className="installment-detail-row full">
                  <span className="installment-detail-label">Placement</span>
                  <span className="installment-detail-value">
                    {selectedInstallment.placement.country} • My Costing (Main): {formatCurrency(selectedInstallment.placement.mainMyCosting)} • Advance: {formatCurrency(selectedInstallment.placement.advancePaymentAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteConfirmOpen && selectedInstallment && (
        <div className="installment-delete-overlay" role="dialog" aria-modal="true">
          <div className={`installment-delete-card ${deleteSucceeded ? 'success' : ''}`}>
            <div className="installment-delete-header">
              <div className={`installment-delete-icon ${deleteSucceeded ? 'success' : ''}`}>
                {deleteSucceeded ? <CheckCircle2 size={18} /> : <Trash2 size={18} />}
              </div>
              <div>
                <p className="installment-delete-title">{deleteSucceeded ? 'Transaction deleted' : 'Delete transaction'}</p>
                <p className="installment-delete-subtitle">
                  {deleteSucceeded
                    ? 'The transaction has been removed successfully.'
                    : 'This will remove the installment and its related audit entry.'}
                </p>
              </div>
            </div>

            <div className="installment-delete-body">
              {deleteSucceeded ? (
                <p className="installment-delete-text success">
                  Deleted for <strong>{selectedInstallment.placement.studentName}</strong>.
                </p>
              ) : (
                <p className="installment-delete-text">
                  Are you sure you want to delete <strong>{selectedInstallment.placement.studentName}</strong>{' '}
                  {selectedInstallment.installment.installmentType === 'company_costing' ? 'company payment' : 'installment'}?
                  This action cannot be undone.
                </p>
              )}
              <div className="installment-delete-summary">
                <span className="summary-label">Amount</span>
                <span className="summary-value">{formatCurrency(selectedInstallment.installment.amount)}</span>
              </div>
            </div>

            <div className="installment-delete-actions">
              <button className="btn-cancel" onClick={closeDeleteConfirm} disabled={deletingInstallment || deleteSucceeded}>
                Cancel
              </button>
              <button className="btn-delete-solid" onClick={confirmDeleteInstallment} disabled={deletingInstallment || deleteSucceeded}>
                {deletingInstallment ? 'Deleting...' : deleteSucceeded ? 'Deleted' : 'Delete transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlacementsPage;
