import * as Discord from "discord.js";

const { ActivityTypes } = (Discord as any).Constants; // it's not typed for some reason

export interface ICleanActivity {
  type: number;
  name: string;
  id: string;
  url: string;
  details: string;
  state: string;
  application_id: string;
  timestamps?: {
      start: number;
      end: number;
  };
  party: {
      id: string;
      size: [number, number];
  };
  assets?: {
      large_text: string;
      small_text: string;
      large_image: string;
      small_image: string;
  };
  sync_id: string;
  flags: string[];
}

export default function cleanActivity(activity: Discord.Activity): ICleanActivity {
  if (activity == null || typeof activity !== "object") return (activity as never); // prob not gonna happen, but
  const {
    type: _type, name, url, details, state, applicationId, timestamps, party, assets, id
  } = activity;
  const { syncID, _flags }: { syncID: string, _flags: string[] } = (activity as any); // not typed for some reason
  const typeV = Object.values(ActivityTypes);
  const type = typeV.findIndex(v => v === String(_type).replace(/\s/g, "_").toUpperCase());

  return {
    type,
    id,
    name,
    url,
    details,
    state,
    application_id: applicationId,
    timestamps: timestamps && timestamps.start && timestamps.end ?
      { start: timestamps.start.getTime(), end: timestamps.end.getTime() } :
      null,
    party,
    assets: assets ? {
      large_text: assets.largeText,
      small_text: assets.smallText,
      large_image: assets.largeImage,
      small_image: assets.smallImage
    } : null,
    sync_id: syncID,
    flags: _flags
  };
}
