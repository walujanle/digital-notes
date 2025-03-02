/**
 * Check if a string is a valid MongoDB ObjectId
 * @param id The string to check
 * @returns true if the string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  // MongoDB ObjectId is a 24-character hex string
  return /^[0-9a-fA-F]{24}$/.test(id);
}
