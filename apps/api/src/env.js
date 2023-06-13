const Joi = require("joi");

// #region Schema

const schema = Joi.object({
  PORT: Joi.number().default(3000),

  RAVE_SESSION_SECRET: Joi.string().required(),

  RAVE_FACEBOOK_CLIENT_ID: Joi.string().required(),
  RAVE_FACEBOOK_CLIENT_SECRET: Joi.string().required(),

  RAVE_GOOGLE_CLIENT_ID: Joi.string().required(),
  RAVE_GOOGLE_CLIENT_SECRET: Joi.string().required(),

  RAVE_PG_HOST: Joi.string(),
  RAVE_PG_PORT: Joi.number(),
  RAVE_PG_DATABASE: Joi.string().required(),
  RAVE_PG_USERNAME: Joi.string().required(),
  RAVE_PG_PASSWORD: Joi.string().required(),

  RAVE_SMTP_HOST: Joi.string(),
  RAVE_SMTP_PORT: Joi.number(),
  RAVE_SMTP_SECURE: Joi.boolean(),
  RAVE_SMTP_USERNAME: Joi.string().required(),
  RAVE_SMTP_PASSWORD: Joi.string().required(),

  RAVE_MAIL_FROM: Joi.string().required(),
  RAVE_MAIL_LINK_PREFIX: Joi.string().replace(/\/$/, "").required(),

  RAVE_DEFAULT_ADMIN_EMAIL: Joi.string().email().required(),
  RAVE_DEFAULT_ADMIN_PASSWORD: Joi.string().required(),
  RAVE_DEFAULT_ADMIN_DISPLAY_NAME: Joi.string().default("Admin"),
});

// #endregion

// #region Validate

try {
  process.env = Joi.attempt(process.env, schema, { allowUnknown: true });
} catch (e) {
  throw new Error(e.message);
}

// #endregion
