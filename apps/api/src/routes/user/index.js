const bcrypt = require("bcrypt");
const Router = require("express-promise-router").default;
const Joi = require("joi");
const { PostgresError } = require("postgres");

const sql = require("../../lib/sql");
const pagination = require("../../lib/pagination");

const User = require("../../models/User");

// #region Schema

const paramsSchema = Joi.object({
  id: User.schema.extract("id").required(),
});

// #endregion

// #region Router

const router = Router();

module.exports = router;

// #endregion

// #region Subroutes

router.use("/feed", require("./feed"));

// #endregion

// #region Middleware

router.use("/:id", (req, res, next) =>
  paramsSchema
    .validateAsync(req.params, { allowUnknown: true })
    .then(() => next())
    .catch((e) => res.status(400).send(e.message))
);

router.use("/:id", async (req, res, next) => {
  const includeHidden = req.user?.isAdmin || req.user?.id === req.params.id;

  const [user = null] = await sql`
    SELECT
      ${sql(
        [
          "id",
          includeHidden && "email",
          "display_name",
          includeHidden && "is_admin",
          includeHidden && "settings",
          "created_at",
          "updated_at",
        ].filter(Boolean)
      )}
    FROM
      "user"
    WHERE
      "id" = ${req.params.id}
    `;

  res.locals.user = user;
  next();
});

// #endregion

// #region Create

router.post("/", async (req, res) => {
  let data;
  try {
    data = await User.schemaRequired.validateAsync(req.body);
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  data.password = await bcrypt.hash(data.password, 10);

  try {
    const [{ id }] = await sql`
      INSERT INTO
        "user"
        ${sql(data)}
      RETURNING
        "id"
      `;

    res.status(201).send(id);
  } catch (e) {
    if (e instanceof PostgresError && e.code === "23505") {
      res.sendStatus(409);
    } else {
      throw e;
    }
  }
});

// #endregion

// #region Read

router.get("/", async (req, res) => {
  try {
    await pagination.schema.validateAsync(req.query, { allowUnknown: true });
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  const includeHidden = req.user?.isAdmin;

  const users = await sql`
    SELECT
      ${sql(
        [
          "id",
          includeHidden && "email",
          "display_name",
          includeHidden && "is_admin",
          includeHidden && "settings",
          "created_at",
          "updated_at",
        ].filter(Boolean)
      )}
    FROM
      "user"
    ORDER BY
      "created_at" DESC,
      "id" ASC
    ${
      req.query.page
        ? sql`
            LIMIT ${req.query.size}
            OFFSET ${(req.query.page - 1) * req.query.size}
            `
        : sql``
    }
    `;

  res.json(users);
});

// #endregion

// #region Read Single

router.get("/:id", (_req, res) => {
  if (res.locals.user === null) {
    res.sendStatus(404);
    return;
  }

  res.json(res.locals.user);
});

// #endregion

// #region Update

router.patch("/:id", async (req, res) => {
  if (res.locals.user === null) {
    res.sendStatus(404);
    return;
  }

  if (!req.user?.isAdmin) {
    if (req.user?.id !== req.params.id) {
      res.sendStatus(401);
      return;
    }
  }

  let data;
  try {
    data = await User.schema.min(1).validateAsync(req.body);
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  if (data.password) data.password = await bcrypt.hash(data.password, 10);

  try {
    await sql`
      UPDATE
        "user"
      SET
        ${sql(data)},
        "updated_at" = now()
      WHERE
        "id" = ${req.params.id}
      `;

    res.sendStatus(204);
  } catch (e) {
    if (e instanceof PostgresError && e.code === "23505") {
      res.sendStatus(409);
    } else {
      throw e;
    }
  }
});

// #endregion

// #region Delete

router.delete("/:id", async (req, res) => {
  if (res.locals.user === null) {
    res.sendStatus(404);
    return;
  }

  if (!req.user?.isAdmin) {
    if (req.user?.id !== req.params.id) {
      res.sendStatus(401);
      return;
    }
  }

  const result = await sql`
    DELETE
    FROM
      "user"
    WHERE
      "id" = ${req.params.id}
    `;

  if (result.count !== 1) {
    res.sendStatus(404);
    return;
  }

  res.sendStatus(204);
});

// #endregion

// #region Subroutes

router.use("/:userId/*", (_req, res, next) => {
  if (res.locals.user !== null) {
    next();
  } else {
    res.sendStatus(404);
  }
});

router.use("/:userId/feed", require("./feed"));
router.use("/:userId/member", require("./member"));
router.use("/:userId/rsvp", require("./rsvp"));

// #endregion
