const Router = require("express-promise-router").default;
const Joi = require("joi");

const sql = require("../../../lib/sql");
const pagination = require("../../../lib/pagination");

const Rsvp = require("../../../models/Rsvp");

// #region Schema

const paramsSchema = Joi.object({
  userId: Rsvp.schema.extract("userId").required(),
});

// #endregion

// #region Router

const router = Router({ mergeParams: true });

module.exports = router;

// #endregion

// #region Middleware

router.use("/:userId", (req, res, next) =>
  paramsSchema
    .validateAsync(req.params, { allowUnknown: true })
    .then(() => next())
    .catch((e) => res.status(400).send(e.message))
);

// #endregion

// #region Create

router.post("/:userId", (req, res) => {
  res.redirect(
    307,
    `/api/user/${req.params.userId}/rsvp/${req.params.clubEventId}`
  );
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
      "club_event_id" = ${req.params.clubEventId}
    ORDER BY
      "created_at" DESC,
      "user_id" ASC
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

router.get("/:userId", (req, res) => {
  res.redirect(
    307,
    `/api/user/${req.params.userId}/rsvp/${req.params.clubEventId}`
  );
});

// #endregion

// #region Update

router.patch("/:userId", (req, res) => {
  res.redirect(
    307,
    `/api/user/${req.params.userId}/rsvp/${req.params.clubEventId}`
  );
});

// #endregion

// #region Delete

router.delete("/:userId", (req, res) => {
  res.redirect(
    307,
    `/api/user/${req.params.userId}/rsvp/${req.params.clubEventId}`
  );
});

// #endregion
