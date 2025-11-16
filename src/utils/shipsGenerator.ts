import {BOT_SHIP_PRESETS} from '../constants/botShip'

export function getRandomShips() {
  const randomIndex = Math.floor(Math.random() * BOT_SHIP_PRESETS.length);
  return BOT_SHIP_PRESETS[randomIndex];
}
