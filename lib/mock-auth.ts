// Temporary mock authentication for testing without Clerk
export const mockAuth = {
  userId: 'mock-user-id',
  user: {
    id: 'mock-user-id',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  }
};

export function useMockAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: mockAuth.user,
    userId: mockAuth.userId,
  };
}
