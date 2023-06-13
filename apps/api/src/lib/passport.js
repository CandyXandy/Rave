const passport = require("passport");
const bcrypt = require("bcrypt");

const FacebookStrategy = require("passport-facebook");
const GoogleStrategy = require("passport-google-oauth20");
const LocalStrategy = require("passport-local");

const sql = require("./sql");

// #region Strategy - Local

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const [user = null] = await sql`
          SELECT
            "id",
            "email",
            "password",
            "display_name",
            "is_admin",
            "settings",
            "created_at",
            "updated_at"
          FROM
            "user"
          WHERE
            "email" = ${email}
          `;

        if (user === null) done(null, false);

        if (await bcrypt.compare(password, user.password)) {
          delete user.password;
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (e) {
        done(e);
      }
    }
  )
);

// #endregion

// #region Strategy - External

const verifyExternal = async (profile, done) => {
  try {
    const [userConnection = null] = await sql`
      SELECT
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
            "user"."id" = "user_connection"."user_id") "user"
        ),
        "provider",
        "provider_user_id"
      FROM
        "user_connection"
      WHERE
        "provider" = ${profile.provider}
        AND
        "provider_user_id" = ${profile.id}
      `;

    if (userConnection === null) {
      const [user] = await sql`
        INSERT INTO
          "user"
          ${sql({
            email: profile.emails[0].value,
            displayName: profile.displayName,
          })}
        RETURNING
          "id",
          "email",
          "display_name",
          "is_admin",
          "settings",
          "created_at",
          "updated_at"
        `;

      await sql`
        INSERT INTO
          "user_connection"
          ${sql({
            userId: user.id,
            provider: profile.provider,
            providerUserId: profile.id,
          })}
        `;

      done(null, user);
      return;
    }

    done(null, userConnection.user);
  } catch (e) {
    done(e);
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.RAVE_GOOGLE_CLIENT_ID,
      clientSecret: process.env.RAVE_GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/session/google/redirect",
      scope: ["email", "profile"],
    },
    async (_accessToken, _refreshToken, profile, cb) =>
      verifyExternal(profile, cb)
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.RAVE_FACEBOOK_CLIENT_ID,
      clientSecret: process.env.RAVE_FACEBOOK_CLIENT_SECRET,
      callbackURL: "/api/session/facebook/redirect",
      profileFields: ["email", "displayName"],
    },
    async (_accessToken, _refreshToken, profile, cb) =>
      verifyExternal(profile, cb)
  )
);

// #endregion

// #region Serialization

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const [user = null] = await sql`
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
        "id" = ${id}
      `;

    done(null, user);
  } catch (e) {
    done(e);
  }
});

// #endregion

// #region Export

module.exports = passport;

// #endregion
