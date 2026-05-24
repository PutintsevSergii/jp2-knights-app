export function formatAdminStatusLabel(status: string): string {
  return status.replaceAll("_", " ").toUpperCase();
}
