import jwt from "jsonwebtoken";

export async function createTestUser(userData: any) {
  // Mock test user creation
  const user = {
    id: "test-user-id",
    email: userData.email,
    address: userData.address,
    ...userData,
  };
  return user;
}

export async function authenticateUser(userId: string) {
  // Create a test JWT token
  const token = jwt.sign(
    { userId, email: "test@example.com" },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
  );
  return token;
}
