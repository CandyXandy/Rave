const Joi = require("joi");

const sql = require("../lib/sql");

// #region Sync

module.exports.sync = () =>
  sql`
    CREATE TABLE "club_announcement" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(),
      "club_id" uuid NOT NULL,
      "title" varchar NOT NULL,
      "description" varchar NOT NULL,
      "is_public" boolean NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "club_announcement_pk" PRIMARY KEY ("id"),
      CONSTRAINT "club_announcement_fk_01" FOREIGN KEY ("club_id") REFERENCES "club"("id") ON DELETE CASCADE
    )
    `;

// #endregion

// #region Schema

const schema = Joi.object({
  id: Joi.string().uuid({ version: "uuidv4" }).forbidden(),
  clubId: Joi.string().uuid({ version: "uuidv4" }).forbidden(),
  title: Joi.string(),
  description: Joi.string(),
  isPublic: Joi.boolean(),
  createdAt: Joi.date().forbidden(),
  updatedAt: Joi.date().forbidden(),
}).label("clubAnnouncement");
const schemaRequired = schema.fork(
  ["title", "description", "isPublic"],
  (key) => key.required()
);

module.exports.schema = schema;
module.exports.schemaRequired = schemaRequired;

// #endregion
