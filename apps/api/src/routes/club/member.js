const Router = require("express-promise-router").default;
const Joi = require("joi");
const { PostgresError } = require("postgres");

const mail = require("../../lib/mail");
const pagination = require("../../lib/pagination");
const sql = require("../../lib/sql");

const requireMemberRole = require("../../middleware/requireMemberRole");

const Member = require("../../models/Member");

// #region Schema

const paramsSchema = Joi.object({
  userId: Member.schema.extract("userId").required(),
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

router.use("/:userId", async (req, res, next) => {
  const includeHidden = req.user?.isAdmin || req.user?.id === req.params.userId;

  const [member = null] = await sql`
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
      "club_id" = ${req.params.clubId}
      AND
      "user_id" = ${req.params.userId}
    `;

  res.locals.member = member;
  next();
});

// #endregion

// #region Create

router.post("/:userId", async (req, res) => {
  let data;
  try {
    data = await Member.schemaRequired.validateAsync(req.body);
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  data.clubId = req.params.clubId;
  data.userId = req.params.userId;

  if (!req.user.isAdmin) {
    if (data.userId !== req.user.id) {
      res.status(401);
      return;
    }
  }

  try {
    const [member] = await sql`
      INSERT INTO
        "member"
        ${sql(data)}
      RETURNING
        (
        SELECT
          row_to_json("user") "user"
        FROM
          (
          SELECT
            "id",
            "email",
            "display_name",
            "is_admin",
            "settings",
            "created_at",
            "updated_at"
          FROM
            "user"
          WHERE
            "user"."id" = "member"."user_id") "user"
        )
      `;

    res.sendStatus(201);

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
        "member"."role" IN ('moderator', 'owner')
        AND
        "user"."settings" -> 'notifications' ? 'moderator-member-create';
      `;

    await Promise.all(
      users.map((user) =>
        mail.sendMail({
          to: user.email,
          subject: "Member Joined",
          html: `
          <p>
            Hi ${user.displayName},
          </p>
          <p>
            <strong>${member.user.displayName}</strong> has joined <strong>${res.locals.club.displayName}</strong>.
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

// #region Read

router.get("/", async (req, res) => {
  try {
    await pagination.schema.validateAsync(req.query, { allowUnknown: true });
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  const includeHidden = req.user?.isAdmin;

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
      "club_id" = ${req.params.clubId}
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

  res.json(members);
});

// #endregion

// #region Read Single

router.get("/:userId", (_req, res) => {
  if (res.locals.member === null) {
    res.sendStatus(404);
    return;
  }

  res.json(res.locals.member);
});

// #endregion

// #region Update

router.patch("/:userId", requireMemberRole("owner"), async (req, res) => {
  if (res.locals.member === null) {
    res.sendStatus(404);
    return;
  }

  let data;
  try {
    data = await Member.schema.min(1).validateAsync(req.body);
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  if (res.locals.member.role === "owner" && data.owner !== "owner") {
    const count = await sql`
      SELECT
        COUNT(*)
      FROM
        "member"
      WHERE
        "club_id" = ${req.params.clubId}
        AND
        "role" = 'owner'
      `.then(([{ count }]) => parseInt(count, 10));

    if (count === 1) {
      res.sendStatus(403);
      return;
    }
  }

  try {
    await sql`
      UPDATE
        "member"
      SET
        ${sql(data)},
        "updated_at" = now()
      WHERE
        "club_id" = ${req.params.clubId}
        AND
        "user_id" = ${req.params.userId}
      `;

    res.sendStatus(204);

    const [user = null] = await sql`
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
      WHERE
        "user"."id" = ${req.params.userId}
        AND
        "user"."settings" -> 'notifications' ? 'member-update'
      `;

    if (user !== null) {
      await mail.sendMail({
        to: user.email,
        subject: "Role Update",
        html: `
        <p>
          Hi ${user.displayName},
        </p>
        <p>
          <strong>${res.locals.club.displayName}</strong> has updated your role to <strong>${data.role}</strong>.
        </p>
        <a href="${process.env.RAVE_MAIL_LINK_PREFIX}/club/${res.locals.club.id}">
          Go take a look!
        </a>
        `,
      });
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

router.delete("/:userId", async (req, res) => {
  if (res.locals.member === null) {
    res.sendStatus(404);
    return;
  }

  if (!req.user.isAdmin) {
    if (req.params.userId !== req.user.id) {
      if (!["moderator", "owner"].includes(req.member?.role)) {
        res.status(401);
        return;
      }
    }
  }

  if (res.locals.member.role === "owner") {
    const count = await sql`
      SELECT
        COUNT(*)
      FROM
        "member"
      WHERE
        "club_id" = ${req.params.clubId}
        AND
        "role" = 'owner'
      `.then(([{ count }]) => parseInt(count, 10));

    if (count === 1) {
      res.sendStatus(403);
      return;
    }
  }

  const [member] = await sql`
    DELETE
    FROM
      "member"
    WHERE
      "club_id" = ${req.params.clubId}
      AND
      "user_id" = ${req.params.userId}
    RETURNING
      (
      SELECT
        row_to_json("user") "user"
      FROM
        (
        SELECT
          "id",
          "email",
          "display_name",
          "is_admin",
          "settings",
          "created_at",
          "updated_at"
        FROM
          "user"
        WHERE
          "user"."id" = "member"."user_id") "user"
      )
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
      "member"."club_id" = ${req.params.clubId}
      AND
      "member"."role" IN ('moderator', 'owner')
      AND
      "user"."settings" -> 'notifications' ? 'moderator-member-create';
    `;

  await Promise.all(
    users.map((user) =>
      mail.sendMail({
        to: user.email,
        subject: "Member Left",
        html: `
          <p>
            Hi ${user.displayName},
          </p>
          <p>
            <strong>${member.user.displayName}</strong> has left <strong>${res.locals.club.displayName}</strong>.
          </p>
          <a href="${process.env.RAVE_MAIL_LINK_PREFIX}/club/${res.locals.club.id}">
            Go take a look!
          </a>
          `,
      })
    )
  );
});

// #endregion
