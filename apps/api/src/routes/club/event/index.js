const Router = require("express-promise-router").default;
const Joi = require("joi");
const { PostgresError } = require("postgres");

const mail = require("../../../lib/mail");
const pagination = require("../../../lib/pagination");
const sql = require("../../../lib/sql");

const requireMemberRole = require("../../../middleware/requireMemberRole");

const ClubEvent = require("../../../models/ClubEvent");

// #region Schema

const paramsSchema = Joi.object({
  id: ClubEvent.schema.extract("id").required(),
});

// #endregion

// #region Router

const router = Router({ mergeParams: true });

module.exports = router;

// #endregion

// #region Middleware

router.use("/:id", (req, res, next) =>
  paramsSchema
    .validateAsync(req.params, { allowUnknown: true })
    .then(() => next())
    .catch((e) => res.status(400).send(e.message))
);

router.use("/:id", async (req, res, next) => {
  const [clubEvent = null] = await sql`
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
      "id" = ${req.params.id}
      AND
      "club_id" = ${req.params.clubId}
    `;

  res.locals.clubEvent = clubEvent;
  next();
});

// #endregion

// #region Create

router.post("/", requireMemberRole("moderator"), async (req, res) => {
  let data;
  try {
    data = await ClubEvent.schemaRequired.validateAsync(req.body);
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  data.clubId = req.params.clubId;

  try {
    const [{ id }] = await sql`
      INSERT INTO
        "club_event"
        ${sql(data)}
      RETURNING
        "id"
      `;

    res.status(201).send(id);

    const users = await sql`
      SELECT
        "user"."id",
        "user"."email",
        "user"."display_name",
        "user"."is_admin",
        "user"."settings",
        "user"."created_at",
        "user"."updated_at"
      FROM
        "user"
      INNER JOIN "member" ON
        "member"."user_id" = "user"."id"
      WHERE
        "member"."club_id" = ${req.params.clubId}
        AND
        "user"."settings" -> 'notifications' ? 'club-event-create';
      `;

    await Promise.all(
      users.map((user) =>
        mail.sendMail({
          to: user.email,
          subject: "New Event",
          html: `
            <p>
              Hi ${user.displayName},
            </p>
            <p>
              A new event, <strong>${data.title}</strong>, has been created in <strong>${res.locals.club.displayName}</strong>.
            </p>
            <a href="${process.env.RAVE_MAIL_LINK_PREFIX}/club/${res.locals.club.id}/events">
              Go take a look!
            </a>
            `,
        })
      )
    );
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

  const clubEvents = await sql`
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
      "club_id" = ${req.params.clubId}
      ${
        !req.user?.isAdmin && req.member === null
          ? sql`
              AND
              "is_public" IS TRUE
              `
          : sql``
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

  res.json(clubEvents);
});

// #endregion

// #region Read Single

router.get("/:id", (req, res) => {
  if (!req.user?.isAdmin) {
    if (req.member === null && !res.locals.clubEvent.isPublic) {
      res.sendStatus(401);
      return;
    }
  }

  if (res.locals.clubEvent === null) {
    res.sendStatus(404);
    return;
  }

  res.json(res.locals.clubEvent);
});

// #endregion

// #region Update

router.patch("/:id", requireMemberRole("moderator"), async (req, res) => {
  if (res.locals.clubEvent === null) {
    res.sendStatus(404);
    return;
  }

  let data;
  try {
    data = await ClubEvent.schema.min(1).validateAsync(req.body);
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  try {
    await sql`
      UPDATE
        "club_event"
      SET
        ${sql(data)},
        "updated_at" = now()
      WHERE
        "id" = ${req.params.id}
        AND
        "club_id" = ${req.params.clubId}
      `;

    res.sendStatus(204);

    if (!res.locals.clubEvent.isCancelled && data.isCancelled) {
      const users = await sql`
        SELECT
          "user"."id",
          "user"."email",
          "user"."display_name",
          "user"."is_admin",
          "user"."settings",
          "user"."created_at",
          "user"."updated_at"
        FROM
          "user"
        INNER JOIN "member" ON
          "member"."user_id" = "user"."id"
        WHERE
          "member"."club_id" = ${req.params.clubId}
          AND
          "user"."settings" -> 'notifications' ? 'club-event-cancel';
        `;

      await Promise.all(
        users.map((user) =>
          mail.sendMail({
            to: user.email,
            subject: "Event Cancelled",
            html: `
              <p>
                Hi ${user.displayName},
              </p>
              <p>
                <strong>${res.locals.clubEvent.title}</strong> in <strong>${res.locals.club.displayName}</strong> has been cancelled.
              </p>
              <a href="${process.env.RAVE_MAIL_LINK_PREFIX}/club/${res.locals.club.id}/events">
                Go take a look!
              </a>
              `,
          })
        )
      );
    }
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

router.delete("/:id", requireMemberRole("moderator"), async (req, res) => {
  if (res.locals.clubEvent === null) {
    res.sendStatus(404);
    return;
  }

  await sql`
    DELETE
    FROM
      "club_event"
    WHERE
      "id" = ${req.params.id}
      AND
      "club_id" = ${req.params.clubId}
    `;

  res.sendStatus(204);
});

// #endregion

// #region Subroutes

router.use("/:clubEventId/*", (req, res, next) => {
  if (!req.user?.isAdmin) {
    if (req.member === null && !res.locals.clubEvent.isPublic) {
      res.sendStatus(401);
      return;
    }
  }

  if (res.locals.clubEvent === null) {
    res.sendStatus(404);
    return;
  }

  next();
});

router.use("/:clubEventId/rsvp", require("./rsvp"));

// #endregion
