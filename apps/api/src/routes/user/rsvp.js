const Router = require("express-promise-router").default;
const Joi = require("joi");
const { PostgresError } = require("postgres");

const pagination = require("../../lib/pagination");
const sql = require("../../lib/sql");

const Rsvp = require("../../models/Rsvp");

// #region Schema

const paramsSchema = Joi.object({
  clubEventId: Rsvp.schema.extract("clubEventId").required(),
});

// #endregion

// #region Router

const router = Router({ mergeParams: true });

module.exports = router;

// #endregion

// #region Middleware

router.use("/:clubEventId", (req, res, next) =>
  paramsSchema
    .validateAsync(req.params, { allowUnknown: true })
    .then(() => next())
    .catch((e) => res.status(400).send(e.message))
);

router.use("/:clubEventId", async (req, res, next) => {
  const includeHidden = req.user?.isAdmin || req.user?.id === req.params.userId;

  const [rsvp = null] = await sql`
    SELECT
      (
      SELECT
        row_to_json("club_event") "club_event"
      FROM
        (
        SELECT
          "id",
          (
          SELECT
            row_to_json("club") "club"
          FROM
            (
            SELECT
              "id",
              "display_name",
              "category",
              "description",
              "created_at",
              "updated_at"
            FROM
              "club"
            WHERE
              "club"."id" = "club_event"."club_id") "club"
          ),
          "title",
          "description",
          "date",
          "is_public",
          "is_cancelled",
          "created_at",
          "updated_at"
        FROM
          "club_event"
        WHERE
          "club_event"."id" = "rsvp"."club_event_id") "club_event"
      ),
      (
      SELECT
        row_to_json("user") "user"
      FROM
        (
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
          "user"."id" = "rsvp"."user_id") "user"
      ),
      "is_accepted",
      "created_at",
      "updated_at"
    FROM
      "rsvp"
    WHERE
      "club_event_id" = ${req.params.clubEventId}
      AND
      "user_id" = ${req.params.userId}
    `;

  res.locals.rsvp = rsvp;
  next();
});

// #endregion

// #region Create

router.post("/:clubEventId", async (req, res) => {
  let data;
  try {
    data = await Rsvp.schemaRequired.validateAsync(req.body);
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  data.clubEventId = req.params.clubEventId;
  data.userId = req.params.userId;

  if (!req.user.isAdmin) {
    if (data.userId !== req.user.id) {
      res.status(401);
      return;
    }
  }

  try {
    await sql`
      INSERT INTO
        "rsvp"
        ${sql(data)}
      `;

    res.sendStatus(201);
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

  const includeHidden = req.user?.isAdmin || req.user?.id === req.params.userId;

  const rsvps = await sql`
    SELECT
      (
      SELECT
        row_to_json("club_event") "club_event"
      FROM
        (
        SELECT
          "id",
          (
          SELECT
            row_to_json("club") "club"
          FROM
            (
            SELECT
              "id",
              "display_name",
              "category",
              "description",
              "created_at",
              "updated_at"
            FROM
              "club"
            WHERE
              "club"."id" = "club_event"."club_id") "club"
          ),
          "title",
          "description",
          "date",
          "is_public",
          "is_cancelled",
          "created_at",
          "updated_at"
        FROM
          "club_event"
        WHERE
          "club_event"."id" = "rsvp"."club_event_id") "club_event"
      ),
      (
      SELECT
        row_to_json("user") "user"
      FROM
        (
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
          "user"."id" = "rsvp"."user_id") "user"
      ),
      "is_accepted",
      "created_at",
      "updated_at"
    FROM
      "rsvp"
    WHERE
      "user_id" = ${req.params.userId}
    ORDER BY
      "created_at" DESC,
      "club_event_id" ASC
    ${
      req.query.page
        ? sql`
            LIMIT ${req.query.size}
            OFFSET ${(req.query.page - 1) * req.query.size}
            `
        : sql``
    }
    `;

  res.json(rsvps);
});

// #endregion

// #region Read Single

router.get("/:clubEventId", (_req, res) => {
  if (res.locals.rsvp === null) {
    res.sendStatus(404);
    return;
  }

  res.json(res.locals.rsvp);
});

// #endregion

// #region Update

router.patch("/:clubEventId", async (req, res) => {
  if (res.locals.rsvp === null) {
    res.sendStatus(404);
    return;
  }

  let data;
  try {
    data = await Rsvp.schema.min(1).validateAsync(req.body);
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  if (!req.user.isAdmin) {
    if (req.params.userId !== req.user.id) {
      res.status(401);
      return;
    }
  }

  try {
    await sql`
      UPDATE
        "rsvp"
      SET
        ${sql(data)},
        "updated_at" = now()
      WHERE
        "club_event_id" = ${req.params.clubEventId}
        AND
        "user_id" = ${req.params.userId}
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

router.delete("/:clubEventId", async (req, res) => {
  if (res.locals.rsvp === null) {
    res.sendStatus(404);
    return;
  }

  if (!req.user.isAdmin) {
    if (req.params.userId !== req.user.id) {
      res.status(401);
      return;
    }
  }

  await sql`
    DELETE
    FROM
      "rsvp"
    WHERE
      "club_event_id" = ${req.params.clubEventId}
      AND
      "user_id" = ${req.params.userId}
    `;

  res.sendStatus(204);
});

// #endregion
