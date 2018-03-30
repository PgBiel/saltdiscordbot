import rejct from "./rejct";

export default function rejctF(prefix?: string) {
  return e => rejct(e, prefix);
}
