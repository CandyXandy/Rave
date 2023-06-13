const { fakerEN_AU: faker } = require("@faker-js/faker");

const sql = require("../../../src/lib/sql");

// #region Seed

module.exports.seed = async () => {
  const clubEvents = await sql`
    SELECT
      "id",
      "club_id",
      "created_at"
    FROM
      "club_event"
    `;
  const clubMemberships = await sql`
    SELECT
      "club_id",
      "user_id",
      "created_at"
    FROM
      "member"
    `;

  const clubEventsByClub = clubEvents.reduce(
    (obj, clubEvent) => ({
      ...obj,
      [clubEvent.clubId]: [...(obj[clubEvent.clubId] ?? []), clubEvent],
    }),
    {}
  );

  const rsvps = faker.helpers
    .shuffle(
      clubMemberships
        .flatMap((member) =>
          clubEventsByClub[member.clubId].map((clubEvent) =>
            faker.helpers.maybe(
              () => ({
                clubEventId: clubEvent.id,
                userId: member.userId,
                isAccepted: faker.datatype.boolean({ probability: 0.75 }),
                createdAt: faker.date.between({
                  from:
                    clubEvent.createdAt > member.createdAt
                      ? clubEvent.createdAt
                      : member.createdAt,
                  to: new Date(),
                }),
              }),
              { probability: 0.75 }
            )
          )
        )
        .filter(Boolean)
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
    INSERT INTO "rsvp" ${sql(rsvps)}
    `;
};

// #endregion
