const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Access Denied! Admins only" });
    }
    next();
  };
  
  export default isAdmin;
  