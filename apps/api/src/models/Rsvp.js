const Joi = require("joi");

const sql = require("../lib/sql");

// #region Sync

module.exports.sync = () =>
  sql`
    CREATE TABLE "rsvp" (
      "club_event_id" uuid NOT NULL,
      "user_id" uuid NOT NULL,
      "is_accepted" boolean NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "rsvp_pk" PRIMARY KEY ("club_event_id", "user_id"),
      CONSTRAINT "rsvp_fk_01" FOREIGN KEY ("club_event_id") REFERENCES "club_event"("id") ON DELETE CASCADE,
      CONSTRAINT "rsvp_fk_02" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
    )
    `;

// #endregion

// #region Schema

const schema = Joi.object({
  clubEventId: Joi.string().uuid({ version: "uuidv4" }).forbidden(),
  userId: Joi.string().uuid({ version: "uuidv4" }).forbidden(),
  isAccepted: Joi.boolean(),
  createdAt: Joi.date().forbidden(),
  updatedAt: Joi.date().forbidden(),
}).label("rsvp");
const schemaRequired = schema.fork(["isAccepted"], (key) => key.required());

module.exports.schema = schema;
module.exports.schemaRequired = schemaRequired;

// #endregion
