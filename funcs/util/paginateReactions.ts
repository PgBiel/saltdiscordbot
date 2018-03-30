import { _, Constants } from "../../util/deps";

export interface IPaginateArrowDirection {
  END: string;
  SUP: string;
  ONE: string;
}

/**
 * Fetch pagination reactions
 * @param {number} page
 * @param {number} maxPage
 * @param {object} [directions] The emoji list of the directions
 * @param {object} [directions.left=Constants.emoji.arrows.left] Left
 * @param {object} [directions.right=Constants.emoji.arrows.right] Right
 * @returns {string[]} Array of reactions
 */
export default function paginateReactions(
  page: number, maxPage: number,
  {
    left = Constants.emoji.arrows.left, right = Constants.emoji.arrows.right
  }: { left?: IPaginateArrowDirection, right?: IPaginateArrowDirection } = {}
) {
  page = _.clamp(page, 1, maxPage);
  const dPage = maxPage - page + 1;
  let emojis: string[] = [];
  if (maxPage > 3 && [maxPage, 1].includes(page)) {
    if (page === 1) {
      emojis = Object.values(right);
    } else if (page === maxPage) {
      emojis = Object.values(left);
    }
  } else {
    if (page > 3) { // left
      emojis = Object.values(left);
    } else if (page === 3) {
      emojis = [left.SUP, left.ONE];
    } else if (page === 2) {
      emojis = [left.ONE];
    }

    if (dPage > 3) { // right
      emojis = emojis.concat(Object.values(right));
    } else if (dPage === 3) {
      emojis = emojis.concat([right.ONE, right.SUP]);
    } else if (dPage === 2) {
      emojis = emojis.concat([right.ONE]);
    }
  }
  return emojis;
}
