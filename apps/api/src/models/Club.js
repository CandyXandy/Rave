const Joi = require("joi");

const sql = require("../lib/sql");

// #region Sync

module.exports.sync = () =>
  sql`
    CREATE TABLE "club" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(),
      "display_name" varchar NOT NULL,
      "category" varchar NOT NULL,
      "description" varchar NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "club_pk" PRIMARY KEY ("id")
    )
    `;

// #endregion

// #region Schema

const schema = Joi.object({
  id: Joi.string().uuid({ version: "uuidv4" }).forbidden(),
  displayName: Joi.string(),
  category: Joi.string(),
  description: Joi.string(),
  createdAt: Joi.date().forbidden(),
  updatedAt: Joi.date().forbidden(),
}).label("club");
const schemaRequired = schema.fork(
  ["displayName", "category", "description"],
  (key) => key.required()
);

module.exports.schema = schema;
module.exports.schemaRequired = schemaRequired;

// #endregion
