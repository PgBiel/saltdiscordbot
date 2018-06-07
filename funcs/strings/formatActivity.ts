import capitalize from "./capitalize";
import { Activity } from "discord.js";

/**
 * Format an activity
 * @param {object} activity Activity
 * @param {boolean} [bold=false] If should bold the name
 * @returns {string}
 */
export default function formatActivity(activity: Activity, bold = false): string {
  if (!activity || typeof activity !== "object") return "";
  const cap = capitalize(activity.type, { lowerCase: true });
  return (cap === "Listening" ? "Listening to" : cap) + " " + (bold ? `**${activity.name}**` : activity.name);
}
