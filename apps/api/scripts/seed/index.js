require("../../src/env");

const sql = require("../../src/lib/sql");

// #region Main

(async () => {
  try {
    await require("./seeders/User").seed();

    await require("./seeders/Club").seed();
    await require("./seeders/ClubAnnouncement").seed();
    await require("./seeders/ClubEvent").seed();

    await require("./seeders/Member").seed();
    await require("./seeders/Rsvp").seed();

    console.log("Seeded successfully!");
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
})();

// #endregion
