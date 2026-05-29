/** Display name for the owner/admin account across the app */
export const ADMIN_DISPLAY_NAME = "Nayan R";

export function displayUserName(name: string, role: string): string {
  return role === "admin" ? ADMIN_DISPLAY_NAME : name;
}
