import { Activity, Presence } from "discord.js";
import { ICleanActivity } from "./cleanActivity";

export default function uncleanActivity(activity: ICleanActivity, presence: Presence) {
  if (activity == null || typeof activity !== "object") return activity as never;
  return new Activity(presence, activity);
}
