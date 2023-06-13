const Joi = require("joi");

// #region Schema

module.exports.schema = Joi.object({
  page: Joi.number().integer().positive(),
  size: Joi.number().integer().positive(),
}).with("page", "size");

// #endregion
