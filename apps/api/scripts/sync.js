require("../src/env");

const sql = require("../src/lib/sql");
const schema = require("../src/lib/schema");

// #region Main

(async () => {
  try {
    await sql`DROP SCHEMA IF EXISTS "public" CASCADE`;
    await sql`CREATE SCHEMA "public"`;

    await sql`GRANT ALL ON SCHEMA "public" TO current_user`;
    await sql`GRANT ALL ON SCHEMA "public" TO "public"`;

    await schema.sync();

    console.log("Synced successfully!");
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
})();

// #endregion
