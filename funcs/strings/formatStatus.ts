import capitalize from "./capitalize";

export type MemberStatus = "online" | "offline" | "dnd" | "idle";

/**
 * Format a status
 * @param {string} status The status
 */
export default function formatStatus(status: MemberStatus) {
  if (typeof status !== "string" || !status) return;
  if (status === "dnd") {
    return "Do Not Disturb";
  }
  return capitalize(status);
}
