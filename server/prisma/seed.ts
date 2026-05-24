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

  for (const [index, account] of mockAccounts.entries()) {
    const assignedOfficerId =
      index % 2 === 0 ? fieldOfficer.id : fieldOfficer.id;

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
            amount: "amount" in entry ? entry.amount : undefined,
            notes: "notes" in entry ? entry.notes : undefined,
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
