const express = require("express");
const session = require("express-session");

const kleur = require("kleur");

require("./env");

const sql = require("./lib/sql");
const mail = require("./lib/mail");
const passport = require("./lib/passport");
const schema = require("./lib/schema");

// #region Main

(async () => {
  try {
    await schema.sync();

    if (process.env.NODE_ENV === "production") await mail.verify();
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
    return;
  }

  const app = express();

  app.use(require("morgan")("dev"));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(
    session({
      secret: process.env.RAVE_SESSION_SECRET,
      store: new (require("connect-pg-simple")(session))({
        conObject: {
          host: process.env.RAVE_PG_HOST,
          port: process.env.RAVE_PG_PORT,

          database: process.env.RAVE_PG_DATABASE,

          user: process.env.RAVE_PG_USERNAME,
          password: process.env.RAVE_PG_PASSWORD,
        },
        createTableIfMissing: true,
      }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: true,
      },
    })
  );
  app.use(passport.authenticate("session"));

  app.use("/api", require("./routes"));

  const server = app.listen(process.env.PORT, () =>
    console.log(kleur.cyan(`http://localhost:${process.env.PORT}/`))
  );

  process.addListener("beforeExit", async () => {
    await new Promise(server.close);
    await sql.end();
  });
})();

// #endregion
