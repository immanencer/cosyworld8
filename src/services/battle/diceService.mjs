import { randomInt } from 'crypto';

// DiceService.mjs
// Provides fair dice rolling for battle and stat systems

export class DiceService {
  /**
   * Rolls a single die with the given number of sides (e.g., d20, d6).
   * Returns an integer from 1 to sides (inclusive).
   */
  rollDie(sides = 20) {
    return randomInt(1, sides + 1); // 1 to sides inclusive
  }

  /**
   * Rolls multiple dice and returns an array of results.
   * @param {number} count - Number of dice
   * @param {number} sides - Sides per die
   * @returns {number[]}
   */
  rollDice(count = 2, sides = 20) {
    return Array.from({ length: count }, () => this.rollDie(sides));
  }

  /**
   * Rolls two dice and returns the higher (advantage).
   */
  rollWithAdvantage(sides = 20) {
    const [a, b] = this.rollDice(2, sides);
    return Math.max(a, b);
  }

  /**
   * Rolls two dice and returns the lower (disadvantage).
   */
  rollWithDisadvantage(sides = 20) {
    const [a, b] = this.rollDice(2, sides);
    return Math.min(a, b);
  }
}
