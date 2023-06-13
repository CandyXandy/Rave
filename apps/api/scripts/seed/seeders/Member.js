const { fakerEN_AU: faker } = require("@faker-js/faker");

const sql = require("../../../src/lib/sql");

// #region Seed

module.exports.seed = async () => {
  const users = await sql`
    SELECT
      "id",
      "created_at"
    FROM
      "user"
    `;
  const clubs = await sql`
    SELECT
      "id",
      "created_at"
    FROM
      "club"
    `;

  const memberRoles = Object.fromEntries(
    clubs.map((club) => [
      club.id,
      [
        "owner",
        ...faker.helpers.multiple(() => "moderator", {
          count: { min: 1, max: 3 },
        }),
      ],
    ])
  );

  const members = faker.helpers
    .shuffle(
      users.flatMap((user) =>
        faker.helpers.arrayElements(clubs, { min: 1, max: 5 }).map((club) => ({
          clubId: club.id,
          userId: user.id,
          role: memberRoles[club.id].shift() ?? "member",
          createdAt: faker.date.between({
            from:
              club.createdAt > user.createdAt ? club.createdAt : user.createdAt,
            to: new Date(),
          }),
        }))
      )
    )
    .map((record) => ({
      ...record,
      updatedAt: faker.helpers.arrayElement([
        record.createdAt,
        faker.date.between({
          from: record.createdAt,
          to: new Date(),
        }),
      ]),
    }));

  await sql`
    INSERT INTO "member" ${sql(members)}
    `;
};

// #endregion
