import { PrismaClient, AccountStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
      role: UserRole.admin,
      fullName: "System Administrator",
    },
  });

  const manager = await prisma.user.upsert({
    where: { username: "manager" },
    update: {},
    create: {
      username: "manager",
      passwordHash,
      role: UserRole.manager,
      fullName: "System Manager",
    },
  });

  const fieldOfficer = await prisma.user.upsert({
    where: { username: "field.officer" },
    update: {},
    create: {
      username: "field.officer",
      passwordHash,
      role: UserRole.fieldOfficer,
      fullName: "Field Officer One",
    },
  });

  const mockAccounts = [
    {
      id: 'ACC001',
      accountNumber: 1001,
      debtorName: 'Maria Santos',
      debtorPhone: '+63 917 123 4567',
      debtorAddress: '123 Mabini St, Makati City, Metro Manila',
      balance: 45000,
      lastPayment: '2026-03-15',
      status: AccountStatus.pending,
      history: [
        { date: '2026-03-15', action: 'Payment Received', amount: 5000 },
        { date: '2026-02-20', action: 'Visit - PTP', notes: 'Promised to pay by end of month' },
        { date: '2026-01-10', action: 'Phone Contact', notes: 'Answered, requested extension' },
      ],
    },
    {
      id: 'ACC002',
      accountNumber: 1002,
      debtorName: 'Juan Dela Cruz',
      debtorPhone: '+63 918 765 4321',
      debtorAddress: '456 Rizal Ave, Quezon City, Metro Manila',
      balance: 82500,
      lastPayment: '2026-01-05',
      status: AccountStatus.pending,
      history: [
        { date: '2026-01-05', action: 'Payment Received', amount: 2500 },
        { date: '2025-12-12', action: 'Visit - Refused to Pay' },
        { date: '2025-11-08', action: 'Phone Contact', notes: 'No answer' },
      ],
    },
    {
      id: 'ACC003',
      accountNumber: 1003,
      debtorName: 'Rosa Mercado',
      debtorPhone: '+63 919 555 1234',
      debtorAddress: '789 Luna St, Pasig City, Metro Manila',
      balance: 36750,
      lastPayment: '2026-04-10',
      status: AccountStatus.ptp,
      history: [
        { date: '2026-04-10', action: 'Visit - PTP', amount: 10000, notes: 'Will pay 10k on May 5' },
        { date: '2026-03-22', action: 'Payment Received', amount: 3750 },
      ],
    },
    {
      id: 'ACC004',
      accountNumber: 1004,
      debtorName: 'Pedro Reyes',
      debtorPhone: '+63 920 888 9999',
      debtorAddress: '321 Bonifacio Dr, Taguig City, Metro Manila',
      balance: 125000,
      lastPayment: '2025-11-30',
      status: AccountStatus.pending,
      history: [
        { date: '2025-11-30', action: 'Payment Received', amount: 5000 },
        { date: '2025-10-15', action: 'Visit - Unlocated' },
      ],
    },
    {
      id: 'ACC005',
      accountNumber: 1005,
      debtorName: 'Carmen Torres',
      debtorPhone: '+63 921 333 7777',
      debtorAddress: '567 Del Pilar St, Manila City, Metro Manila',
      balance: 58900,
      lastPayment: '2026-02-28',
      status: AccountStatus.pending,
      history: [
        { date: '2026-02-28', action: 'Payment Received', amount: 1100 },
        { date: '2026-01-18', action: 'Phone Contact', notes: 'Busy, will call back' },
      ],
    },
  ];

  for (const account of mockAccounts) {
    const assignedOfficerId = fieldOfficer.id;

    await prisma.account.upsert({
      where: { id: account.id },
      update: {
        debtorName: account.debtorName,
        debtorPhone: account.debtorPhone,
        debtorAddress: account.debtorAddress,
        balance: account.balance,
        lastPayment: new Date(account.lastPayment),
        status: account.status,
        assignedOfficerId,
      },
      create: {
        id: account.id,
        accountNumber: account.accountNumber,
        debtorName: account.debtorName,
        debtorPhone: account.debtorPhone,
        debtorAddress: account.debtorAddress,
        balance: account.balance,
        lastPayment: new Date(account.lastPayment),
        status: account.status,
        assignedOfficerId,
        history: {
          create: account.history.map((entry) => ({
            action: entry.action,
            amount: entry.amount,
            notes: entry.notes,
            createdAt: new Date(entry.date),
            createdBy: fieldOfficer.id,
          })),
        },
      },
    });
  }

  console.log("Seed complete.");
  console.log("  Admin login:      admin / password123");
  console.log("  Manager login:    manager / password123");
  console.log("  Field officer:    field.officer / password123");
  console.log(`  Seeded ${mockAccounts.length} accounts assigned to ${fieldOfficer.username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
