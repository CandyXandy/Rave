const Router = require("express-promise-router").default;

const sql = require("../../lib/sql");
const pagination = require("../../lib/pagination");

// #region Router

const router = Router({ mergeParams: true });

module.exports = router;

// #endregion

// #region Read (Announcement)

router.get("/announcement", async (req, res) => {
  try {
    await pagination.schema.validateAsync(req.query, { allowUnknown: true });
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  const announcements = await sql`
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
          "club"."id" = "club_announcement"."club_id") "club"
      ),
      "title",
      "description",
      "is_public",
      "created_at",
      "updated_at"
    FROM
      "club_announcement"
    ${
      req.params.userId
        ? sql`
            WHERE
              "club_announcement"."club_id" = ANY (
              SELECT
                "club_id"
              FROM
                "member"
              WHERE
                "user_id" = ${req.params.userId})
            `
        : sql`
            WHERE
              "is_public" IS TRUE
            `
    }
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

  res.json(announcements);
});

// #endregion

// #region Read (Event)

router.get("/event", async (req, res) => {
  try {
    await pagination.schema.validateAsync(req.query, { allowUnknown: true });
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  const event = await sql`
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
    ${
      req.params.userId
        ? sql`
            WHERE
              "club_event"."club_id" = ANY (
              SELECT
                "club_id"
              FROM
                "member"
              WHERE
                "user_id" = ${req.params.userId})
              `
        : sql`
            WHERE
              "is_public" IS TRUE
            `
    }
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

  res.json(event);
});

// #endregion
