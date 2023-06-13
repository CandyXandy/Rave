const bcrypt = require("bcrypt");
const Joi = require("joi");

const sql = require("../lib/sql");

// #region Sync

module.exports.sync = async () => {
  await sql`
    CREATE TABLE "user" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(),
      "email" varchar NOT NULL,
      "password" varchar,
      "display_name" varchar NOT NULL,
      "is_admin" boolean NOT NULL DEFAULT FALSE,
      "settings" jsonb NOT NULL DEFAULT '{}'::jsonb,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "user_pk" PRIMARY KEY ("id"),
      CONSTRAINT "user_un_01" UNIQUE ("email")
    )
    `;

  const user = {
    email: process.env.RAVE_DEFAULT_ADMIN_EMAIL,
    password: await bcrypt.hash(process.env.RAVE_DEFAULT_ADMIN_PASSWORD, 10),
    displayName: process.env.RAVE_DEFAULT_ADMIN_DISPLAY_NAME,
    isAdmin: true,
    settings: {
      notifications: [],
    },
  };

  await sql`
    INSERT INTO "user" ${sql(user)}
    `;
};

// #endregion

// #region Schema

const schema = Joi.object({
  id: Joi.string().uuid({ version: "uuidv4" }).forbidden(),
  email: Joi.string().email(),
  password: Joi.string(),
  displayName: Joi.string(),
  isAdmin: Joi.boolean(),
  settings: Joi.object({
    notifications: Joi.array().items(
      Joi.string().valid(
        "club-update",
        "club-announcement-create",
        "club-event-create",
        "club-event-cancel",
        "member-update",
        "moderator-member-create",
        "moderator-member-delete"
      )
    ),
  }),
  createdAt: Joi.date().forbidden(),
  updatedAt: Joi.date().forbidden(),
}).label("user");
const schemaRequired = schema.fork(
  ["email", "password", "displayName"],
  (key) => key.required()
);

module.exports.schema = schema;
module.exports.schemaRequired = schemaRequired;

// #endregion
