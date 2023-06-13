const Joi = require("joi");

const sql = require("../lib/sql");

// #region Sync

module.exports.sync = async () => {
  await sql`
    CREATE TYPE "member_role" AS ENUM (
      'owner',
      'moderator',
      'member'
    )
    `;

  await sql`
    CREATE TABLE "member" (
      "club_id" uuid NOT NULL,
      "user_id" uuid NOT NULL,
      "role" member_role NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "member_pk" PRIMARY KEY ("club_id", "user_id"),
      CONSTRAINT "member_fk_01" FOREIGN KEY ("club_id") REFERENCES "club"("id") ON DELETE CASCADE,
      CONSTRAINT "member_fk_02" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
    )
    `;
};

// #endregion

// #region Schema

const schema = Joi.object({
  clubId: Joi.string().uuid({ version: "uuidv4" }).forbidden(),
  userId: Joi.string().uuid({ version: "uuidv4" }).forbidden(),
  role: Joi.string().equal("owner", "moderator", "member"),
  createdAt: Joi.date().forbidden(),
  updatedAt: Joi.date().forbidden(),
}).label("member");
const schemaRequired = schema.fork(["role"], (key) => key.required());

module.exports.schema = schema;
module.exports.schemaRequired = schemaRequired;

// #endregion
