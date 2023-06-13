// #region Constants

const ROLES = ["member", "moderator", "owner"];

// #endregion

// #region Middleware

const requireMemberRole = (role) => (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
    return;
  }

  if (
    req.member !== null &&
    ROLES.indexOf(req.member.role) >= ROLES.indexOf(role)
  ) {
    next();
  } else {
    res.sendStatus(401);
  }
};

module.exports = requireMemberRole;

// #endregion
