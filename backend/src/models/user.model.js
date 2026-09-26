import mongoose from "mongoose";

//creating a schema for the user model which describes the structure of the user document in the database
const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }, // createdAt & updatedAt
);

//create a model from the schema
const User = mongoose.model("User", userSchema);

export default User;
