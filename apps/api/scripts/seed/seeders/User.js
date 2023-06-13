const bcrypt = require("bcrypt");

const { fakerEN_AU: faker } = require("@faker-js/faker");

const sql = require("../../../src/lib/sql");

const User = require("../../../src/models/User");

// #region Seed

module.exports.seed = async () => {
  const displayNamesByEmail = {};

  while (Object.keys(displayNamesByEmail).length < 249) {
    let displayName;
    let email;

    do {
      displayName = [faker.person.firstName(), faker.person.lastName()];
      email = faker.internet
        .email({ firstName: displayName[0], lastName: displayName[1] })
        .toLowerCase();
    } while (email in displayNamesByEmail);

    displayNamesByEmail[email] = displayName.join(" ");
  }

  const password = await bcrypt.hash("r4ve", 10);

  const users = Object.entries(displayNamesByEmail)
    .map(([email, displayName]) => ({
      email,
      password,
      displayName,
      isAdmin: faker.datatype.boolean(0.01),
      settings: {
        notifications: faker.helpers.arrayElements(
          User.schema.extract("settings").extract("notifications").describe()
            .items[0].allow
        ),
      },
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
    INSERT INTO "user" ${sql(users)}
    `;
};

// #endregion
