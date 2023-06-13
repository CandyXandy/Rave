const Router = require("express-promise-router").default;
const Joi = require("joi");

const sql = require("../../lib/sql");
const pagination = require("../../lib/pagination");

const Member = require("../../models/Member");

// #region Schema

const paramsSchema = Joi.object({
  clubId: Member.schema.extract("clubId").required(),
});

// #endregion

// #region Router

const router = Router({ mergeParams: true });

module.exports = router;

// #endregion

// #region Middleware

router.use("/:clubId", (req, res, next) =>
  paramsSchema
    .validateAsync(req.params, { allowUnknown: true })
    .then(() => next())
    .catch((e) => res.status(400).send(e.message))
);

// #endregion

// #region Create

router.post("/:clubId", (req, res) => {
  res.redirect(
    307,
    `/api/club/${req.params.clubId}/member/${req.params.userId}`
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

  const includeHidden = req.user?.isAdmin || req.user?.id === req.params.userId;

  const members = await sql`
    SELECT
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
          "club"."id" = "member"."club_id") "club"
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
          "user"."id" = "member"."user_id") "user"
      ),
      "role",
      "created_at",
      "updated_at"
    FROM
      "member"
    WHERE
      "user_id" = ${req.params.userId}
    ORDER BY
      "created_at" DESC,
      "club_id" ASC
    ${
      req.query.page
        ? sql`
            LIMIT ${req.query.size}
            OFFSET ${(req.query.page - 1) * req.query.size}
            `
        : sql``
    }
    `;

  res.json(members);
});

// #endregion

// #region Read Single

router.get("/:clubId", (req, res) => {
  res.redirect(
    307,
    `/api/club/${req.params.clubId}/member/${req.params.userId}`
  );
});

// #endregion

// #region Update

router.patch("/:clubId", (req, res) => {
  res.redirect(
    307,
    `/api/club/${req.params.clubId}/member/${req.params.userId}`
  );
});

// #endregion

// #region Delete

router.delete("/:clubId", (req, res) => {
  res.redirect(
    307,
    `/api/club/${req.params.clubId}/member/${req.params.userId}`
  );
});

// #endregion
