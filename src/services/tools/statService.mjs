export class StatService {
  /**
   * Generates stats based on the creation date using d20 rolls with advantage/disadvantage per zodiac sign.
   * @param {Date|string} creationDate - The date the avatar was created.
   * @returns {Object} - Stats object with strength, dexterity, constitution, intelligence, wisdom, charisma, and hp.
   */
  generateStatsFromDate(creationDate) {
    // Convert creationDate to a Date object if it’s a string
    if (typeof creationDate === 'string') {
      creationDate = new Date(creationDate);
    }

    // Fallback to current date if invalid
    if (!creationDate || isNaN(creationDate.getTime())) {
      console.warn("Invalid creation date, using current date as fallback");
      creationDate = new Date();
    }

    // Extract month (1-12) and day (1-31)
    const month = creationDate.getMonth() + 1;
    const day = creationDate.getDate();

    // Get the zodiac sign
    const zodiacSign = this.getZodiacSign(month, day);

    // Retrieve advantage and disadvantage stats for this sign
    const { advantage, disadvantage } = this.zodiacAdvantages[zodiacSign];

    // Seed the RNG with the full timestamp (milliseconds since epoch)
    const rng = this.seededRandom(creationDate.valueOf());

    // Define the order of stats to ensure consistency
    const statsOrder = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const stats = {};

    // Generate stats for each attribute
    for (const stat of statsOrder) {
      // Roll two d20s for every stat to keep RNG sequence consistent
      const roll1 = Math.floor(rng() * 20) + 1; // 1 to 20
      const roll2 = Math.floor(rng() * 20) + 1; // 1 to 20

      let statValue;
      if (advantage.includes(stat)) {
        statValue = Math.max(roll1, roll2); // Advantage: take the higher roll
      } else if (disadvantage.includes(stat)) {
        statValue = Math.min(roll1, roll2); // Disadvantage: take the lower roll
      } else {
        statValue = roll1; // Normal: take the first roll
      }

      // Clamp the value to 8-16
      stats[stat] = Math.max(8, Math.min(16, statValue));
    }

    // Calculate HP based on Constitution
    const conMod = Math.floor((stats.constitution - 10) / 2);
    stats.hp = 10 + conMod; // HP ranges from 9 to 13 when con is 8-16

    return stats;
  }

  /**
   * Determines the zodiac sign based on month and day.
   * @param {number} month - Month (1-12)
   * @param {number} day - Day (1-31)
   * @returns {string} - Zodiac sign
   */
  getZodiacSign(month, day) {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    return 'Pisces';
  }

  /**
   * Defines which stats get advantage or disadvantage based on zodiac sign.
   */
  zodiacAdvantages = {
    'Aries': { advantage: ['strength', 'constitution'], disadvantage: ['wisdom', 'intelligence'] },
    'Taurus': { advantage: ['constitution', 'wisdom'], disadvantage: ['dexterity', 'charisma'] },
    'Gemini': { advantage: ['dexterity', 'intelligence'], disadvantage: ['strength', 'constitution'] },
    'Cancer': { advantage: ['wisdom', 'charisma'], disadvantage: ['strength', 'dexterity'] },
    'Leo': { advantage: ['strength', 'charisma'], disadvantage: ['intelligence', 'wisdom'] },
    'Virgo': { advantage: ['intelligence', 'wisdom'], disadvantage: ['strength', 'charisma'] },
    'Libra': { advantage: ['charisma', 'dexterity'], disadvantage: ['constitution', 'intelligence'] },
    'Scorpio': { advantage: ['constitution', 'intelligence'], disadvantage: ['wisdom', 'charisma'] },
    'Sagittarius': { advantage: ['dexterity', 'charisma'], disadvantage: ['constitution', 'wisdom'] },
    'Capricorn': { advantage: ['constitution', 'intelligence'], disadvantage: ['dexterity', 'charisma'] },
    'Aquarius': { advantage: ['intelligence', 'wisdom'], disadvantage: ['strength', 'constitution'] },
    'Pisces': { advantage: ['wisdom', 'charisma'], disadvantage: ['strength', 'dexterity'] }
  };

  /**
   * Creates a seeded RNG function based on a numeric seed.
   * @param {number} seed - The seed value (e.g., timestamp)
   * @returns {Function} - A function that generates random numbers between 0 and 1
   */
  seededRandom(seed) {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  /**
   * Validates that all stats are numbers between 8 and 16.
   * @param {Object} stats - The stats object to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  validateStats(stats) {
    if (!stats) return false;

    const requiredStats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'hp'];
    return requiredStats.every(stat => 
      typeof stats[stat] === 'number' && 
      stats[stat] >= 8 && 
      stats[stat] <= 16
    );
  }
}