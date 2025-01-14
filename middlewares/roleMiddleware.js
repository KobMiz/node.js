const roles = {
  admin: (user) => user.isAdmin,
  business: (user) => user.isBusiness,
  user: (user) => !user.isAdmin && !user.isBusiness,
};

const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log("Access denied: User not authenticated.");
      return res
        .status(401)
        .json({ error: "Access denied. User not authenticated." });
    }

    console.log("User role details:", req.user);
    console.log("Required role for route:", requiredRole);

    if (roles[requiredRole] && roles[requiredRole](req.user)) {
      console.log(
        `Access granted: User ${req.user._id} has the required role (${requiredRole}).`
      );
      return next();
    }

    console.log(
      `Access denied: User ${req.user._id} attempted to access a ${requiredRole} route without sufficient permissions.`
    );
    return res
      .status(403)
      .json({ error: "Access denied. Insufficient permissions." });
  };
};

module.exports = roleMiddleware;
