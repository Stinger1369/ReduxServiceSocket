export function validateUserCredentials(state : {
  userId?: string;
  email?: string;
  role?: string;
}): boolean {
  const isValid = !!(state.userId && state.email && state.role);
  if (!isValid) {
    console.error("Helpers: Invalid user credentials", state);
  }
  return isValid;
}

export function validateMessageParameters(recipientId : string | undefined, groupId : string | undefined): boolean {
  const isValid = (recipientId && !groupId) || (groupId && !recipientId);
  if (!isValid) {
    console.error("Helpers: Invalid parameters, either recipientId or groupId must be provided exclusively");
  }
  return isValid;
}
