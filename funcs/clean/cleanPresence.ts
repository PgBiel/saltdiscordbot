import { Presence } from "discord.js";
import cleanActivity, { ICleanActivity } from "./cleanActivity";

export interface ICleanPresence {
  status: "online" | "offline" | "idle" | "dnd" | "invisible";
  activities: ICleanActivity[];
}

export default function cleanPresence(presence: Presence): ICleanPresence {
  if (presence == null || typeof presence !== "object") return (presence as never);
  const { status, activities } = presence;
  return {
    status,
    activities: activities.map(activity => cleanActivity(activity))
  };
}
