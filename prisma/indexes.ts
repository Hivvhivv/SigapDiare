// Partial unique index untuk field opsional yang harus unik.
// Prisma tidak bisa membuatnya karena unique index MongoDB biasa menganggap banyak null sebagai duplikat.
// Dijalankan oleh `npm run db:push` setelah `prisma db push`. Aman dijalankan berulang.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const UNIQUE_STRING_FIELDS = ["phoneNumber", "email", "accessCodeHash"] as const;

async function main() {
  await db.$runCommandRaw({
    createIndexes: "User",
    indexes: UNIQUE_STRING_FIELDS.map((field) => ({
      key: { [field]: 1 },
      name: `User_${field}_partial_unique`,
      unique: true,
      partialFilterExpression: { [field]: { $type: "string" } },
    })),
  });
  console.log(`Partial unique index dibuat: ${UNIQUE_STRING_FIELDS.join(", ")}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
