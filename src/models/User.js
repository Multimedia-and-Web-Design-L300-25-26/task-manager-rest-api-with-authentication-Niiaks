import mongoose from "mongoose";

// Create User schema
// Fields:
// - name (String, required)
// - email (String, required, unique)
// - password (String, required, minlength 6)
// - createdAt (default Date.now)

const userSchema = new mongoose.Schema({
  // Students implement
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
