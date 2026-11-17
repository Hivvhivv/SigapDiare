// MongoDB lokal untuk pengembangan, tanpa perlu menginstal MongoDB.
// Menjalankan replica set satu node (syarat Prisma) di port 27017.
//   npm run db:local            → data disimpan di .mongo-data/ (tetap ada setelah dihentikan)
//   npm run db:local -- --fresh → data sementara, hilang saat dihentikan
// Lalu set di .env: DATABASE_URL="mongodb://127.0.0.1:27017/sigap_diare?replicaSet=rs0"
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MongoMemoryReplSet } from "mongodb-memory-server";

const fresh = process.argv.includes("--fresh");
const port = Number(process.env.MONGO_LOCAL_PORT ?? 27017);
const dbPath = fileURLToPath(new URL("../.mongo-data", import.meta.url));
if (!fresh) mkdirSync(dbPath, { recursive: true });

const replSet = await MongoMemoryReplSet.create({
  replSet: { count: 1, name: "rs0", storageEngine: "wiredTiger" },
  instanceOpts: [{ port, ...(fresh ? {} : { dbPath }) }],
});

console.log(`MongoDB lokal siap (${fresh ? "data sementara" : `data di ${dbPath}`}).`);
console.log(`DATABASE_URL="mongodb://127.0.0.1:${port}/sigap_diare?replicaSet=rs0"`);
console.log("Tekan Ctrl+C untuk berhenti.");

async function shutdown() {
  await replSet.stop({ doCleanup: fresh });
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
