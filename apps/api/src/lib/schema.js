const sql = require("./sql");

const Club = require("../models/Club");
const ClubAnnouncement = require("../models/ClubAnnouncement");
const ClubEvent = require("../models/ClubEvent");
const Member = require("../models/Member");
const Rsvp = require("../models/Rsvp");
const User = require("../models/User");
const UserConnection = require("../models/UserConnection");

// #region Sync

module.exports.sync = async () => {
  const count = await sql`
    SELECT
      COUNT(*)
    FROM
      "information_schema".TABLES
    WHERE
      "table_schema" = 'public'
    `.then(([{ count }]) => parseInt(count, 10));

  if (count !== 0) return;

  await User.sync();
  await UserConnection.sync();

  await Club.sync();
  await ClubAnnouncement.sync();
  await ClubEvent.sync();

  await Member.sync();
  await Rsvp.sync();
};

// #endregion
