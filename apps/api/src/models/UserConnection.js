const Joi = require("joi");

const sql = require("../lib/sql");

// #region Sync

module.exports.sync = () =>
  sql`
    CREATE TABLE "user_connection" (
      "user_id" uuid NOT NULL,
      "provider" varchar NOT NULL,
      "provider_user_id" varchar NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "user_connection_pk" PRIMARY KEY ("user_id", "provider"),
      CONSTRAINT "user_connection_un_01" UNIQUE ("provider", "provider_user_id"),
      CONSTRAINT "user_connection_fk_01" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
    )
    `;

// #endregion

// #region Schema

const schema = Joi.object({
  userId: Joi.string().uuid({ version: "uuidv4" }).forbidden(),
  provider: Joi.string(),
  providerUserId: Joi.string(),
  createdAt: Joi.date().forbidden(),
  updatedAt: Joi.date().forbidden(),
}).label("userConnection");
const schemaRequired = schema.fork(["provider", "providerUserId"], (key) =>
  key.required()
);

module.exports.schema = schema;
module.exports.schemaRequired = schemaRequired;

// #endregion
