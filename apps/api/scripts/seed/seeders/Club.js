const inflection = require("inflection");

const { fakerEN_AU: faker } = require("@faker-js/faker");

const sql = require("../../../src/lib/sql");

// #region Seed

module.exports.seed = async () => {
  const clubs = faker.helpers
    .uniqueArray(
      () =>
        [
          faker.word.adjective(),
          faker.word.noun(),
          faker.helpers.arrayElement([
            "association",
            "club",
            "collective",
            "enthusiasts",
            "society",
          ]),
        ].join(" "),
      50
    )
    .map((name) => ({
      displayName: inflection.titleize(name),
      category: faker.helpers.arrayElement([
        "Skills",
        "Faith & Religion",
        "Culture & Language",
        "Activities",
        "Politics",
      ]),
      description: [
        inflection.capitalize(faker.hacker.phrase()),
        faker.lorem.paragraphs({ min: 1, max: 3 }, "\n\n"),
      ].join("\n\n"),
      createdAt: faker.date.past({ years: 0.5 }),
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
    INSERT INTO "club" ${sql(clubs)}
    `;
};

// #endregion
