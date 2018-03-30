import { Presence } from "discord.js";
import cleanActivity, { ICleanActivity } from "./cleanActivity";

export interface ICleanPresence {
  status: "online" | "offline" | "idle" | "dnd";
  activity: ICleanActivity;
}

export default function cleanPresence(presence: Presence): ICleanPresence {
  if (presence == null || typeof presence !== "object") return (presence as never);
  const { status, activity } = presence;
  return {
    status,
    activity: cleanActivity(activity)
  };
}
