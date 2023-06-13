const Router = require("express-promise-router").default;
const Joi = require("joi");
const { PostgresError } = require("postgres");

const mail = require("../../lib/mail");
const pagination = require("../../lib/pagination");
const sql = require("../../lib/sql");

const requireMemberRole = require("../../middleware/requireMemberRole");

const Club = require("../../models/Club");

// #region Schema

const paramsSchema = Joi.object({
  id: Club.schema.extract("id").required(),
});

// #endregion

// #region Router

const router = Router();

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
  const [club = null] = await sql`
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
      "id" = ${req.params.id}
    `;

  res.locals.club = club;
  next();
});

router.use("/:id", async (req, _res, next) => {
  const [member = null] = await sql`
    SELECT
      "club_id",
      "user_id",
      "role",
      "created_at",
      "updated_at"
    FROM
      "member"
    WHERE
      "club_id" = ${req.params.id}
      AND
      "user_id" = ${req.user?.id ?? null}
    `;

  req.member = member;
  next();
});

// #endregion

// #region Create

router.post("/", async (req, res) => {
  let data;
  try {
    data = await Club.schemaRequired.validateAsync(req.body);
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  try {
    const [{ id }] = await sql`
      INSERT INTO
        "club"
        ${sql(data)}
      RETURNING
        "id"
      `;

    await sql`
      INSERT INTO
        "member"
        ${sql({
          clubId: id,
          userId: req.user.id,
          role: "owner",
        })}
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

  const clubs = await sql`
    SELECT
      "id",
      "display_name",
      "category",
      "description",
      "created_at",
      "updated_at"
    FROM
      "club"
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

  res.json(clubs);
});

// #endregion

// #region Read Single

router.get("/:id", (_req, res) => {
  if (res.locals.club === null) {
    res.sendStatus(404);
    return;
  }

  res.json(res.locals.club);
});

// #endregion

// #region Update

router.patch("/:id", requireMemberRole("moderator"), async (req, res) => {
  if (res.locals.club === null) {
    res.sendStatus(404);
    return;
  }

  let data;
  try {
    data = await Club.schema.min(1).validateAsync(req.body);
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  try {
    await sql`
      UPDATE
        "club"
      SET
        ${sql(data)},
        "updated_at" = now()
      WHERE
        "id" = ${req.params.id}
      `;

    res.sendStatus(204);

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
        "member"."club_id" = ${req.params.id}
        AND
        "user"."settings" -> 'notifications' ? 'club-update';
      `;

    await Promise.all(
      users.map((user) =>
        mail.sendMail({
          to: user.email,
          subject: "Club Update",
          html: `
          <p>
            Hi ${user.displayName},
          </p>
          <p>
            <strong>${res.locals.club.displayName}</strong> has been updated.
          </p>
          <a href="${process.env.RAVE_MAIL_LINK_PREFIX}/club/${res.locals.club.id}">
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

// #region Delete

router.delete("/:id", requireMemberRole("owner"), async (req, res) => {
  if (res.locals.club === null) {
    res.sendStatus(404);
    return;
  }

  await sql`
    DELETE
    FROM
      "club"
    WHERE
      "id" = ${req.params.id}
    `;

  res.sendStatus(204);
});

// #endregion

// #region Subroutes

router.use("/:clubId/*", (_req, res, next) => {
  if (res.locals.club === null) {
    res.sendStatus(404);
    return;
  }

  next();
});

router.use("/:clubId/announcement", require("./announcement"));
router.use("/:clubId/event", require("./event"));
router.use("/:clubId/member", require("./member"));

// #endregion
