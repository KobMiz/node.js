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

    const { isAdmin, isBusiness } = req.user;

 if (requiredRole === "admin" && isAdmin) {
   console.log(`Access granted: User ${req.user._id} is Admin.`);
   return next();
 }

 console.log(
   `Access denied: User ${req.user._id} attempted to access a ${requiredRole} route without sufficient permissions.`
 );

    if (requiredRole === "business" && isBusiness) {
      console.log("Access granted: User is Business.");
      return next();
    }

    if (requiredRole === "user" && !isAdmin && !isBusiness) {
      console.log("Access granted: User is Regular.");
      return next();
    }

    console.log("Access denied: Insufficient permissions.");
    return res
      .status(403)
      .json({ error: "Access denied. Insufficient permissions." });
  };
};

module.exports = roleMiddleware;
