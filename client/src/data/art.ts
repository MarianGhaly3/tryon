/**
 * Photograph coordinates refer to the images supplied with the ÉCLAT design:
 * [sheet, sheet width, sheet height, x, y, width, height]
 */
export type ArtSpec = [sheet: 'mobile' | 'studio' | 'screens' | 'looks', number, number, number, number, number, number];

export const ART: Record<string, ArtSpec> = {
  rose: ['mobile', 887, 1774, 83, 1080, 165, 94],
  hoops: ['mobile', 887, 1774, 287, 1056, 143, 119],
  necklace: ['mobile', 887, 1774, 479, 1041, 144, 143],
  lipstick: ['mobile', 887, 1774, 675, 1053, 129, 130],
  black: ['studio', 1672, 941, 1241, 382, 116, 68],
  tortoise: ['studio', 1672, 941, 1382, 380, 119, 72],
  wire: ['studio', 1672, 941, 1530, 381, 111, 72],
  round: ['studio', 1672, 941, 1097, 535, 114, 72],
  pink: ['studio', 1672, 941, 1380, 535, 122, 73],
  green: ['studio', 1672, 941, 1530, 538, 114, 70],
  lips: ['studio', 1672, 941, 829, 772, 60, 37],
  avatar: ['screens', 1536, 1024, 1288, 586, 77, 77],
  look1: ['looks', 1536, 1024, 451, 634, 163, 136],
  look2: ['looks', 1536, 1024, 633, 634, 163, 136],
  look3: ['looks', 1536, 1024, 451, 818, 163, 137],
  look4: ['looks', 1536, 1024, 633, 818, 163, 137],
  eyewear: ['mobile', 887, 1774, 384, 1280, 434, 268],
};
