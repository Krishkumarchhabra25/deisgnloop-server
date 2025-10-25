import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  id: string;
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d", 
  });
};

export const verifyToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
  } catch (error) {
    return null; // invalid or expired token
  }
};

export const decodeToken = (token: string): DecodedToken | null => {
  const decoded = jwt.decode(token) as DecodedToken | null;
  return decoded;
};
