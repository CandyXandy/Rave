const passport = require("passport");
const Router = require("express-promise-router").default;

// #region Router

const router = Router({ mergeParams: true });

module.exports = router;

// #endregion

// #region Create

router.post("/", passport.authenticate("local"), (_req, res) =>
  res.sendStatus(200)
);

router.get("/google", passport.authenticate("google"));
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

router.get("/facebook", passport.authenticate("facebook"));
router.get(
  "/facebook/redirect",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

// #endregion

// #region Read

router.get("/", (req, res) => {
  if (req.user) res.json(req.user);
  else res.sendStatus(204);
});

// #endregion

// #region Delete

router.delete("/", (req, res) => req.logout(() => res.sendStatus(200)));

// #endregion
