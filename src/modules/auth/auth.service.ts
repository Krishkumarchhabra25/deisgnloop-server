import { admin } from "../../config/firebaseAdmin";
import UserModels from "../../models/UserModels";
import { generateToken } from "../../utils/token";

export const handleFirebaseLogin = async (idToken: string) => {
  console.log("handleFirebaseLogin called with idToken:", idToken);

  const decoded = await admin.auth().verifyIdToken(idToken);
  console.log("Decoded Firebase token:", decoded);

  const { email, name, picture, uid, firebase } = decoded;
  console.log("Extracted email, name, uid, firebase:", email, name, uid, firebase);

  if (!email) throw new Error("Email not found in Firebase token");

  const provider =
    firebase?.sign_in_provider === "apple.com"
      ? "apple"
      : firebase?.sign_in_provider === "google.com"
      ? "google"
      : "local";

  console.log("Determined provider:", provider);

  let User = await UserModels.findOne({ email });
  console.log("Found existing user:", User);

  if (!User) {
    const baseUsername = name?.toLowerCase().replace(/\s+/g, "") || "user";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const username = `${baseUsername}${randomSuffix}`;

    console.log("Creating new user with username:", username);

    User = await UserModels.create({
      name,
      email,
      username,
      profilePhoto: picture,
      provider,
      firebaseUid: uid,
      password: "",
    });

    console.log("New user created:", User);
  }

  const token = generateToken(User._id.toString());
  console.log("Generated JWT token for user:", token);

  return { User, token };
};
