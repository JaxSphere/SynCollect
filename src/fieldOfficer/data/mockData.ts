export interface Account {
  id: string;
  debtorName: string;
  debtorPhone: string;
  debtorAddress: string;
  balance: number;
  lastPayment: string;
  status: 'pending' | 'visited' | 'ptp' | 'unlocated' | 'refused';
  history: HistoryEntry[];
}

export interface HistoryEntry {
  date: string;
  action: string;
  amount?: number;
  notes?: string;
}

export const mockAccounts: Account[] = [
  {
    id: 'ACC001',
    debtorName: 'Maria Santos',
    debtorPhone: '+63 917 123 4567',
    debtorAddress: '123 Mabini St, Makati City, Metro Manila',
    balance: 45000,
    lastPayment: '2026-03-15',
    status: 'pending',
    history: [
      { date: '2026-03-15', action: 'Payment Received', amount: 5000 },
      { date: '2026-02-20', action: 'Visit - PTP', notes: 'Promised to pay by end of month' },
      { date: '2026-01-10', action: 'Phone Contact', notes: 'Answered, requested extension' },
    ],
  },
  {
    id: 'ACC002',
    debtorName: 'Juan Dela Cruz',
    debtorPhone: '+63 918 765 4321',
    debtorAddress: '456 Rizal Ave, Quezon City, Metro Manila',
    balance: 82500,
    lastPayment: '2026-01-05',
    status: 'pending',
    history: [
      { date: '2026-01-05', action: 'Payment Received', amount: 2500 },
      { date: '2025-12-12', action: 'Visit - Refused to Pay' },
      { date: '2025-11-08', action: 'Phone Contact', notes: 'No answer' },
    ],
  },
  {
    id: 'ACC003',
    debtorName: 'Rosa Mercado',
    debtorPhone: '+63 919 555 1234',
    debtorAddress: '789 Luna St, Pasig City, Metro Manila',
    balance: 36750,
    lastPayment: '2026-04-10',
    status: 'ptp',
    history: [
      { date: '2026-04-10', action: 'Visit - PTP', amount: 10000, notes: 'Will pay 10k on May 5' },
      { date: '2026-03-22', action: 'Payment Received', amount: 3750 },
    ],
  },
  {
    id: 'ACC004',
    debtorName: 'Pedro Reyes',
    debtorPhone: '+63 920 888 9999',
    debtorAddress: '321 Bonifacio Dr, Taguig City, Metro Manila',
    balance: 125000,
    lastPayment: '2025-11-30',
    status: 'pending',
    history: [
      { date: '2025-11-30', action: 'Payment Received', amount: 5000 },
      { date: '2025-10-15', action: 'Visit - Unlocated' },
    ],
  },
  {
    id: 'ACC005',
    debtorName: 'Carmen Torres',
    debtorPhone: '+63 921 333 7777',
    debtorAddress: '567 Del Pilar St, Manila City, Metro Manila',
    balance: 58900,
    lastPayment: '2026-02-28',
    status: 'pending',
    history: [
      { date: '2026-02-28', action: 'Payment Received', amount: 1100 },
      { date: '2026-01-18', action: 'Phone Contact', notes: 'Busy, will call back' },
    ],
  },
];
