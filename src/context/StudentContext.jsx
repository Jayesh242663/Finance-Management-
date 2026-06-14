import { createContext, useContext, useState, useCallback } from 'react';
import demoData from '../data/demo.json';
import { isStudentDroppedOut } from '../utils/studentStatus';

const StudentContext = createContext(null);

const STORAGE_KEYS_EXPENSES = 'dsmct_expenses';
const STORAGE_KEYS_BATCHES = 'dsmct_batches';
const STORAGE_KEYS_COURSES = 'dsmct_courses';

const DEFAULT_COURSES = [
  { id: 'c1', course_type: 'diploma_hotel_management', course_code: 'DHM', course_name: 'Diploma in Hotel Management' },
  { id: 'c2', course_type: 'international_diploma_hotel_management', course_code: 'IDHM', course_name: 'International Diploma in Hotel Management' }
];

const DEFAULT_BATCHES = [
  { id: 'b2024-25', batch_name: '2024-25', start_year: 2024, end_year: 2025, is_active: false },
  { id: 'b2025-26', batch_name: '2025-26', start_year: 2025, end_year: 2026, is_active: true },
  { id: 'b2026-27', batch_name: '2026-27', start_year: 2026, end_year: 2027, is_active: false },
  { id: 'b2027-28', batch_name: '2027-28', start_year: 2027, end_year: 2028, is_active: false }
];

const DEFAULT_EXPENSES = [
  {
    "id": "exp_rent_24_07",
    "name": "Office Rent",
    "date": "2024-07-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-07-01T10:00:00Z",
    "updatedAt": "2024-07-01T10:00:00Z"
  },
  {
    "id": "exp_self_002",
    "name": "personal",
    "date": "2024-07-04",
    "amount": 7000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash for stationery supplies",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-07-04T12:00:00Z",
    "updatedAt": "2024-07-04T12:00:00Z"
  },
  {
    "id": "exp_soft_24_07",
    "name": "SaaS Tools & Cloud",
    "date": "2024-07-05",
    "amount": 4170,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-07-05T09:00:00Z",
    "updatedAt": "2024-07-05T09:00:00Z"
  },
  {
    "id": "exp_self_004",
    "name": "personal",
    "date": "2024-07-06",
    "amount": 5000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Pooja ceremony cash expenses",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-07-06T12:00:00Z",
    "updatedAt": "2024-07-06T12:00:00Z"
  },
  {
    "id": "exp_self_001",
    "name": "personal",
    "date": "2024-07-07",
    "amount": 10000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Mobile recharge company phone",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-07-07T12:00:00Z",
    "updatedAt": "2024-07-07T12:00:00Z"
  },
  {
    "id": "exp_util_24_07",
    "name": "Electricity & Internet",
    "date": "2024-07-10",
    "amount": 8887,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-07-10T12:00:00Z",
    "updatedAt": "2024-07-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_24_07",
    "name": "Online Advertisements",
    "date": "2024-07-15",
    "amount": 10432,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-07-15T14:00:00Z",
    "updatedAt": "2024-07-15T14:00:00Z"
  },
  {
    "id": "exp_self_003",
    "name": "personal",
    "date": "2024-07-18",
    "amount": 12000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Emergency office supplies cash payment",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-07-18T12:00:00Z",
    "updatedAt": "2024-07-18T12:00:00Z"
  },
  {
    "id": "exp_sup_24_07",
    "name": "Stationery & Pantry Supplies",
    "date": "2024-07-22",
    "amount": 2985,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-07-22T11:00:00Z",
    "updatedAt": "2024-07-22T11:00:00Z"
  },
  {
    "id": "exp_prof_24_07",
    "name": "Accounting & Tax Services",
    "date": "2024-07-25",
    "amount": 12875,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-07-25T16:00:00Z",
    "updatedAt": "2024-07-25T16:00:00Z"
  },
  {
    "id": "exp_rent_24_08",
    "name": "Office Rent",
    "date": "2024-08-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-08-01T10:00:00Z",
    "updatedAt": "2024-08-01T10:00:00Z"
  },
  {
    "id": "exp_soft_24_08",
    "name": "SaaS Tools & Cloud",
    "date": "2024-08-05",
    "amount": 5771,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-08-05T09:00:00Z",
    "updatedAt": "2024-08-05T09:00:00Z"
  },
  {
    "id": "exp_util_24_08",
    "name": "Electricity & Internet",
    "date": "2024-08-10",
    "amount": 9393,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-08-10T12:00:00Z",
    "updatedAt": "2024-08-10T12:00:00Z"
  },
  {
    "id": "exp_self_008",
    "name": "personal",
    "date": "2024-08-14",
    "amount": 20000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Owner monthly draw transfer",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-08-14T12:00:00Z",
    "updatedAt": "2024-08-14T12:00:00Z"
  },
  {
    "id": "exp_mkt_24_08",
    "name": "Online Advertisements",
    "date": "2024-08-15",
    "amount": 7503,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-08-15T14:00:00Z",
    "updatedAt": "2024-08-15T14:00:00Z"
  },
  {
    "id": "exp_self_006",
    "name": "personal",
    "date": "2024-08-20",
    "amount": 18000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Online printer maintenance pay",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-08-20T12:00:00Z",
    "updatedAt": "2024-08-20T12:00:00Z"
  },
  {
    "id": "exp_self_007",
    "name": "personal",
    "date": "2024-08-21",
    "amount": 11000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Emergency office supplies cash payment",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-08-21T12:00:00Z",
    "updatedAt": "2024-08-21T12:00:00Z"
  },
  {
    "id": "exp_sup_24_08",
    "name": "Stationery & Pantry Supplies",
    "date": "2024-08-22",
    "amount": 2067,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-08-22T11:00:00Z",
    "updatedAt": "2024-08-22T11:00:00Z"
  },
  {
    "id": "exp_self_005",
    "name": "personal",
    "date": "2024-08-28",
    "amount": 24000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Director personal draw",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-08-28T12:00:00Z",
    "updatedAt": "2024-08-28T12:00:00Z"
  },
  {
    "id": "exp_rent_24_09",
    "name": "Office Rent",
    "date": "2024-09-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-09-01T10:00:00Z",
    "updatedAt": "2024-09-01T10:00:00Z"
  },
  {
    "id": "exp_soft_24_09",
    "name": "SaaS Tools & Cloud",
    "date": "2024-09-05",
    "amount": 4747,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-09-05T09:00:00Z",
    "updatedAt": "2024-09-05T09:00:00Z"
  },
  {
    "id": "exp_util_24_09",
    "name": "Electricity & Internet",
    "date": "2024-09-10",
    "amount": 8853,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-09-10T12:00:00Z",
    "updatedAt": "2024-09-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_24_09",
    "name": "Online Advertisements",
    "date": "2024-09-15",
    "amount": 7026,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-09-15T14:00:00Z",
    "updatedAt": "2024-09-15T14:00:00Z"
  },
  {
    "id": "exp_self_009",
    "name": "personal",
    "date": "2024-09-16",
    "amount": 6000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash for office snacks & refreshments",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-09-16T12:00:00Z",
    "updatedAt": "2024-09-16T12:00:00Z"
  },
  {
    "id": "exp_sup_24_09",
    "name": "Stationery & Pantry Supplies",
    "date": "2024-09-22",
    "amount": 1213,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-09-22T11:00:00Z",
    "updatedAt": "2024-09-22T11:00:00Z"
  },
  {
    "id": "exp_prof_24_09",
    "name": "Accounting & Tax Services",
    "date": "2024-09-25",
    "amount": 14401,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-09-25T16:00:00Z",
    "updatedAt": "2024-09-25T16:00:00Z"
  },
  {
    "id": "exp_self_010",
    "name": "personal",
    "date": "2024-09-26",
    "amount": 8000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Team evening snacks (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-09-26T12:00:00Z",
    "updatedAt": "2024-09-26T12:00:00Z"
  },
  {
    "id": "exp_rent_24_10",
    "name": "Office Rent",
    "date": "2024-10-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-10-01T10:00:00Z",
    "updatedAt": "2024-10-01T10:00:00Z"
  },
  {
    "id": "exp_soft_24_10",
    "name": "SaaS Tools & Cloud",
    "date": "2024-10-05",
    "amount": 5790,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-10-05T09:00:00Z",
    "updatedAt": "2024-10-05T09:00:00Z"
  },
  {
    "id": "exp_self_013",
    "name": "personal",
    "date": "2024-10-08",
    "amount": 7000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Broadband refill via GPay",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-10-08T12:00:00Z",
    "updatedAt": "2024-10-08T12:00:00Z"
  },
  {
    "id": "exp_util_24_10",
    "name": "Electricity & Internet",
    "date": "2024-10-10",
    "amount": 9960,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-10-10T12:00:00Z",
    "updatedAt": "2024-10-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_24_10",
    "name": "Online Advertisements",
    "date": "2024-10-15",
    "amount": 8491,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-10-15T14:00:00Z",
    "updatedAt": "2024-10-15T14:00:00Z"
  },
  {
    "id": "exp_self_012",
    "name": "personal",
    "date": "2024-10-20",
    "amount": 13000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Team evening snacks (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-10-20T12:00:00Z",
    "updatedAt": "2024-10-20T12:00:00Z"
  },
  {
    "id": "exp_sup_24_10",
    "name": "Stationery & Pantry Supplies",
    "date": "2024-10-22",
    "amount": 1814,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-10-22T11:00:00Z",
    "updatedAt": "2024-10-22T11:00:00Z"
  },
  {
    "id": "exp_self_011",
    "name": "personal",
    "date": "2024-10-26",
    "amount": 9000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Team evening snacks (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-10-26T12:00:00Z",
    "updatedAt": "2024-10-26T12:00:00Z"
  },
  {
    "id": "exp_rent_24_11",
    "name": "Office Rent",
    "date": "2024-11-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-11-01T10:00:00Z",
    "updatedAt": "2024-11-01T10:00:00Z"
  },
  {
    "id": "exp_soft_24_11",
    "name": "SaaS Tools & Cloud",
    "date": "2024-11-05",
    "amount": 5610,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-11-05T09:00:00Z",
    "updatedAt": "2024-11-05T09:00:00Z"
  },
  {
    "id": "exp_self_015",
    "name": "personal",
    "date": "2024-11-06",
    "amount": 5000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Hardware store payment (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-11-06T12:00:00Z",
    "updatedAt": "2024-11-06T12:00:00Z"
  },
  {
    "id": "exp_util_24_11",
    "name": "Electricity & Internet",
    "date": "2024-11-10",
    "amount": 9706,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-11-10T12:00:00Z",
    "updatedAt": "2024-11-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_24_11",
    "name": "Online Advertisements",
    "date": "2024-11-15",
    "amount": 7059,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-11-15T14:00:00Z",
    "updatedAt": "2024-11-15T14:00:00Z"
  },
  {
    "id": "exp_sup_24_11",
    "name": "Stationery & Pantry Supplies",
    "date": "2024-11-22",
    "amount": 2950,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-11-22T11:00:00Z",
    "updatedAt": "2024-11-22T11:00:00Z"
  },
  {
    "id": "exp_prof_24_11",
    "name": "Accounting & Tax Services",
    "date": "2024-11-25",
    "amount": 13817,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-11-25T16:00:00Z",
    "updatedAt": "2024-11-25T16:00:00Z"
  },
  {
    "id": "exp_self_014",
    "name": "personal",
    "date": "2024-11-28",
    "amount": 7000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Miscellaneous cash draw",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-11-28T12:00:00Z",
    "updatedAt": "2024-11-28T12:00:00Z"
  },
  {
    "id": "exp_rent_24_12",
    "name": "Office Rent",
    "date": "2024-12-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z"
  },
  {
    "id": "exp_soft_24_12",
    "name": "SaaS Tools & Cloud",
    "date": "2024-12-05",
    "amount": 3529,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-12-05T09:00:00Z",
    "updatedAt": "2024-12-05T09:00:00Z"
  },
  {
    "id": "exp_self_016",
    "name": "personal",
    "date": "2024-12-08",
    "amount": 12000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Miscellaneous cash draw",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-12-08T12:00:00Z",
    "updatedAt": "2024-12-08T12:00:00Z"
  },
  {
    "id": "exp_util_24_12",
    "name": "Electricity & Internet",
    "date": "2024-12-10",
    "amount": 8821,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-12-10T12:00:00Z",
    "updatedAt": "2024-12-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_24_12",
    "name": "Online Advertisements",
    "date": "2024-12-15",
    "amount": 6135,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-12-15T14:00:00Z",
    "updatedAt": "2024-12-15T14:00:00Z"
  },
  {
    "id": "exp_self_017",
    "name": "personal",
    "date": "2024-12-20",
    "amount": 10000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Dinner with client (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2024-12-20T12:00:00Z",
    "updatedAt": "2024-12-20T12:00:00Z"
  },
  {
    "id": "exp_sup_24_12",
    "name": "Stationery & Pantry Supplies",
    "date": "2024-12-22",
    "amount": 1424,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2024-12-22T11:00:00Z",
    "updatedAt": "2024-12-22T11:00:00Z"
  },
  {
    "id": "exp_rent_25_01",
    "name": "Office Rent",
    "date": "2025-01-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-01T10:00:00Z"
  },
  {
    "id": "exp_soft_25_01",
    "name": "SaaS Tools & Cloud",
    "date": "2025-01-05",
    "amount": 4234,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-01-05T09:00:00Z",
    "updatedAt": "2025-01-05T09:00:00Z"
  },
  {
    "id": "exp_self_020",
    "name": "personal",
    "date": "2025-01-08",
    "amount": 6000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Hardware store payment (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-01-08T12:00:00Z",
    "updatedAt": "2025-01-08T12:00:00Z"
  },
  {
    "id": "exp_self_021",
    "name": "personal",
    "date": "2025-01-09",
    "amount": 14000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Dinner with client (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-01-09T12:00:00Z",
    "updatedAt": "2025-01-09T12:00:00Z"
  },
  {
    "id": "exp_util_25_01",
    "name": "Electricity & Internet",
    "date": "2025-01-10",
    "amount": 9294,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-01-10T12:00:00Z",
    "updatedAt": "2025-01-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_25_01",
    "name": "Online Advertisements",
    "date": "2025-01-15",
    "amount": 10973,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-01-15T14:00:00Z",
    "updatedAt": "2025-01-15T14:00:00Z"
  },
  {
    "id": "exp_sup_25_01",
    "name": "Stationery & Pantry Supplies",
    "date": "2025-01-22",
    "amount": 2249,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-01-22T11:00:00Z",
    "updatedAt": "2025-01-22T11:00:00Z"
  },
  {
    "id": "exp_self_019",
    "name": "personal",
    "date": "2025-01-23",
    "amount": 9000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Miscellaneous cash draw",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-01-23T12:00:00Z",
    "updatedAt": "2025-01-23T12:00:00Z"
  },
  {
    "id": "exp_prof_25_01",
    "name": "Accounting & Tax Services",
    "date": "2025-01-25",
    "amount": 10919,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-01-25T16:00:00Z",
    "updatedAt": "2025-01-25T16:00:00Z"
  },
  {
    "id": "exp_self_018",
    "name": "personal",
    "date": "2025-01-28",
    "amount": 10000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Mobile recharge company phone",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-01-28T12:00:00Z",
    "updatedAt": "2025-01-28T12:00:00Z"
  },
  {
    "id": "exp_rent_25_02",
    "name": "Office Rent",
    "date": "2025-02-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-02-01T10:00:00Z",
    "updatedAt": "2025-02-01T10:00:00Z"
  },
  {
    "id": "exp_self_023",
    "name": "personal",
    "date": "2025-02-04",
    "amount": 12000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Hardware store payment (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-02-04T12:00:00Z",
    "updatedAt": "2025-02-04T12:00:00Z"
  },
  {
    "id": "exp_soft_25_02",
    "name": "SaaS Tools & Cloud",
    "date": "2025-02-05",
    "amount": 4553,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-02-05T09:00:00Z",
    "updatedAt": "2025-02-05T09:00:00Z"
  },
  {
    "id": "exp_self_024",
    "name": "personal",
    "date": "2025-02-06",
    "amount": 4000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Pooja ceremony cash expenses",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-02-06T12:00:00Z",
    "updatedAt": "2025-02-06T12:00:00Z"
  },
  {
    "id": "exp_util_25_02",
    "name": "Electricity & Internet",
    "date": "2025-02-10",
    "amount": 9519,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-02-10T12:00:00Z",
    "updatedAt": "2025-02-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_25_02",
    "name": "Online Advertisements",
    "date": "2025-02-15",
    "amount": 7194,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-02-15T14:00:00Z",
    "updatedAt": "2025-02-15T14:00:00Z"
  },
  {
    "id": "exp_sup_25_02",
    "name": "Stationery & Pantry Supplies",
    "date": "2025-02-22",
    "amount": 3286,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-02-22T11:00:00Z",
    "updatedAt": "2025-02-22T11:00:00Z"
  },
  {
    "id": "exp_self_022",
    "name": "personal",
    "date": "2025-02-26",
    "amount": 11000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office desk plants purchase",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-02-26T12:00:00Z",
    "updatedAt": "2025-02-26T12:00:00Z"
  },
  {
    "id": "exp_rent_25_03",
    "name": "Office Rent",
    "date": "2025-03-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-03-01T10:00:00Z",
    "updatedAt": "2025-03-01T10:00:00Z"
  },
  {
    "id": "exp_soft_25_03",
    "name": "SaaS Tools & Cloud",
    "date": "2025-03-05",
    "amount": 4571,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-03-05T09:00:00Z",
    "updatedAt": "2025-03-05T09:00:00Z"
  },
  {
    "id": "exp_util_25_03",
    "name": "Electricity & Internet",
    "date": "2025-03-10",
    "amount": 9880,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-03-10T12:00:00Z",
    "updatedAt": "2025-03-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_25_03",
    "name": "Online Advertisements",
    "date": "2025-03-15",
    "amount": 7781,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-03-15T14:00:00Z",
    "updatedAt": "2025-03-15T14:00:00Z"
  },
  {
    "id": "exp_self_025",
    "name": "personal",
    "date": "2025-03-16",
    "amount": 8000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office petty cash replenishment",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-03-16T12:00:00Z",
    "updatedAt": "2025-03-16T12:00:00Z"
  },
  {
    "id": "exp_self_026",
    "name": "personal",
    "date": "2025-03-20",
    "amount": 10000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Mobile recharge company phone",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-03-20T12:00:00Z",
    "updatedAt": "2025-03-20T12:00:00Z"
  },
  {
    "id": "exp_sup_25_03",
    "name": "Stationery & Pantry Supplies",
    "date": "2025-03-22",
    "amount": 3344,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-03-22T11:00:00Z",
    "updatedAt": "2025-03-22T11:00:00Z"
  },
  {
    "id": "exp_prof_25_03",
    "name": "Accounting & Tax Services",
    "date": "2025-03-25",
    "amount": 10939,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-03-25T16:00:00Z",
    "updatedAt": "2025-03-25T16:00:00Z"
  },
  {
    "id": "exp_rent_25_04",
    "name": "Office Rent",
    "date": "2025-04-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-04-01T10:00:00Z",
    "updatedAt": "2025-04-01T10:00:00Z"
  },
  {
    "id": "exp_self_027",
    "name": "personal",
    "date": "2025-04-04",
    "amount": 12000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash for stationery supplies",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-04-04T12:00:00Z",
    "updatedAt": "2025-04-04T12:00:00Z"
  },
  {
    "id": "exp_soft_25_04",
    "name": "SaaS Tools & Cloud",
    "date": "2025-04-05",
    "amount": 4924,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-04-05T09:00:00Z",
    "updatedAt": "2025-04-05T09:00:00Z"
  },
  {
    "id": "exp_util_25_04",
    "name": "Electricity & Internet",
    "date": "2025-04-10",
    "amount": 8662,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-04-10T12:00:00Z",
    "updatedAt": "2025-04-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_25_04",
    "name": "Online Advertisements",
    "date": "2025-04-15",
    "amount": 6007,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-04-15T14:00:00Z",
    "updatedAt": "2025-04-15T14:00:00Z"
  },
  {
    "id": "exp_self_028",
    "name": "personal",
    "date": "2025-04-16",
    "amount": 12000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Water dispenser refill payment",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-04-16T12:00:00Z",
    "updatedAt": "2025-04-16T12:00:00Z"
  },
  {
    "id": "exp_sup_25_04",
    "name": "Stationery & Pantry Supplies",
    "date": "2025-04-22",
    "amount": 3238,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-04-22T11:00:00Z",
    "updatedAt": "2025-04-22T11:00:00Z"
  },
  {
    "id": "exp_rent_25_05",
    "name": "Office Rent",
    "date": "2025-05-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-05-01T10:00:00Z",
    "updatedAt": "2025-05-01T10:00:00Z"
  },
  {
    "id": "exp_soft_25_05",
    "name": "SaaS Tools & Cloud",
    "date": "2025-05-05",
    "amount": 4976,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-05-05T09:00:00Z",
    "updatedAt": "2025-05-05T09:00:00Z"
  },
  {
    "id": "exp_util_25_05",
    "name": "Electricity & Internet",
    "date": "2025-05-10",
    "amount": 9779,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-05-10T12:00:00Z",
    "updatedAt": "2025-05-10T12:00:00Z"
  },
  {
    "id": "exp_self_030",
    "name": "personal",
    "date": "2025-05-12",
    "amount": 7000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Petty cash for courier & local travel",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-05-12T12:00:00Z",
    "updatedAt": "2025-05-12T12:00:00Z"
  },
  {
    "id": "exp_mkt_25_05",
    "name": "Online Advertisements",
    "date": "2025-05-15",
    "amount": 10782,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-05-15T14:00:00Z",
    "updatedAt": "2025-05-15T14:00:00Z"
  },
  {
    "id": "exp_sup_25_05",
    "name": "Stationery & Pantry Supplies",
    "date": "2025-05-22",
    "amount": 3017,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-05-22T11:00:00Z",
    "updatedAt": "2025-05-22T11:00:00Z"
  },
  {
    "id": "exp_prof_25_05",
    "name": "Accounting & Tax Services",
    "date": "2025-05-25",
    "amount": 10711,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-05-25T16:00:00Z",
    "updatedAt": "2025-05-25T16:00:00Z"
  },
  {
    "id": "exp_self_029",
    "name": "personal",
    "date": "2025-05-28",
    "amount": 24000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Owner monthly draw transfer",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-05-28T12:00:00Z",
    "updatedAt": "2025-05-28T12:00:00Z"
  },
  {
    "id": "exp_rent_25_06",
    "name": "Office Rent",
    "date": "2025-06-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-06-01T10:00:00Z",
    "updatedAt": "2025-06-01T10:00:00Z"
  },
  {
    "id": "exp_self_031",
    "name": "personal",
    "date": "2025-06-03",
    "amount": 10000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash for stationery supplies",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-06-03T12:00:00Z",
    "updatedAt": "2025-06-03T12:00:00Z"
  },
  {
    "id": "exp_soft_25_06",
    "name": "SaaS Tools & Cloud",
    "date": "2025-06-05",
    "amount": 4312,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-06-05T09:00:00Z",
    "updatedAt": "2025-06-05T09:00:00Z"
  },
  {
    "id": "exp_util_25_06",
    "name": "Electricity & Internet",
    "date": "2025-06-10",
    "amount": 9292,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-06-10T12:00:00Z",
    "updatedAt": "2025-06-10T12:00:00Z"
  },
  {
    "id": "exp_self_033",
    "name": "personal",
    "date": "2025-06-13",
    "amount": 9000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Hardware store payment (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-06-13T12:00:00Z",
    "updatedAt": "2025-06-13T12:00:00Z"
  },
  {
    "id": "exp_mkt_25_06",
    "name": "Online Advertisements",
    "date": "2025-06-15",
    "amount": 6340,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-06-15T14:00:00Z",
    "updatedAt": "2025-06-15T14:00:00Z"
  },
  {
    "id": "exp_sup_25_06",
    "name": "Stationery & Pantry Supplies",
    "date": "2025-06-22",
    "amount": 3410,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2024-25",
    "createdAt": "2025-06-22T11:00:00Z",
    "updatedAt": "2025-06-22T11:00:00Z"
  },
  {
    "id": "exp_self_032",
    "name": "personal",
    "date": "2025-06-26",
    "amount": 11000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Vendor cash payment for local repair",
    "isSelfTransaction": true,
    "batchId": "b2024-25",
    "createdAt": "2025-06-26T12:00:00Z",
    "updatedAt": "2025-06-26T12:00:00Z"
  },
  {
    "id": "exp_rent_25_07",
    "name": "Office Rent",
    "date": "2025-07-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-07-01T10:00:00Z",
    "updatedAt": "2025-07-01T10:00:00Z"
  },
  {
    "id": "exp_soft_25_07",
    "name": "SaaS Tools & Cloud",
    "date": "2025-07-05",
    "amount": 3806,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-07-05T09:00:00Z",
    "updatedAt": "2025-07-05T09:00:00Z"
  },
  {
    "id": "exp_self_036",
    "name": "personal",
    "date": "2025-07-09",
    "amount": 7000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office petty cash replenishment",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-07-09T12:00:00Z",
    "updatedAt": "2025-07-09T12:00:00Z"
  },
  {
    "id": "exp_util_25_07",
    "name": "Electricity & Internet",
    "date": "2025-07-10",
    "amount": 8624,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-07-10T12:00:00Z",
    "updatedAt": "2025-07-10T12:00:00Z"
  },
  {
    "id": "exp_self_034",
    "name": "personal",
    "date": "2025-07-13",
    "amount": 12000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office petty cash replenishment",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-07-13T12:00:00Z",
    "updatedAt": "2025-07-13T12:00:00Z"
  },
  {
    "id": "exp_mkt_25_07",
    "name": "Online Advertisements",
    "date": "2025-07-15",
    "amount": 6076,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-07-15T14:00:00Z",
    "updatedAt": "2025-07-15T14:00:00Z"
  },
  {
    "id": "exp_sup_25_07",
    "name": "Stationery & Pantry Supplies",
    "date": "2025-07-22",
    "amount": 2000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-07-22T11:00:00Z",
    "updatedAt": "2025-07-22T11:00:00Z"
  },
  {
    "id": "exp_self_035",
    "name": "personal",
    "date": "2025-07-23",
    "amount": 29000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Personal reimbursement payout",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-07-23T12:00:00Z",
    "updatedAt": "2025-07-23T12:00:00Z"
  },
  {
    "id": "exp_prof_25_07",
    "name": "Accounting & Tax Services",
    "date": "2025-07-25",
    "amount": 14434,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-07-25T16:00:00Z",
    "updatedAt": "2025-07-25T16:00:00Z"
  },
  {
    "id": "exp_rent_25_08",
    "name": "Office Rent",
    "date": "2025-08-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-08-01T10:00:00Z",
    "updatedAt": "2025-08-01T10:00:00Z"
  },
  {
    "id": "exp_soft_25_08",
    "name": "SaaS Tools & Cloud",
    "date": "2025-08-05",
    "amount": 3741,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-08-05T09:00:00Z",
    "updatedAt": "2025-08-05T09:00:00Z"
  },
  {
    "id": "exp_self_039",
    "name": "personal",
    "date": "2025-08-08",
    "amount": 12000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash for stationery supplies",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-08-08T12:00:00Z",
    "updatedAt": "2025-08-08T12:00:00Z"
  },
  {
    "id": "exp_util_25_08",
    "name": "Electricity & Internet",
    "date": "2025-08-10",
    "amount": 8524,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-08-10T12:00:00Z",
    "updatedAt": "2025-08-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_25_08",
    "name": "Online Advertisements",
    "date": "2025-08-15",
    "amount": 6209,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-08-15T14:00:00Z",
    "updatedAt": "2025-08-15T14:00:00Z"
  },
  {
    "id": "exp_self_037",
    "name": "personal",
    "date": "2025-08-17",
    "amount": 12000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Personal reimbursement payout",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-08-17T12:00:00Z",
    "updatedAt": "2025-08-17T12:00:00Z"
  },
  {
    "id": "exp_self_038",
    "name": "personal",
    "date": "2025-08-21",
    "amount": 4000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash for office snacks & refreshments",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-08-21T12:00:00Z",
    "updatedAt": "2025-08-21T12:00:00Z"
  },
  {
    "id": "exp_sup_25_08",
    "name": "Stationery & Pantry Supplies",
    "date": "2025-08-22",
    "amount": 2257,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-08-22T11:00:00Z",
    "updatedAt": "2025-08-22T11:00:00Z"
  },
  {
    "id": "exp_rent_25_09",
    "name": "Office Rent",
    "date": "2025-09-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-09-01T10:00:00Z",
    "updatedAt": "2025-09-01T10:00:00Z"
  },
  {
    "id": "exp_soft_25_09",
    "name": "SaaS Tools & Cloud",
    "date": "2025-09-05",
    "amount": 3724,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-09-05T09:00:00Z",
    "updatedAt": "2025-09-05T09:00:00Z"
  },
  {
    "id": "exp_self_043",
    "name": "personal",
    "date": "2025-09-09",
    "amount": 6000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Hardware store payment (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-09-09T12:00:00Z",
    "updatedAt": "2025-09-09T12:00:00Z"
  },
  {
    "id": "exp_util_25_09",
    "name": "Electricity & Internet",
    "date": "2025-09-10",
    "amount": 9192,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-09-10T12:00:00Z",
    "updatedAt": "2025-09-10T12:00:00Z"
  },
  {
    "id": "exp_self_040",
    "name": "personal",
    "date": "2025-09-12",
    "amount": 10000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office petty cash replenishment",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-09-12T12:00:00Z",
    "updatedAt": "2025-09-12T12:00:00Z"
  },
  {
    "id": "exp_mkt_25_09",
    "name": "Online Advertisements",
    "date": "2025-09-15",
    "amount": 8320,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-09-15T14:00:00Z",
    "updatedAt": "2025-09-15T14:00:00Z"
  },
  {
    "id": "exp_self_042",
    "name": "personal",
    "date": "2025-09-20",
    "amount": 6000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash for office snacks & refreshments",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-09-20T12:00:00Z",
    "updatedAt": "2025-09-20T12:00:00Z"
  },
  {
    "id": "exp_sup_25_09",
    "name": "Stationery & Pantry Supplies",
    "date": "2025-09-22",
    "amount": 3272,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-09-22T11:00:00Z",
    "updatedAt": "2025-09-22T11:00:00Z"
  },
  {
    "id": "exp_prof_25_09",
    "name": "Accounting & Tax Services",
    "date": "2025-09-25",
    "amount": 10280,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-09-25T16:00:00Z",
    "updatedAt": "2025-09-25T16:00:00Z"
  },
  {
    "id": "exp_self_041",
    "name": "personal",
    "date": "2025-09-27",
    "amount": 13000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Mobile recharge company phone",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-09-27T12:00:00Z",
    "updatedAt": "2025-09-27T12:00:00Z"
  },
  {
    "id": "exp_rent_25_10",
    "name": "Office Rent",
    "date": "2025-10-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-10-01T10:00:00Z",
    "updatedAt": "2025-10-01T10:00:00Z"
  },
  {
    "id": "exp_self_044",
    "name": "personal",
    "date": "2025-10-03",
    "amount": 17000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Owner monthly draw transfer",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-10-03T12:00:00Z",
    "updatedAt": "2025-10-03T12:00:00Z"
  },
  {
    "id": "exp_soft_25_10",
    "name": "SaaS Tools & Cloud",
    "date": "2025-10-05",
    "amount": 5714,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-10-05T09:00:00Z",
    "updatedAt": "2025-10-05T09:00:00Z"
  },
  {
    "id": "exp_util_25_10",
    "name": "Electricity & Internet",
    "date": "2025-10-10",
    "amount": 9223,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-10-10T12:00:00Z",
    "updatedAt": "2025-10-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_25_10",
    "name": "Online Advertisements",
    "date": "2025-10-15",
    "amount": 8145,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-10-15T14:00:00Z",
    "updatedAt": "2025-10-15T14:00:00Z"
  },
  {
    "id": "exp_self_045",
    "name": "personal",
    "date": "2025-10-18",
    "amount": 21000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Director personal draw",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-10-18T12:00:00Z",
    "updatedAt": "2025-10-18T12:00:00Z"
  },
  {
    "id": "exp_sup_25_10",
    "name": "Stationery & Pantry Supplies",
    "date": "2025-10-22",
    "amount": 1428,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-10-22T11:00:00Z",
    "updatedAt": "2025-10-22T11:00:00Z"
  },
  {
    "id": "exp_rent_25_11",
    "name": "Office Rent",
    "date": "2025-11-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-11-01T10:00:00Z",
    "updatedAt": "2025-11-01T10:00:00Z"
  },
  {
    "id": "exp_soft_25_11",
    "name": "SaaS Tools & Cloud",
    "date": "2025-11-05",
    "amount": 4590,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-11-05T09:00:00Z",
    "updatedAt": "2025-11-05T09:00:00Z"
  },
  {
    "id": "exp_util_25_11",
    "name": "Electricity & Internet",
    "date": "2025-11-10",
    "amount": 9610,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-11-10T12:00:00Z",
    "updatedAt": "2025-11-10T12:00:00Z"
  },
  {
    "id": "exp_self_047",
    "name": "personal",
    "date": "2025-11-13",
    "amount": 5000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Miscellaneous cash draw",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-11-13T12:00:00Z",
    "updatedAt": "2025-11-13T12:00:00Z"
  },
  {
    "id": "exp_mkt_25_11",
    "name": "Online Advertisements",
    "date": "2025-11-15",
    "amount": 8288,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-11-15T14:00:00Z",
    "updatedAt": "2025-11-15T14:00:00Z"
  },
  {
    "id": "exp_self_046",
    "name": "personal",
    "date": "2025-11-17",
    "amount": 6000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office petty cash replenishment",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-11-17T12:00:00Z",
    "updatedAt": "2025-11-17T12:00:00Z"
  },
  {
    "id": "exp_sup_25_11",
    "name": "Stationery & Pantry Supplies",
    "date": "2025-11-22",
    "amount": 2314,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-11-22T11:00:00Z",
    "updatedAt": "2025-11-22T11:00:00Z"
  },
  {
    "id": "exp_prof_25_11",
    "name": "Accounting & Tax Services",
    "date": "2025-11-25",
    "amount": 10126,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-11-25T16:00:00Z",
    "updatedAt": "2025-11-25T16:00:00Z"
  },
  {
    "id": "exp_rent_25_12",
    "name": "Office Rent",
    "date": "2025-12-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z"
  },
  {
    "id": "exp_soft_25_12",
    "name": "SaaS Tools & Cloud",
    "date": "2025-12-05",
    "amount": 5707,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-12-05T09:00:00Z",
    "updatedAt": "2025-12-05T09:00:00Z"
  },
  {
    "id": "exp_util_25_12",
    "name": "Electricity & Internet",
    "date": "2025-12-10",
    "amount": 9432,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-12-10T12:00:00Z",
    "updatedAt": "2025-12-10T12:00:00Z"
  },
  {
    "id": "exp_self_049",
    "name": "personal",
    "date": "2025-12-13",
    "amount": 13000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Water dispenser refill payment",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-12-13T12:00:00Z",
    "updatedAt": "2025-12-13T12:00:00Z"
  },
  {
    "id": "exp_mkt_25_12",
    "name": "Online Advertisements",
    "date": "2025-12-15",
    "amount": 10065,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-12-15T14:00:00Z",
    "updatedAt": "2025-12-15T14:00:00Z"
  },
  {
    "id": "exp_self_050",
    "name": "personal",
    "date": "2025-12-19",
    "amount": 8000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Hardware store payment (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-12-19T12:00:00Z",
    "updatedAt": "2025-12-19T12:00:00Z"
  },
  {
    "id": "exp_sup_25_12",
    "name": "Stationery & Pantry Supplies",
    "date": "2025-12-22",
    "amount": 2018,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2025-12-22T11:00:00Z",
    "updatedAt": "2025-12-22T11:00:00Z"
  },
  {
    "id": "exp_self_048",
    "name": "personal",
    "date": "2025-12-26",
    "amount": 15000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Fuel charge via UPI",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2025-12-26T12:00:00Z",
    "updatedAt": "2025-12-26T12:00:00Z"
  },
  {
    "id": "exp_rent_26_01",
    "name": "Office Rent",
    "date": "2026-01-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-01-01T10:00:00Z"
  },
  {
    "id": "exp_soft_26_01",
    "name": "SaaS Tools & Cloud",
    "date": "2026-01-05",
    "amount": 5251,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-01-05T09:00:00Z",
    "updatedAt": "2026-01-05T09:00:00Z"
  },
  {
    "id": "exp_self_052",
    "name": "personal",
    "date": "2026-01-08",
    "amount": 7000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office petty cash replenishment",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-01-08T12:00:00Z",
    "updatedAt": "2026-01-08T12:00:00Z"
  },
  {
    "id": "exp_util_26_01",
    "name": "Electricity & Internet",
    "date": "2026-01-10",
    "amount": 8579,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-01-10T12:00:00Z",
    "updatedAt": "2026-01-10T12:00:00Z"
  },
  {
    "id": "exp_self_053",
    "name": "personal",
    "date": "2026-01-12",
    "amount": 7000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Broadband refill via GPay",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-01-12T12:00:00Z",
    "updatedAt": "2026-01-12T12:00:00Z"
  },
  {
    "id": "exp_mkt_26_01",
    "name": "Online Advertisements",
    "date": "2026-01-15",
    "amount": 6033,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-01-15T14:00:00Z",
    "updatedAt": "2026-01-15T14:00:00Z"
  },
  {
    "id": "exp_self_051",
    "name": "personal",
    "date": "2026-01-21",
    "amount": 5000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash for office snacks & refreshments",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-01-21T12:00:00Z",
    "updatedAt": "2026-01-21T12:00:00Z"
  },
  {
    "id": "exp_sup_26_01",
    "name": "Stationery & Pantry Supplies",
    "date": "2026-01-22",
    "amount": 2846,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-01-22T11:00:00Z",
    "updatedAt": "2026-01-22T11:00:00Z"
  },
  {
    "id": "exp_prof_26_01",
    "name": "Accounting & Tax Services",
    "date": "2026-01-25",
    "amount": 10842,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-01-25T16:00:00Z",
    "updatedAt": "2026-01-25T16:00:00Z"
  },
  {
    "id": "exp_rent_26_02",
    "name": "Office Rent",
    "date": "2026-02-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-02-01T10:00:00Z",
    "updatedAt": "2026-02-01T10:00:00Z"
  },
  {
    "id": "exp_soft_26_02",
    "name": "SaaS Tools & Cloud",
    "date": "2026-02-05",
    "amount": 5255,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-02-05T09:00:00Z",
    "updatedAt": "2026-02-05T09:00:00Z"
  },
  {
    "id": "exp_self_056",
    "name": "personal",
    "date": "2026-02-06",
    "amount": 5000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Pooja ceremony cash expenses",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-02-06T12:00:00Z",
    "updatedAt": "2026-02-06T12:00:00Z"
  },
  {
    "id": "exp_self_055",
    "name": "personal",
    "date": "2026-02-08",
    "amount": 12000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office desk plants purchase",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-02-08T12:00:00Z",
    "updatedAt": "2026-02-08T12:00:00Z"
  },
  {
    "id": "exp_util_26_02",
    "name": "Electricity & Internet",
    "date": "2026-02-10",
    "amount": 9830,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-02-10T12:00:00Z",
    "updatedAt": "2026-02-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_26_02",
    "name": "Online Advertisements",
    "date": "2026-02-15",
    "amount": 9740,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-02-15T14:00:00Z",
    "updatedAt": "2026-02-15T14:00:00Z"
  },
  {
    "id": "exp_self_054",
    "name": "personal",
    "date": "2026-02-16",
    "amount": 10000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash advance for weekend team event",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-02-16T12:00:00Z",
    "updatedAt": "2026-02-16T12:00:00Z"
  },
  {
    "id": "exp_sup_26_02",
    "name": "Stationery & Pantry Supplies",
    "date": "2026-02-22",
    "amount": 2874,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-02-22T11:00:00Z",
    "updatedAt": "2026-02-22T11:00:00Z"
  },
  {
    "id": "exp_self_057",
    "name": "personal",
    "date": "2026-02-23",
    "amount": 5000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office desk plants purchase",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-02-23T12:00:00Z",
    "updatedAt": "2026-02-23T12:00:00Z"
  },
  {
    "id": "exp_rent_26_03",
    "name": "Office Rent",
    "date": "2026-03-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-03-01T10:00:00Z",
    "updatedAt": "2026-03-01T10:00:00Z"
  },
  {
    "id": "exp_self_058",
    "name": "personal",
    "date": "2026-03-04",
    "amount": 9000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Pooja ceremony cash expenses",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-03-04T12:00:00Z",
    "updatedAt": "2026-03-04T12:00:00Z"
  },
  {
    "id": "exp_soft_26_03",
    "name": "SaaS Tools & Cloud",
    "date": "2026-03-05",
    "amount": 5645,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-03-05T09:00:00Z",
    "updatedAt": "2026-03-05T09:00:00Z"
  },
  {
    "id": "exp_util_26_03",
    "name": "Electricity & Internet",
    "date": "2026-03-10",
    "amount": 8755,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-03-10T12:00:00Z",
    "updatedAt": "2026-03-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_26_03",
    "name": "Online Advertisements",
    "date": "2026-03-15",
    "amount": 10316,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-03-15T14:00:00Z",
    "updatedAt": "2026-03-15T14:00:00Z"
  },
  {
    "id": "exp_self_059",
    "name": "personal",
    "date": "2026-03-17",
    "amount": 12000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Petty cash for courier & local travel",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-03-17T12:00:00Z",
    "updatedAt": "2026-03-17T12:00:00Z"
  },
  {
    "id": "exp_sup_26_03",
    "name": "Stationery & Pantry Supplies",
    "date": "2026-03-22",
    "amount": 1644,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-03-22T11:00:00Z",
    "updatedAt": "2026-03-22T11:00:00Z"
  },
  {
    "id": "exp_self_060",
    "name": "personal",
    "date": "2026-03-23",
    "amount": 11000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Mobile recharge company phone",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-03-23T12:00:00Z",
    "updatedAt": "2026-03-23T12:00:00Z"
  },
  {
    "id": "exp_prof_26_03",
    "name": "Accounting & Tax Services",
    "date": "2026-03-25",
    "amount": 13067,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-03-25T16:00:00Z",
    "updatedAt": "2026-03-25T16:00:00Z"
  },
  {
    "id": "exp_rent_26_04",
    "name": "Office Rent",
    "date": "2026-04-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-04-01T10:00:00Z",
    "updatedAt": "2026-04-01T10:00:00Z"
  },
  {
    "id": "exp_soft_26_04",
    "name": "SaaS Tools & Cloud",
    "date": "2026-04-05",
    "amount": 5217,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-04-05T09:00:00Z",
    "updatedAt": "2026-04-05T09:00:00Z"
  },
  {
    "id": "exp_self_061",
    "name": "personal",
    "date": "2026-04-07",
    "amount": 5000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Team evening snacks (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-04-07T12:00:00Z",
    "updatedAt": "2026-04-07T12:00:00Z"
  },
  {
    "id": "exp_self_063",
    "name": "personal",
    "date": "2026-04-08",
    "amount": 7000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Miscellaneous cash draw",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-04-08T12:00:00Z",
    "updatedAt": "2026-04-08T12:00:00Z"
  },
  {
    "id": "exp_util_26_04",
    "name": "Electricity & Internet",
    "date": "2026-04-10",
    "amount": 8809,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-04-10T12:00:00Z",
    "updatedAt": "2026-04-10T12:00:00Z"
  },
  {
    "id": "exp_self_062",
    "name": "personal",
    "date": "2026-04-14",
    "amount": 17000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Director personal draw",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-04-14T12:00:00Z",
    "updatedAt": "2026-04-14T12:00:00Z"
  },
  {
    "id": "exp_mkt_26_04",
    "name": "Online Advertisements",
    "date": "2026-04-15",
    "amount": 6862,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-04-15T14:00:00Z",
    "updatedAt": "2026-04-15T14:00:00Z"
  },
  {
    "id": "exp_self_064",
    "name": "personal",
    "date": "2026-04-21",
    "amount": 12000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash for office snacks & refreshments",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-04-21T12:00:00Z",
    "updatedAt": "2026-04-21T12:00:00Z"
  },
  {
    "id": "exp_sup_26_04",
    "name": "Stationery & Pantry Supplies",
    "date": "2026-04-22",
    "amount": 2360,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-04-22T11:00:00Z",
    "updatedAt": "2026-04-22T11:00:00Z"
  },
  {
    "id": "exp_rent_26_05",
    "name": "Office Rent",
    "date": "2026-05-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-05-01T10:00:00Z",
    "updatedAt": "2026-05-01T10:00:00Z"
  },
  {
    "id": "exp_self_065",
    "name": "personal",
    "date": "2026-05-04",
    "amount": 15000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Water dispenser refill payment",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-05-04T12:00:00Z",
    "updatedAt": "2026-05-04T12:00:00Z"
  },
  {
    "id": "exp_soft_26_05",
    "name": "SaaS Tools & Cloud",
    "date": "2026-05-05",
    "amount": 3697,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-05-05T09:00:00Z",
    "updatedAt": "2026-05-05T09:00:00Z"
  },
  {
    "id": "exp_util_26_05",
    "name": "Electricity & Internet",
    "date": "2026-05-10",
    "amount": 9087,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-05-10T12:00:00Z",
    "updatedAt": "2026-05-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_26_05",
    "name": "Online Advertisements",
    "date": "2026-05-15",
    "amount": 9534,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-05-15T14:00:00Z",
    "updatedAt": "2026-05-15T14:00:00Z"
  },
  {
    "id": "exp_self_066",
    "name": "personal",
    "date": "2026-05-17",
    "amount": 23000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Owner monthly draw transfer",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-05-17T12:00:00Z",
    "updatedAt": "2026-05-17T12:00:00Z"
  },
  {
    "id": "exp_sup_26_05",
    "name": "Stationery & Pantry Supplies",
    "date": "2026-05-22",
    "amount": 2139,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-05-22T11:00:00Z",
    "updatedAt": "2026-05-22T11:00:00Z"
  },
  {
    "id": "exp_prof_26_05",
    "name": "Accounting & Tax Services",
    "date": "2026-05-25",
    "amount": 14917,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-05-25T16:00:00Z",
    "updatedAt": "2026-05-25T16:00:00Z"
  },
  {
    "id": "exp_rent_26_06",
    "name": "Office Rent",
    "date": "2026-06-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-06-01T10:00:00Z",
    "updatedAt": "2026-06-01T10:00:00Z"
  },
  {
    "id": "exp_soft_26_06",
    "name": "SaaS Tools & Cloud",
    "date": "2026-06-05",
    "amount": 3898,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-06-05T09:00:00Z",
    "updatedAt": "2026-06-05T09:00:00Z"
  },
  {
    "id": "exp_self_068",
    "name": "personal",
    "date": "2026-06-07",
    "amount": 5000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office desk plants purchase",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-06-07T12:00:00Z",
    "updatedAt": "2026-06-07T12:00:00Z"
  },
  {
    "id": "exp_util_26_06",
    "name": "Electricity & Internet",
    "date": "2026-06-10",
    "amount": 9473,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-06-10T12:00:00Z",
    "updatedAt": "2026-06-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_26_06",
    "name": "Online Advertisements",
    "date": "2026-06-15",
    "amount": 8981,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-06-15T14:00:00Z",
    "updatedAt": "2026-06-15T14:00:00Z"
  },
  {
    "id": "exp_sup_26_06",
    "name": "Stationery & Pantry Supplies",
    "date": "2026-06-22",
    "amount": 1485,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2025-26",
    "createdAt": "2026-06-22T11:00:00Z",
    "updatedAt": "2026-06-22T11:00:00Z"
  },
  {
    "id": "exp_self_067",
    "name": "personal",
    "date": "2026-06-24",
    "amount": 5000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Water dispenser refill payment",
    "isSelfTransaction": true,
    "batchId": "b2025-26",
    "createdAt": "2026-06-24T12:00:00Z",
    "updatedAt": "2026-06-24T12:00:00Z"
  },
  {
    "id": "exp_rent_26_07",
    "name": "Office Rent",
    "date": "2026-07-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-07-01T10:00:00Z",
    "updatedAt": "2026-07-01T10:00:00Z"
  },
  {
    "id": "exp_soft_26_07",
    "name": "SaaS Tools & Cloud",
    "date": "2026-07-05",
    "amount": 3703,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-07-05T09:00:00Z",
    "updatedAt": "2026-07-05T09:00:00Z"
  },
  {
    "id": "exp_util_26_07",
    "name": "Electricity & Internet",
    "date": "2026-07-10",
    "amount": 9038,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-07-10T12:00:00Z",
    "updatedAt": "2026-07-10T12:00:00Z"
  },
  {
    "id": "exp_self_071",
    "name": "personal",
    "date": "2026-07-13",
    "amount": 27000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Director personal draw",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-07-13T12:00:00Z",
    "updatedAt": "2026-07-13T12:00:00Z"
  },
  {
    "id": "exp_mkt_26_07",
    "name": "Online Advertisements",
    "date": "2026-07-15",
    "amount": 9706,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-07-15T14:00:00Z",
    "updatedAt": "2026-07-15T14:00:00Z"
  },
  {
    "id": "exp_self_069",
    "name": "personal",
    "date": "2026-07-19",
    "amount": 12000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Petty cash for courier & local travel",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-07-19T12:00:00Z",
    "updatedAt": "2026-07-19T12:00:00Z"
  },
  {
    "id": "exp_self_070",
    "name": "personal",
    "date": "2026-07-21",
    "amount": 13000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Water dispenser refill payment",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-07-21T12:00:00Z",
    "updatedAt": "2026-07-21T12:00:00Z"
  },
  {
    "id": "exp_sup_26_07",
    "name": "Stationery & Pantry Supplies",
    "date": "2026-07-22",
    "amount": 2323,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-07-22T11:00:00Z",
    "updatedAt": "2026-07-22T11:00:00Z"
  },
  {
    "id": "exp_prof_26_07",
    "name": "Accounting & Tax Services",
    "date": "2026-07-25",
    "amount": 13623,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-07-25T16:00:00Z",
    "updatedAt": "2026-07-25T16:00:00Z"
  },
  {
    "id": "exp_rent_26_08",
    "name": "Office Rent",
    "date": "2026-08-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-08-01T10:00:00Z",
    "updatedAt": "2026-08-01T10:00:00Z"
  },
  {
    "id": "exp_self_075",
    "name": "personal",
    "date": "2026-08-04",
    "amount": 23000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Director personal draw",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-08-04T12:00:00Z",
    "updatedAt": "2026-08-04T12:00:00Z"
  },
  {
    "id": "exp_soft_26_08",
    "name": "SaaS Tools & Cloud",
    "date": "2026-08-05",
    "amount": 5699,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-08-05T09:00:00Z",
    "updatedAt": "2026-08-05T09:00:00Z"
  },
  {
    "id": "exp_self_074",
    "name": "personal",
    "date": "2026-08-09",
    "amount": 6000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash for stationery supplies",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-08-09T12:00:00Z",
    "updatedAt": "2026-08-09T12:00:00Z"
  },
  {
    "id": "exp_util_26_08",
    "name": "Electricity & Internet",
    "date": "2026-08-10",
    "amount": 9491,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-08-10T12:00:00Z",
    "updatedAt": "2026-08-10T12:00:00Z"
  },
  {
    "id": "exp_self_072",
    "name": "personal",
    "date": "2026-08-12",
    "amount": 10000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Water dispenser refill payment",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-08-12T12:00:00Z",
    "updatedAt": "2026-08-12T12:00:00Z"
  },
  {
    "id": "exp_mkt_26_08",
    "name": "Online Advertisements",
    "date": "2026-08-15",
    "amount": 10070,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-08-15T14:00:00Z",
    "updatedAt": "2026-08-15T14:00:00Z"
  },
  {
    "id": "exp_sup_26_08",
    "name": "Stationery & Pantry Supplies",
    "date": "2026-08-22",
    "amount": 2349,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-08-22T11:00:00Z",
    "updatedAt": "2026-08-22T11:00:00Z"
  },
  {
    "id": "exp_self_073",
    "name": "personal",
    "date": "2026-08-23",
    "amount": 9000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Mobile recharge company phone",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-08-23T12:00:00Z",
    "updatedAt": "2026-08-23T12:00:00Z"
  },
  {
    "id": "exp_rent_26_09",
    "name": "Office Rent",
    "date": "2026-09-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-09-01T10:00:00Z",
    "updatedAt": "2026-09-01T10:00:00Z"
  },
  {
    "id": "exp_self_076",
    "name": "personal",
    "date": "2026-09-03",
    "amount": 15000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Director personal draw",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-09-03T12:00:00Z",
    "updatedAt": "2026-09-03T12:00:00Z"
  },
  {
    "id": "exp_soft_26_09",
    "name": "SaaS Tools & Cloud",
    "date": "2026-09-05",
    "amount": 5484,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-09-05T09:00:00Z",
    "updatedAt": "2026-09-05T09:00:00Z"
  },
  {
    "id": "exp_util_26_09",
    "name": "Electricity & Internet",
    "date": "2026-09-10",
    "amount": 9463,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-09-10T12:00:00Z",
    "updatedAt": "2026-09-10T12:00:00Z"
  },
  {
    "id": "exp_self_078",
    "name": "personal",
    "date": "2026-09-12",
    "amount": 8000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash advance for weekend team event",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-09-12T12:00:00Z",
    "updatedAt": "2026-09-12T12:00:00Z"
  },
  {
    "id": "exp_mkt_26_09",
    "name": "Online Advertisements",
    "date": "2026-09-15",
    "amount": 7399,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-09-15T14:00:00Z",
    "updatedAt": "2026-09-15T14:00:00Z"
  },
  {
    "id": "exp_self_077",
    "name": "personal",
    "date": "2026-09-16",
    "amount": 20000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Owner monthly draw transfer",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-09-16T12:00:00Z",
    "updatedAt": "2026-09-16T12:00:00Z"
  },
  {
    "id": "exp_sup_26_09",
    "name": "Stationery & Pantry Supplies",
    "date": "2026-09-22",
    "amount": 1605,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-09-22T11:00:00Z",
    "updatedAt": "2026-09-22T11:00:00Z"
  },
  {
    "id": "exp_prof_26_09",
    "name": "Accounting & Tax Services",
    "date": "2026-09-25",
    "amount": 11624,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-09-25T16:00:00Z",
    "updatedAt": "2026-09-25T16:00:00Z"
  },
  {
    "id": "exp_rent_26_10",
    "name": "Office Rent",
    "date": "2026-10-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-10-01T10:00:00Z",
    "updatedAt": "2026-10-01T10:00:00Z"
  },
  {
    "id": "exp_self_082",
    "name": "personal",
    "date": "2026-10-03",
    "amount": 8000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office petty cash replenishment",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-10-03T12:00:00Z",
    "updatedAt": "2026-10-03T12:00:00Z"
  },
  {
    "id": "exp_soft_26_10",
    "name": "SaaS Tools & Cloud",
    "date": "2026-10-05",
    "amount": 4370,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-10-05T09:00:00Z",
    "updatedAt": "2026-10-05T09:00:00Z"
  },
  {
    "id": "exp_self_080",
    "name": "personal",
    "date": "2026-10-07",
    "amount": 8000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Emergency office supplies cash payment",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-10-07T12:00:00Z",
    "updatedAt": "2026-10-07T12:00:00Z"
  },
  {
    "id": "exp_util_26_10",
    "name": "Electricity & Internet",
    "date": "2026-10-10",
    "amount": 8927,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-10-10T12:00:00Z",
    "updatedAt": "2026-10-10T12:00:00Z"
  },
  {
    "id": "exp_self_079",
    "name": "personal",
    "date": "2026-10-13",
    "amount": 8000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Mobile recharge company phone",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-10-13T12:00:00Z",
    "updatedAt": "2026-10-13T12:00:00Z"
  },
  {
    "id": "exp_mkt_26_10",
    "name": "Online Advertisements",
    "date": "2026-10-15",
    "amount": 10100,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-10-15T14:00:00Z",
    "updatedAt": "2026-10-15T14:00:00Z"
  },
  {
    "id": "exp_self_081",
    "name": "personal",
    "date": "2026-10-17",
    "amount": 30000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Personal reimbursement payout",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-10-17T12:00:00Z",
    "updatedAt": "2026-10-17T12:00:00Z"
  },
  {
    "id": "exp_sup_26_10",
    "name": "Stationery & Pantry Supplies",
    "date": "2026-10-22",
    "amount": 2549,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-10-22T11:00:00Z",
    "updatedAt": "2026-10-22T11:00:00Z"
  },
  {
    "id": "exp_rent_26_11",
    "name": "Office Rent",
    "date": "2026-11-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-11-01T10:00:00Z",
    "updatedAt": "2026-11-01T10:00:00Z"
  },
  {
    "id": "exp_soft_26_11",
    "name": "SaaS Tools & Cloud",
    "date": "2026-11-05",
    "amount": 4363,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-11-05T09:00:00Z",
    "updatedAt": "2026-11-05T09:00:00Z"
  },
  {
    "id": "exp_self_084",
    "name": "personal",
    "date": "2026-11-07",
    "amount": 22000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Personal reimbursement payout",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-11-07T12:00:00Z",
    "updatedAt": "2026-11-07T12:00:00Z"
  },
  {
    "id": "exp_util_26_11",
    "name": "Electricity & Internet",
    "date": "2026-11-10",
    "amount": 8732,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-11-10T12:00:00Z",
    "updatedAt": "2026-11-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_26_11",
    "name": "Online Advertisements",
    "date": "2026-11-15",
    "amount": 10475,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-11-15T14:00:00Z",
    "updatedAt": "2026-11-15T14:00:00Z"
  },
  {
    "id": "exp_self_083",
    "name": "personal",
    "date": "2026-11-19",
    "amount": 10000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Vendor cash payment for local repair",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-11-19T12:00:00Z",
    "updatedAt": "2026-11-19T12:00:00Z"
  },
  {
    "id": "exp_sup_26_11",
    "name": "Stationery & Pantry Supplies",
    "date": "2026-11-22",
    "amount": 1256,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-11-22T11:00:00Z",
    "updatedAt": "2026-11-22T11:00:00Z"
  },
  {
    "id": "exp_prof_26_11",
    "name": "Accounting & Tax Services",
    "date": "2026-11-25",
    "amount": 11952,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-11-25T16:00:00Z",
    "updatedAt": "2026-11-25T16:00:00Z"
  },
  {
    "id": "exp_rent_26_12",
    "name": "Office Rent",
    "date": "2026-12-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-12-01T10:00:00Z",
    "updatedAt": "2026-12-01T10:00:00Z"
  },
  {
    "id": "exp_self_087",
    "name": "personal",
    "date": "2026-12-04",
    "amount": 28000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Director personal draw",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-12-04T12:00:00Z",
    "updatedAt": "2026-12-04T12:00:00Z"
  },
  {
    "id": "exp_soft_26_12",
    "name": "SaaS Tools & Cloud",
    "date": "2026-12-05",
    "amount": 5936,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-12-05T09:00:00Z",
    "updatedAt": "2026-12-05T09:00:00Z"
  },
  {
    "id": "exp_self_086",
    "name": "personal",
    "date": "2026-12-09",
    "amount": 17000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Online printer maintenance pay",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-12-09T12:00:00Z",
    "updatedAt": "2026-12-09T12:00:00Z"
  },
  {
    "id": "exp_util_26_12",
    "name": "Electricity & Internet",
    "date": "2026-12-10",
    "amount": 8623,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-12-10T12:00:00Z",
    "updatedAt": "2026-12-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_26_12",
    "name": "Online Advertisements",
    "date": "2026-12-15",
    "amount": 9157,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-12-15T14:00:00Z",
    "updatedAt": "2026-12-15T14:00:00Z"
  },
  {
    "id": "exp_sup_26_12",
    "name": "Stationery & Pantry Supplies",
    "date": "2026-12-22",
    "amount": 2273,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2026-12-22T11:00:00Z",
    "updatedAt": "2026-12-22T11:00:00Z"
  },
  {
    "id": "exp_self_085",
    "name": "personal",
    "date": "2026-12-24",
    "amount": 28000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Owner monthly draw transfer",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-12-24T12:00:00Z",
    "updatedAt": "2026-12-24T12:00:00Z"
  },
  {
    "id": "exp_self_088",
    "name": "personal",
    "date": "2026-12-26",
    "amount": 11000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash for stationery supplies",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2026-12-26T12:00:00Z",
    "updatedAt": "2026-12-26T12:00:00Z"
  },
  {
    "id": "exp_rent_27_01",
    "name": "Office Rent",
    "date": "2027-01-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-01-01T10:00:00Z",
    "updatedAt": "2027-01-01T10:00:00Z"
  },
  {
    "id": "exp_soft_27_01",
    "name": "SaaS Tools & Cloud",
    "date": "2027-01-05",
    "amount": 5523,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-01-05T09:00:00Z",
    "updatedAt": "2027-01-05T09:00:00Z"
  },
  {
    "id": "exp_util_27_01",
    "name": "Electricity & Internet",
    "date": "2027-01-10",
    "amount": 8906,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-01-10T12:00:00Z",
    "updatedAt": "2027-01-10T12:00:00Z"
  },
  {
    "id": "exp_self_090",
    "name": "personal",
    "date": "2027-01-13",
    "amount": 13000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Dinner with client (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-01-13T12:00:00Z",
    "updatedAt": "2027-01-13T12:00:00Z"
  },
  {
    "id": "exp_mkt_27_01",
    "name": "Online Advertisements",
    "date": "2027-01-15",
    "amount": 8279,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-01-15T14:00:00Z",
    "updatedAt": "2027-01-15T14:00:00Z"
  },
  {
    "id": "exp_sup_27_01",
    "name": "Stationery & Pantry Supplies",
    "date": "2027-01-22",
    "amount": 2726,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-01-22T11:00:00Z",
    "updatedAt": "2027-01-22T11:00:00Z"
  },
  {
    "id": "exp_prof_27_01",
    "name": "Accounting & Tax Services",
    "date": "2027-01-25",
    "amount": 14384,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-01-25T16:00:00Z",
    "updatedAt": "2027-01-25T16:00:00Z"
  },
  {
    "id": "exp_self_089",
    "name": "personal",
    "date": "2027-01-26",
    "amount": 22000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Personal reimbursement payout",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-01-26T12:00:00Z",
    "updatedAt": "2027-01-26T12:00:00Z"
  },
  {
    "id": "exp_rent_27_02",
    "name": "Office Rent",
    "date": "2027-02-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-02-01T10:00:00Z",
    "updatedAt": "2027-02-01T10:00:00Z"
  },
  {
    "id": "exp_soft_27_02",
    "name": "SaaS Tools & Cloud",
    "date": "2027-02-05",
    "amount": 5007,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-02-05T09:00:00Z",
    "updatedAt": "2027-02-05T09:00:00Z"
  },
  {
    "id": "exp_self_093",
    "name": "personal",
    "date": "2027-02-08",
    "amount": 7000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Petty cash for courier & local travel",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-02-08T12:00:00Z",
    "updatedAt": "2027-02-08T12:00:00Z"
  },
  {
    "id": "exp_util_27_02",
    "name": "Electricity & Internet",
    "date": "2027-02-10",
    "amount": 9424,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-02-10T12:00:00Z",
    "updatedAt": "2027-02-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_27_02",
    "name": "Online Advertisements",
    "date": "2027-02-15",
    "amount": 6177,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-02-15T14:00:00Z",
    "updatedAt": "2027-02-15T14:00:00Z"
  },
  {
    "id": "exp_self_092",
    "name": "personal",
    "date": "2027-02-19",
    "amount": 11000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office petty cash replenishment",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-02-19T12:00:00Z",
    "updatedAt": "2027-02-19T12:00:00Z"
  },
  {
    "id": "exp_sup_27_02",
    "name": "Stationery & Pantry Supplies",
    "date": "2027-02-22",
    "amount": 2864,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-02-22T11:00:00Z",
    "updatedAt": "2027-02-22T11:00:00Z"
  },
  {
    "id": "exp_self_091",
    "name": "personal",
    "date": "2027-02-27",
    "amount": 10000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Hardware store payment (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-02-27T12:00:00Z",
    "updatedAt": "2027-02-27T12:00:00Z"
  },
  {
    "id": "exp_rent_27_03",
    "name": "Office Rent",
    "date": "2027-03-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-03-01T10:00:00Z",
    "updatedAt": "2027-03-01T10:00:00Z"
  },
  {
    "id": "exp_soft_27_03",
    "name": "SaaS Tools & Cloud",
    "date": "2027-03-05",
    "amount": 4814,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-03-05T09:00:00Z",
    "updatedAt": "2027-03-05T09:00:00Z"
  },
  {
    "id": "exp_util_27_03",
    "name": "Electricity & Internet",
    "date": "2027-03-10",
    "amount": 9789,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-03-10T12:00:00Z",
    "updatedAt": "2027-03-10T12:00:00Z"
  },
  {
    "id": "exp_self_096",
    "name": "personal",
    "date": "2027-03-11",
    "amount": 5000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Dinner with client (UPI)",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-03-11T12:00:00Z",
    "updatedAt": "2027-03-11T12:00:00Z"
  },
  {
    "id": "exp_mkt_27_03",
    "name": "Online Advertisements",
    "date": "2027-03-15",
    "amount": 7841,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-03-15T14:00:00Z",
    "updatedAt": "2027-03-15T14:00:00Z"
  },
  {
    "id": "exp_sup_27_03",
    "name": "Stationery & Pantry Supplies",
    "date": "2027-03-22",
    "amount": 2807,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-03-22T11:00:00Z",
    "updatedAt": "2027-03-22T11:00:00Z"
  },
  {
    "id": "exp_self_095",
    "name": "personal",
    "date": "2027-03-23",
    "amount": 4000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Cash advance for weekend team event",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-03-23T12:00:00Z",
    "updatedAt": "2027-03-23T12:00:00Z"
  },
  {
    "id": "exp_prof_27_03",
    "name": "Accounting & Tax Services",
    "date": "2027-03-25",
    "amount": 14421,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-03-25T16:00:00Z",
    "updatedAt": "2027-03-25T16:00:00Z"
  },
  {
    "id": "exp_self_094",
    "name": "personal",
    "date": "2027-03-28",
    "amount": 7000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Broadband refill via GPay",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-03-28T12:00:00Z",
    "updatedAt": "2027-03-28T12:00:00Z"
  },
  {
    "id": "exp_rent_27_04",
    "name": "Office Rent",
    "date": "2027-04-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-04-01T10:00:00Z",
    "updatedAt": "2027-04-01T10:00:00Z"
  },
  {
    "id": "exp_self_098",
    "name": "personal",
    "date": "2027-04-04",
    "amount": 13000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office desk plants purchase",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-04-04T12:00:00Z",
    "updatedAt": "2027-04-04T12:00:00Z"
  },
  {
    "id": "exp_soft_27_04",
    "name": "SaaS Tools & Cloud",
    "date": "2027-04-05",
    "amount": 3786,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-04-05T09:00:00Z",
    "updatedAt": "2027-04-05T09:00:00Z"
  },
  {
    "id": "exp_self_099",
    "name": "personal",
    "date": "2027-04-07",
    "amount": 10000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Personal reimbursement payout",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-04-07T12:00:00Z",
    "updatedAt": "2027-04-07T12:00:00Z"
  },
  {
    "id": "exp_util_27_04",
    "name": "Electricity & Internet",
    "date": "2027-04-10",
    "amount": 8892,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-04-10T12:00:00Z",
    "updatedAt": "2027-04-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_27_04",
    "name": "Online Advertisements",
    "date": "2027-04-15",
    "amount": 9648,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-04-15T14:00:00Z",
    "updatedAt": "2027-04-15T14:00:00Z"
  },
  {
    "id": "exp_self_097",
    "name": "personal",
    "date": "2027-04-19",
    "amount": 6000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Mobile recharge company phone",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-04-19T12:00:00Z",
    "updatedAt": "2027-04-19T12:00:00Z"
  },
  {
    "id": "exp_sup_27_04",
    "name": "Stationery & Pantry Supplies",
    "date": "2027-04-22",
    "amount": 1609,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-04-22T11:00:00Z",
    "updatedAt": "2027-04-22T11:00:00Z"
  },
  {
    "id": "exp_rent_27_05",
    "name": "Office Rent",
    "date": "2027-05-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-05-01T10:00:00Z",
    "updatedAt": "2027-05-01T10:00:00Z"
  },
  {
    "id": "exp_soft_27_05",
    "name": "SaaS Tools & Cloud",
    "date": "2027-05-05",
    "amount": 5496,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-05-05T09:00:00Z",
    "updatedAt": "2027-05-05T09:00:00Z"
  },
  {
    "id": "exp_util_27_05",
    "name": "Electricity & Internet",
    "date": "2027-05-10",
    "amount": 8785,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-05-10T12:00:00Z",
    "updatedAt": "2027-05-10T12:00:00Z"
  },
  {
    "id": "exp_self_101",
    "name": "personal",
    "date": "2027-05-12",
    "amount": 12000,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Office desk plants purchase",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-05-12T12:00:00Z",
    "updatedAt": "2027-05-12T12:00:00Z"
  },
  {
    "id": "exp_mkt_27_05",
    "name": "Online Advertisements",
    "date": "2027-05-15",
    "amount": 10576,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-05-15T14:00:00Z",
    "updatedAt": "2027-05-15T14:00:00Z"
  },
  {
    "id": "exp_sup_27_05",
    "name": "Stationery & Pantry Supplies",
    "date": "2027-05-22",
    "amount": 1935,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-05-22T11:00:00Z",
    "updatedAt": "2027-05-22T11:00:00Z"
  },
  {
    "id": "exp_prof_27_05",
    "name": "Accounting & Tax Services",
    "date": "2027-05-25",
    "amount": 12996,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Professional",
    "remarks": "Consultancy & audit review charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-05-25T16:00:00Z",
    "updatedAt": "2027-05-25T16:00:00Z"
  },
  {
    "id": "exp_self_100",
    "name": "personal",
    "date": "2027-05-27",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Online printer maintenance pay",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-05-27T12:00:00Z",
    "updatedAt": "2027-05-27T12:00:00Z"
  },
  {
    "id": "exp_rent_27_06",
    "name": "Office Rent",
    "date": "2027-06-01",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "hdfc_1_dsmt",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Rent",
    "remarks": "Monthly office premises rent payment",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-06-01T10:00:00Z",
    "updatedAt": "2027-06-01T10:00:00Z"
  },
  {
    "id": "exp_soft_27_06",
    "name": "SaaS Tools & Cloud",
    "date": "2027-06-05",
    "amount": 4933,
    "paymentMethod": "card",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Software",
    "remarks": "Subscriptions for domain, email, hosting & database",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-06-05T09:00:00Z",
    "updatedAt": "2027-06-05T09:00:00Z"
  },
  {
    "id": "exp_self_103",
    "name": "personal",
    "date": "2027-06-07",
    "amount": 4000,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Miscellaneous cash draw",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-06-07T12:00:00Z",
    "updatedAt": "2027-06-07T12:00:00Z"
  },
  {
    "id": "exp_util_27_06",
    "name": "Electricity & Internet",
    "date": "2027-06-10",
    "amount": 9609,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Utilities",
    "remarks": "Electricity bill and broadband internet charges",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-06-10T12:00:00Z",
    "updatedAt": "2027-06-10T12:00:00Z"
  },
  {
    "id": "exp_mkt_27_06",
    "name": "Online Advertisements",
    "date": "2027-06-15",
    "amount": 6914,
    "paymentMethod": "upi",
    "bankMoneyReceived": "hdfc_sss",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Marketing",
    "remarks": "Social media marketing and search ads campaign",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-06-15T14:00:00Z",
    "updatedAt": "2027-06-15T14:00:00Z"
  },
  {
    "id": "exp_self_102",
    "name": "personal",
    "date": "2027-06-18",
    "amount": 23000,
    "paymentMethod": "bank_transfer",
    "bankMoneyReceived": "india_overseas",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Self",
    "remarks": "Personal reimbursement payout",
    "isSelfTransaction": true,
    "batchId": "b2026-27",
    "createdAt": "2027-06-18T12:00:00Z",
    "updatedAt": "2027-06-18T12:00:00Z"
  },
  {
    "id": "exp_sup_27_06",
    "name": "Stationery & Pantry Supplies",
    "date": "2027-06-22",
    "amount": 1815,
    "paymentMethod": "cash",
    "bankMoneyReceived": "",
    "chequeNumber": "",
    "transactionType": "debit",
    "category": "Supplies",
    "remarks": "Printed brochures, notebooks, tea, coffee & cleaning items",
    "isSelfTransaction": false,
    "batchId": "b2026-27",
    "createdAt": "2027-06-22T11:00:00Z",
    "updatedAt": "2027-06-22T11:00:00Z"
  }
];

const initialStudents = (demoData.students || []).map(s => ({
  ...s,
  batchId: 'b' + s.batch
}));

const initialPayments = (demoData.payments || []).map(p => {
  const student = initialStudents.find(s => s.id === p.studentId);
  return {
    ...p,
    batchId: student ? student.batchId : 'b2025-26'
  };
});

const initialPlacements = (demoData.placements || []).map(p => ({
  ...p,
  batchId: 'b' + p.batch,
  advancePayment: p.advancePayment !== undefined ? p.advancePayment : 15000,
  installments: (p.installments || []).map((inst, index) => ({
    ...inst,
    installmentNumber: index + 1,
    installmentType: inst.installmentType || 'my_costing',
    isAdvance: inst.isAdvance || false,
    remarks: inst.remarks || '',
    chequeNumber: inst.chequeNumber || '',
    bankMoneyReceived: inst.bankMoneyReceived || null,
    status: 'completed'
  }))
}));

const generateInitialAuditLog = (studentsList, paymentsList, placementsList, expensesList) => {
  const logEntries = [];

  // 1. Map students to CREATE STUDENT logs
  studentsList.forEach((student) => {
    logEntries.push({
      id: `audit_std_${student.id}`,
      action: 'CREATE',
      entityType: 'STUDENT',
      entityId: student.id,
      entityName: `${student.firstName} ${student.lastName}`,
      amount: undefined,
      batchId: student.batchId,
      timestamp: student.createdAt || `${student.admissionDate}T09:00:00Z`,
      details: {
        enrollmentNumber: student.enrollmentNumber,
        course: student.course,
        batch: student.batch,
        totalFees: student.totalFees,
        discount: student.discount,
        status: student.status,
      },
    });
  });

  // 2. Map payments to PAYMENT logs
  paymentsList.forEach((payment) => {
    const student = studentsList.find((s) => s.id === payment.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown';
    logEntries.push({
      id: `audit_pay_${payment.id}`,
      action: 'PAYMENT',
      entityType: 'PAYMENT',
      entityId: payment.id,
      entityName: studentName,
      amount: payment.amount,
      batchId: payment.batchId,
      timestamp: payment.createdAt || `${payment.paymentDate}T10:00:00Z`,
      details: {
        studentId: payment.studentId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        bankMoneyReceived: payment.bankMoneyReceived,
        chequeNumber: payment.chequeNumber,
        receiptNumber: payment.receiptNumber,
        paymentDate: payment.paymentDate,
        remarks: payment.remarks,
      },
    });
  });

  // 3. Map placements to PLACEMENT_PAYMENT or COMPANY_PAYMENT_DEBIT logs
  placementsList.forEach((placement) => {
    const student = studentsList.find((s) => s.id === placement.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown';

    (placement.installments || []).forEach((inst) => {
      const isCompany = inst.installmentType === 'company_costing';
      logEntries.push({
        id: `audit_inst_${inst.id}`,
        action: isCompany ? 'COMPANY_PAYMENT_DEBIT' : 'PLACEMENT_PAYMENT',
        entityType: 'PLACEMENT',
        entityId: placement.id,
        entityName: studentName,
        amount: inst.amount,
        batchId: placement.batchId,
        timestamp: `${inst.date}T12:00:00Z`,
        details: {
          placementId: placement.id,
          studentId: placement.studentId,
          studentName,
          amount: inst.amount,
          paymentMethod: inst.method,
          bankMoneyReceived: inst.bankMoneyReceived,
          chequeNumber: inst.chequeNumber || null,
          paymentDate: inst.date,
          remarks: inst.remarks,
          installmentType: inst.installmentType,
          transactionType: isCompany ? 'debit' : 'credit',
          isAdvance: inst.isAdvance,
        },
      });
    });
  });

  // 4. Map expenses to CREATE EXPENSE logs
  expensesList.forEach((expense) => {
    logEntries.push({
      id: `audit_exp_${expense.id}`,
      action: 'CREATE',
      entityType: 'EXPENSE',
      entityId: expense.id,
      entityName: expense.name,
      amount: expense.amount,
      batchId: expense.batchId,
      timestamp: expense.createdAt || `${expense.date}T10:00:00Z`,
      details: {
        name: expense.name,
        amount: expense.amount,
        date: expense.date,
        transactionType: expense.transactionType,
      },
    });
  });

  // Sort logs by timestamp descending
  return logEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const DEFAULT_AUDIT_LOG = generateInitialAuditLog(initialStudents, initialPayments, initialPlacements, DEFAULT_EXPENSES);

export const StudentProvider = ({ children }) => {
  const [batches, setBatches] = useState(DEFAULT_BATCHES);
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [auditLog, setAuditLog] = useState(DEFAULT_AUDIT_LOG);
  const [loading] = useState(false);
  const [expensesLoading] = useState(false);
  const [dataLoadError] = useState(null);
  const [loadRetryCount] = useState(0);

  const [currentBatch, setCurrentBatchState] = useState('2025-26');
  const [customBatches, setCustomBatchesState] = useState([]);

  const [students, setStudents] = useState(initialStudents);
  const [payments, setPayments] = useState(initialPayments);
  const [placements, setPlacements] = useState(initialPlacements);

  // Set current batch
  const setCurrentBatch = useCallback((batch) => {
    setCurrentBatchState(batch);
  }, []);

  // Add a new custom batch
  const addCustomBatch = useCallback((batchValue) => {
    setCustomBatchesState((prev) => {
      if (prev.some((b) => b.value === batchValue)) {
        return prev;
      }
      return [...prev, { value: batchValue, label: batchValue }];
    });
  }, []);

  // Remove a custom batch
  const removeCustomBatch = useCallback((batchValue) => {
    setCustomBatchesState((prev) => {
      return prev.filter((b) => b.value !== batchValue);
    });
  }, []);

  // Audit log helper function
  const logAuditEvent = useCallback((action, entityType, entityId, details, entityName = '') => {
    const inferredAmount = details && (details.amount !== undefined) ? Number(details.amount) : undefined;
    const inferredBatchId = details && details.studentId
      ? (students.find((s) => s.id === details.studentId)?.batchId)
      : (details && details.batchId) ? details.batchId : undefined;

    const auditEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      action,
      entityType,
      entityId,
      entityName,
      details,
      amount: inferredAmount,
      batchId: inferredBatchId,
      timestamp: new Date().toISOString(),
    };
    setAuditLog((prev) => {
      return [auditEntry, ...prev];
    });
    return auditEntry;
  }, [students]);

  // addBatch (added for sidebar mock batch creation)
  const addBatch = useCallback((newBatch) => {
    setBatches((prev) => {
      return [...prev, newBatch];
    });
  }, []);

  // deleteAuditLogEntries (added for audit log view deletion)
  const deleteAuditLogEntries = useCallback((idsToDelete) => {
    setAuditLog((prev) => {
      return prev.filter((entry) => !idsToDelete.includes(entry.id));
    });
  }, []);

  // loadSupabaseData no-op mock
  const loadSupabaseData = useCallback(() => {
    return Promise.resolve();
  }, []);

  // Student CRUD operations
  const addStudent = useCallback(async (studentData) => {
    const batchObj = batches.find((b) => b.batch_name === studentData.batch);
    const courseObj = courses.find((c) =>
      c.course_type === studentData.course ||
      c.course_code === studentData.course ||
      c.course_name === studentData.course
    );

    const newStudent = {
      id: crypto.randomUUID ? crypto.randomUUID() : 's_' + Math.random().toString(36).substring(2, 9),
      enrollmentNumber: studentData.enrollmentNumber,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      phone: studentData.phone,
      course: studentData.course,
      batchId: batchObj ? batchObj.id : 'b' + studentData.batch,
      batch: studentData.batch,
      admissionDate: studentData.admissionDate,
      address: studentData.address || '',
      guardianName: studentData.guardianName || '',
      guardianPhone: studentData.guardianPhone || '',
      status: studentData.status || 'active',
      totalFees: Number(studentData.totalFees || 0),
      discount: Number(studentData.discount || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setStudents((prev) => {
      return [newStudent, ...prev];
    });

    // Create a placement placeholder for the new student
    const newPlacement = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'pl_' + Math.random().toString(36).substring(2, 9),
      studentId: newStudent.id,
      batchId: newStudent.batchId,
      batch: newStudent.batch,
      company: 'TBD',
      country: 'TBD',
      companyCosting: 1,
      myCosting: 1,
      advancePayment: 15000,
      profit: 0,
      placementDate: new Date().toISOString().slice(0, 10),
      installments: []
    };

    setPlacements((prev) => {
      return [newPlacement, ...prev];
    });

    logAuditEvent(
      'CREATE',
      'STUDENT',
      newStudent.id,
      {
        enrollmentNumber: newStudent.enrollmentNumber,
        course: newStudent.course,
        batch: newStudent.batch,
        totalFees: newStudent.totalFees,
      },
      `${newStudent.firstName} ${newStudent.lastName}`
    );

    return newStudent;
  }, [batches, courses, logAuditEvent]);

  const updateStudent = useCallback(async (id, studentData) => {
    const batchObj = batches.find((b) => b.batch_name === studentData.batch);

    let updatedStudent = null;
    setStudents((prev) => {
      return prev.map((s) => {
        if (s.id === id) {
          updatedStudent = {
            ...s,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            phone: studentData.phone,
            course: studentData.course,
            batchId: batchObj ? batchObj.id : s.batchId,
            batch: studentData.batch,
            admissionDate: studentData.admissionDate,
            address: studentData.address || '',
            guardianName: studentData.guardianName || '',
            guardianPhone: studentData.guardianPhone || '',
            status: studentData.status,
            totalFees: Number(studentData.totalFees),
            discount: Number(studentData.discount || 0),
            updatedAt: new Date().toISOString()
          };
          return updatedStudent;
        }
        return s;
      });
    });

    // Sync placement batch as well
    setPlacements((prev) => {
      return prev.map((p) => {
        if (p.studentId === id) {
          return {
            ...p,
            batch: studentData.batch,
            batchId: batchObj ? batchObj.id : p.batchId
          };
        }
        return p;
      });
    });

    logAuditEvent(
      'UPDATE',
      'STUDENT',
      id,
      {
        updatedFields: Object.keys(studentData),
        ...studentData,
      },
      `${studentData.firstName} ${studentData.lastName}`
    );

    return updatedStudent;
  }, [batches, logAuditEvent]);

  const deleteStudent = useCallback(async (id) => {
    const studentToDelete = students.find((s) => s.id === id);
    const studentName = studentToDelete ? `${studentToDelete.firstName} ${studentToDelete.lastName}` : 'Unknown';

    setStudents((prev) => {
      return prev.filter((s) => s.id !== id);
    });

    // Delete associated payments
    setPayments((prev) => {
      return prev.filter((p) => p.studentId !== id);
    });

    // Delete associated placement
    setPlacements((prev) => {
      return prev.filter((p) => p.studentId !== id);
    });

    logAuditEvent(
      'DELETE',
      'STUDENT',
      id,
      {
        enrollmentNumber: studentToDelete?.enrollmentNumber,
        deletedAt: new Date().toISOString(),
      },
      studentName
    );
  }, [students, logAuditEvent]);

  const getStudentById = useCallback((id) => {
    return students.find((s) => s.id === id);
  }, [students]);

  const getFilteredStudents = useCallback((batch = currentBatch) => {
    if (batch === 'all') return students;
    return students.filter((s) => s.batch === batch);
  }, [students, currentBatch]);

  const getFilteredPayments = useCallback((batch = currentBatch) => {
    if (batch === 'all') return payments;
    const batchStudentIds = students.filter((s) => s.batch === batch).map((s) => s.id);
    return payments.filter((p) => batchStudentIds.includes(p.studentId));
  }, [students, payments, currentBatch]);

  const getPlacementsByBatch = useCallback((batch = currentBatch) => {
    if (batch === 'all') return placements;
    return placements.filter((p) => p.batch === batch);
  }, [placements, currentBatch]);

  // Payment operations
  const addPayment = useCallback(async (paymentData) => {
    const student = students.find((s) => s.id === paymentData.studentId);
    if (!student) throw new Error('Student not found');

    const newPayment = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'pay_' + Math.random().toString(36).substring(2, 9),
      studentId: paymentData.studentId,
      batchId: student.batchId,
      amount: Number(paymentData.amount),
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      bankMoneyReceived: paymentData.bankMoneyReceived || null,
      chequeNumber: paymentData.chequeNumber || '',
      receiptNumber: paymentData.receiptNumber,
      remarks: paymentData.remarks || '',
      createdAt: new Date().toISOString(),
      status: 'completed',
      emailSent: false,
      emailSentAt: null
    };

    setPayments((prev) => {
      return [...prev, newPayment];
    });

    logAuditEvent(
      'PAYMENT',
      'PAYMENT',
      newPayment.id,
      {
        studentId: newPayment.studentId,
        amount: newPayment.amount,
        paymentMethod: newPayment.paymentMethod,
        bankMoneyReceived: newPayment.bankMoneyReceived,
        chequeNumber: newPayment.chequeNumber,
        receiptNumber: newPayment.receiptNumber,
        paymentDate: newPayment.paymentDate,
        remarks: newPayment.remarks,
      },
      `${student.firstName} ${student.lastName}`
    );

    return newPayment;
  }, [students, logAuditEvent]);

  const updatePayment = useCallback(async (id, paymentData) => {
    let updatedPayment = null;
    setPayments((prev) => {
      return prev.map((p) => {
        if (p.id === id) {
          updatedPayment = {
            ...p,
            amount: Number(paymentData.amount),
            paymentDate: paymentData.paymentDate,
            paymentMethod: paymentData.paymentMethod,
            bankMoneyReceived: paymentData.bankMoneyReceived || null,
            chequeNumber: paymentData.chequeNumber || '',
            receiptNumber: paymentData.receiptNumber,
            remarks: paymentData.remarks || '',
            status: paymentData.status || p.status,
          };
          return updatedPayment;
        }
        return p;
      });
    });

    const student = students.find((s) => s.id === updatedPayment?.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown';

    logAuditEvent(
      'PAYMENT',
      'PAYMENT',
      id,
      {
        studentId: updatedPayment.studentId,
        amount: updatedPayment.amount,
        paymentMethod: updatedPayment.paymentMethod,
        bankMoneyReceived: updatedPayment.bankMoneyReceived,
        receiptNumber: updatedPayment.receiptNumber,
        paymentDate: updatedPayment.paymentDate,
        remarks: updatedPayment.remarks,
        status: updatedPayment.status,
      },
      studentName
    );

    return updatedPayment;
  }, [students, logAuditEvent]);

  const markPaymentEmailSent = useCallback((paymentId, emailSentAt = new Date().toISOString()) => {
    setPayments((prev) => {
      return prev.map((p) => (p.id === paymentId ? { ...p, emailSent: true, emailSentAt } : p));
    });
  }, []);

  const getPaymentsByStudentId = useCallback((studentId) => {
    return payments.filter((p) => p.studentId === studentId);
  }, [payments]);

  // Placement installment operations
  const addPlacementInstallment = useCallback(async (placementId, installmentData, installmentType = 'my_costing') => {
    const placement = placements.find((p) => p.id === placementId);
    if (!placement) throw new Error('Placement not found');

    const nextInstallmentNumber = (placement.installments || []).filter(
      (inst) => inst.installmentType === installmentType
    ).length + 1;

    const newInst = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'inst_' + Math.random().toString(36).substring(2, 9),
      amount: Number(installmentData.amount),
      date: installmentData.date || new Date().toISOString().split('T')[0],
      method: installmentData.method || 'cash',
      bankMoneyReceived: installmentData.bankMoneyReceived || null,
      chequeNumber: installmentData.chequeNumber || '',
      remarks: installmentData.remarks || '',
      status: 'completed',
      installmentNumber: nextInstallmentNumber,
      paymentLocation: installmentData.country || null,
      installmentType: installmentType,
      isAdvance: installmentData.isAdvance || false,
    };

    const shouldUpdateCountry = Boolean(installmentData.country) && (!placement.country || placement.country === 'TBD');

    setPlacements((prev) => {
      return prev.map((p) => {
        if (p.id === placementId) {
          return {
            ...p,
            country: shouldUpdateCountry ? installmentData.country : p.country,
            installments: [...(p.installments || []), newInst]
          };
        }
        return p;
      });
    });

    const student = students.find((s) => s.id === placement.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown';

    const auditAction = installmentType === 'company_costing' ? 'COMPANY_PAYMENT_DEBIT' : 'PLACEMENT_PAYMENT';

    logAuditEvent(
      auditAction,
      'PLACEMENT',
      placementId,
      {
        placementId,
        studentId: placement.studentId,
        studentName,
        amount: newInst.amount,
        paymentMethod: newInst.method,
        bankMoneyReceived: newInst.bankMoneyReceived,
        chequeNumber: newInst.chequeNumber || null,
        paymentDate: newInst.date,
        remarks: newInst.remarks,
        installmentType,
        transactionType: installmentType === 'company_costing' ? 'debit' : 'credit',
        isAdvance: newInst.isAdvance,
      },
      studentName
    );

    return newInst;
  }, [placements, students, logAuditEvent]);

  const addCompanyPayment = useCallback(async (placementId, paymentData) => {
    return addPlacementInstallment(placementId, paymentData, 'company_costing');
  }, [addPlacementInstallment]);

  const updatePlacementInstallment = useCallback(async (installmentId, installmentData) => {
    let updatedInstallment = null;
    let placementOfInst = null;

    setPlacements((prev) => {
      return prev.map((p) => {
        const hasInst = (p.installments || []).some((inst) => inst.id === installmentId);
        if (!hasInst) return p;

        placementOfInst = p;
        const updatedInsts = (p.installments || []).map((inst) => {
          if (inst.id === installmentId) {
            updatedInstallment = {
              ...inst,
              amount: Number(installmentData.amount),
              date: installmentData.date,
              method: installmentData.method,
              bankMoneyReceived: installmentData.bankMoneyReceived || null,
              chequeNumber: installmentData.chequeNumber || '',
              remarks: installmentData.remarks || '',
              isAdvance: installmentData.isAdvance || false,
            };
            return updatedInstallment;
          }
          return inst;
        });

        return {
          ...p,
          installments: updatedInsts
        };
      });
    });

    if (!placementOfInst || !updatedInstallment) throw new Error('Installment not found');

    const student = students.find((s) => s.id === placementOfInst.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown';

    logAuditEvent(
      'UPDATE',
      'PLACEMENT',
      placementOfInst.id,
      {
        placementId: placementOfInst.id,
        installmentId,
        installmentNumber: updatedInstallment.installmentNumber,
        installmentType: updatedInstallment.installmentType,
        studentId: placementOfInst.studentId,
        studentName,
        amount: updatedInstallment.amount,
        paymentMethod: updatedInstallment.method,
        bankMoneyReceived: updatedInstallment.bankMoneyReceived,
        chequeNumber: updatedInstallment.chequeNumber || null,
        paymentDate: updatedInstallment.date,
        remarks: updatedInstallment.remarks,
        updatedFields: Object.keys(installmentData),
        transactionType: updatedInstallment.installmentType === 'company_costing' ? 'debit' : 'credit',
      },
      studentName
    );

    return updatedInstallment;
  }, [students, logAuditEvent]);

  const deletePlacementInstallment = useCallback(async (installmentId) => {
    let placementOfInst = null;
    let removedInst = null;

    setPlacements((prev) => {
      return prev.map((p) => {
        const inst = (p.installments || []).find((inst) => inst.id === installmentId);
        if (!inst) return p;

        placementOfInst = p;
        removedInst = inst;
        return {
          ...p,
          installments: (p.installments || []).filter((i) => i.id !== installmentId)
        };
      });
    });

    if (!placementOfInst || !removedInst) return;

    const student = students.find((s) => s.id === placementOfInst.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown';

    logAuditEvent(
      'DELETE',
      'PLACEMENT_PAYMENT',
      placementOfInst.id,
      {
        placementId: placementOfInst.id,
        installmentId,
        installmentNumber: removedInst.installmentNumber,
        amount: removedInst.amount,
        reason: 'Installment deleted'
      },
      studentName
    );
  }, [students, logAuditEvent]);

  const updatePlacementCosts = useCallback(async (placementId, { country = '', companyCosting, myCosting, advancePayment }) => {
    let updatedPlacement = null;
    setPlacements((prev) => {
      return prev.map((p) => {
        if (p.id === placementId) {
          updatedPlacement = {
            ...p,
            country: country || p.country || 'TBD',
            companyCosting: Number(companyCosting),
            myCosting: Number(myCosting),
            advancePayment: advancePayment !== undefined ? Number(advancePayment) : (p.advancePayment || 15000),
            profit: Number(myCosting) - Number(companyCosting)
          };
          return updatedPlacement;
        }
        return p;
      });
    });

    if (!updatedPlacement) throw new Error('Placement not found');

    const student = students.find((s) => s.id === updatedPlacement.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown';

    logAuditEvent(
      'UPDATE',
      'PLACEMENT',
      placementId,
      {
        country,
        companyCosting,
        myCosting,
        advancePayment,
      },
      studentName
    );
  }, [students, logAuditEvent]);

  // Expense operations
  const addExpense = useCallback(async (expenseData) => {
    const batchObj = batches.find((b) => b.batch_name === currentBatch);

    const newExpense = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'exp_' + Math.random().toString(36).substring(2, 9),
      name: expenseData.name,
      date: expenseData.date,
      amount: Number(expenseData.amount),
      paymentMethod: expenseData.paymentMethod || expenseData.payment_method || 'cash',
      bankMoneyReceived: expenseData.bankMoneyReceived || expenseData.bank_account || null,
      chequeNumber: expenseData.chequeNumber || expenseData.cheque_number || '',
      transactionType: expenseData.transactionType || expenseData.transaction_type || 'debit',
      category: expenseData.category,
      remarks: expenseData.remarks || '',
      isSelfTransaction: expenseData.isSelfTransaction || expenseData.is_self_transaction || false,
      batchId: batchObj ? batchObj.id : 'b2025-26',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setExpenses((prev) => {
      return [newExpense, ...prev];
    });

    logAuditEvent(
      'CREATE',
      'EXPENSE',
      newExpense.id,
      {
        name: newExpense.name,
        amount: newExpense.amount,
        date: newExpense.date,
        transactionType: newExpense.transactionType,
      },
      newExpense.name
    );

    return newExpense;
  }, [currentBatch, batches, logAuditEvent]);

  const updateExpense = useCallback(async (id, expenseData) => {
    let updatedExpense = null;
    setExpenses((prev) => {
      return prev.map((exp) => {
        if (exp.id === id) {
          updatedExpense = {
            ...exp,
            name: expenseData.name,
            date: expenseData.date,
            amount: Number(expenseData.amount),
            paymentMethod: expenseData.paymentMethod || expenseData.payment_method || exp.paymentMethod,
            bankMoneyReceived: expenseData.bankMoneyReceived || expenseData.bank_account || exp.bankMoneyReceived,
            chequeNumber: expenseData.chequeNumber || expenseData.cheque_number || exp.chequeNumber,
            transactionType: expenseData.transactionType || expenseData.transaction_type || exp.transactionType,
            category: expenseData.category,
            remarks: expenseData.remarks || '',
            isSelfTransaction: expenseData.isSelfTransaction || expenseData.is_self_transaction || exp.isSelfTransaction,
            updatedAt: new Date().toISOString()
          };
          return updatedExpense;
        }
        return exp;
      });
    });

    logAuditEvent(
      'UPDATE',
      'EXPENSE',
      id,
      {
        name: updatedExpense.name,
        amount: updatedExpense.amount,
        date: updatedExpense.date,
      },
      updatedExpense.name
    );

    return updatedExpense;
  }, [logAuditEvent]);

  const deleteExpense = useCallback(async (id) => {
    const expenseToDelete = expenses.find((exp) => exp.id === id);
    if (!expenseToDelete) return;

    setExpenses((prev) => {
      return prev.filter((exp) => exp.id !== id);
    });

    logAuditEvent(
      'DELETE',
      'EXPENSE',
      id,
      { name: expenseToDelete.name, amount: expenseToDelete.amount },
      expenseToDelete.name
    );
  }, [expenses, logAuditEvent]);

  const getFilteredExpenses = useCallback((batch = currentBatch) => {
    if (batch === 'all') return expenses;
    const batchObj = batches.find((b) => b.batch_name === batch);
    const batchId = batchObj ? batchObj.id : null;
    if (!batchId) return [];
    return expenses.filter((exp) => exp.batchId === batchId);
  }, [expenses, currentBatch, batches]);

  const getStudentFeesSummary = useCallback((studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;

    const studentPayments = payments.filter((p) => p.studentId === studentId);
    const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    const netTotal = Math.max(0, (student.totalFees || 0) - (student.discount || 0));
    const remaining = Math.max(0, netTotal - totalPaid);
    const percentage = netTotal > 0 ? Math.round((totalPaid / netTotal) * 100) : 0;

    return {
      totalFees: netTotal,
      totalPaid,
      remaining,
      percentage,
      payments: studentPayments,
      status: remaining === 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'pending',
    };
  }, [students, payments]);

  const getStats = useCallback((batch = currentBatch) => {
    const filteredStudents = batch === 'all' ? students : students.filter(s => s.batch === batch);
    const filteredPayments = batch === 'all' ? payments : payments.filter(p => {
      const student = students.find(s => s.id === p.studentId);
      return student && (batch === 'all' || student.batch === batch);
    });

    const filteredPlacements = batch === 'all' ? placements : placements.filter(p => p.batch === batch);

    const totalStudents = filteredStudents.length;
    const activeStudents = filteredStudents.filter((s) => s.status === 'active').length;

    const feeRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

    const activeStudentsList = filteredStudents.filter((s) => !isStudentDroppedOut(s.status));
    const activeStudentIds = new Set(activeStudentsList.map((s) => s.id));
    const activeFeeRevenue = filteredPayments
      .filter((p) => activeStudentIds.has(p.studentId))
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const placementRevenue = filteredPlacements.reduce((sum, placement) => {
      const installmentTotal = (placement.installments || []).reduce((instSum, inst) => {
        return instSum + (inst.amount || 0);
      }, 0);
      return sum + installmentTotal;
    }, 0);

    const totalRevenue = feeRevenue + placementRevenue;

    const totalFees = activeStudentsList
      .reduce((sum, s) => sum + Math.max(0, (s.totalFees || 0) - (s.discount || 0)), 0);
    const pendingFees = Math.max(0, totalFees - activeFeeRevenue);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEnrollments = filteredStudents.filter(
      (s) => new Date(s.createdAt) >= thirtyDaysAgo
    ).length;

    return {
      totalStudents,
      activeStudents,
      totalRevenue,
      totalFees,
      pendingFees,
      recentEnrollments,
      collectionRate: totalFees > 0 ? Math.round((activeFeeRevenue / totalFees) * 100) : 0,
    };
  }, [students, payments, placements, currentBatch]);

  const getAuditLog = useCallback((filters = {}) => {
    let filteredLog = [...auditLog];

    if (filters.action) {
      filteredLog = filteredLog.filter((entry) => entry.action === filters.action);
    }
    if (filters.entityType) {
      filteredLog = filteredLog.filter((entry) => entry.entityType === filters.entityType);
    }
    if (filters.startDate) {
      filteredLog = filteredLog.filter((entry) => new Date(entry.timestamp) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filteredLog = filteredLog.filter((entry) => new Date(entry.timestamp) <= new Date(filters.endDate));
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredLog = filteredLog.filter((entry) =>
        entry.entityName.toLowerCase().includes(searchLower) ||
        entry.action.toLowerCase().includes(searchLower) ||
        entry.entityType.toLowerCase().includes(searchLower)
      );
    }

    return filteredLog;
  }, [auditLog]);

  const clearAuditLog = useCallback(() => {
    setAuditLog([]);
  }, []);

  const value = {
    students,
    payments,
    expenses,
    auditLog,
    loading,
    expensesLoading,
    dataLoadError,
    loadRetryCount,
    currentBatch,
    setCurrentBatch,
    customBatches,
    addCustomBatch,
    removeCustomBatch,
    batches,
    courses,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    getFilteredStudents,
    getFilteredPayments,
    addPayment,
    updatePayment,
    markPaymentEmailSent,
    getPaymentsByStudentId,
    addExpense,
    updateExpense,
    deleteExpense,
    getFilteredExpenses,
    getStudentFeesSummary,
    getStats,
    getAuditLog,
    clearAuditLog,
    placements,
    getPlacementsByBatch,
    addPlacementInstallment,
    addCompanyPayment,
    updatePlacementInstallment,
    deletePlacementInstallment,
    updatePlacementCosts,
    loadSupabaseData,
    addBatch,
    deleteAuditLogEntries
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
};

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
};

export default StudentContext;
