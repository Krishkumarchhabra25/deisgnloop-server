import { admin } from "../../config/firebaseAdmin";
import UserModels from "../../models/UserModels";
import { generateToken } from "../../utils/token";

export const handleFirebaseLogin = async (idToken: string) => {
  const decoded = await admin.auth().verifyIdToken(idToken);
  const { email, name, picture, uid, firebase } = decoded;

  if (!email) throw new Error("Email not found in Firebase token");

  const provider =
    firebase?.sign_in_provider === "apple.com"
      ? "apple"
      : firebase?.sign_in_provider === "google.com"
      ? "google"
      : "local";

  let user = await UserModels.findOne({ email });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const baseUsername = name?.toLowerCase().replace(/\s+/g, "") || "user";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const username = `${baseUsername}${randomSuffix}`;

    user = await UserModels.create({
      name,
      email,
      username,
      profilePhoto: picture,
      provider,
      firebaseUid: uid,
      password: "",
      // New users start with incomplete setup
      isAccountSetupComplete: false,
      accountSetupStep: 0,
    });
  }

  const token = generateToken(user._id.toString());

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePhoto: user.profilePhoto,
      isAccountSetupComplete: user.isAccountSetupComplete,
      accountSetupStep: user.accountSetupStep,
    },
    token,
    isNewUser, // Frontend can use this to decide flow
  };
};