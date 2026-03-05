import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 1. Extract token from Authorization header
// 2. Verify token
// 3. Find user
// 4. Attach user to req.user
// 5. Call next()
// 6. If invalid → return 401

const authMiddleware = async (req, res, next) => {
  //  implement here
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "no token in headers" });
    }
    const decodedToken = jwt.decode(token, process.env.JWT_SECRET);
    const authUser = await User.findById({ _id: decodedToken.id });

    const user = {
      id: authUser._id,
      email: authUser.email,
    };

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: error.message });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: error.message });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Auth Internal server error" });
    }
  }
};

export default authMiddleware;
