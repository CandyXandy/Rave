const inflection = require("inflection");

const { fakerEN_AU: faker } = require("@faker-js/faker");

const sql = require("../../../src/lib/sql");

// #region Seed

module.exports.seed = async () => {
  const clubs = await sql`
    SELECT
      "id",
      "created_at"
    FROM
      "club"
    `;

  const clubEvents = faker.helpers
    .shuffle(Array.from({ length: 10 }).fill(clubs).flat())
    .map((club) => ({
      clubId: club.id,
      title: inflection.titleize(
        [faker.word.verb(), faker.word.noun()].join(" ")
      ),
      description: [
        inflection.capitalize(faker.hacker.phrase()),
        faker.lorem.paragraphs({ min: 1, max: 3 }, "\n\n"),
      ].join("\n\n"),
      date: faker.date.future({ years: 0.5 }),
      isPublic: faker.datatype.boolean(),
      isCancelled: faker.datatype.boolean({ probability: 0.1 }),
      createdAt: faker.date.between({ from: club.createdAt, to: new Date() }),
    }))
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
    INSERT INTO "club_event" ${sql(clubEvents)}
    `;
};

// #endregion
