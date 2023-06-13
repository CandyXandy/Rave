const Router = require("express-promise-router").default;

// #region Router

const router = Router();

module.exports = router;

// #endregion

// #region Session

router.use("/session", require("./session"));

// #endregion

// #region Middleware

router.post("*", (req, res, next) => {
  if (req.user || req.url === "/user") next();
  else res.sendStatus(401);
});

router.patch("*", (req, res, next) => {
  if (req.user) next();
  else res.sendStatus(401);
});

router.delete("*", (req, res, next) => {
  if (req.user) next();
  else res.sendStatus(401);
});

// #endregion

// #region Entities

router.use("/club", require("./club"));
router.use("/user", require("./user"));

// #endregion
