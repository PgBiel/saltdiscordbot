import { Activity, Presence } from "discord.js";
import { ICleanActivity } from "./cleanActivity";

export default function uncleanActivity(activity: ICleanActivity, presence: Presence): Activity | void {
  if (activity == null || typeof activity !== "object") return activity as never;
  return presence.activities.find(a => a.id === activity.id);
  // return new Activity(presence, activity);
}
