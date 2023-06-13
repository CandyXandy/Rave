const Joi = require("joi");

const sql = require("../lib/sql");

// #region Sync

module.exports.sync = () =>
  sql`
    CREATE TABLE "club_event" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(),
      "club_id" uuid NOT NULL,
      "title" varchar NOT NULL,
      "description" varchar NOT NULL,
      "date" timestamptz NOT NULL,
      "is_public" boolean NOT NULL,
      "is_cancelled" boolean NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "club_event_pk" PRIMARY KEY ("id"),
      CONSTRAINT "club_event_fk_01" FOREIGN KEY ("club_id") REFERENCES "club"("id") ON DELETE CASCADE
    )
    `;

// #endregion

// #region Schema

const schema = Joi.object({
  id: Joi.string().uuid({ version: "uuidv4" }).forbidden(),
  clubId: Joi.string().uuid({ version: "uuidv4" }).forbidden(),
  title: Joi.string(),
  description: Joi.string(),
  date: Joi.date().greater("now"),
  isPublic: Joi.boolean(),
  isCancelled: Joi.boolean(),
  createdAt: Joi.date().forbidden(),
  updatedAt: Joi.date().forbidden(),
}).label("clubEvent");
const schemaRequired = schema.fork(
  ["title", "description", "date", "isPublic", "isCancelled"],
  (key) => key.required()
);

module.exports.schema = schema;
module.exports.schemaRequired = schemaRequired;

// #endregion
