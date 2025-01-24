
import { ObjectId } from 'mongodb';

export class StatGenerationService {
  generateStatsFromDate(creationDate) {
    const seed = creationDate.getTime();
    const month = creationDate.getMonth() + 1;
    const day = creationDate.getDate();
    
    // Generate seeded random number
    const seededRandom = (min, max) => {
      const x = Math.sin(seed + month * 31 + day) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1) + min);
    };

    // Simulate 4d6 drop lowest roll
    const roll4d6DropLowest = () => {
      const rolls = [
        seededRandom(1, 6),
        seededRandom(1, 6),
        seededRandom(1, 6),
        seededRandom(1, 6)
      ].sort((a, b) => b - a);
      return rolls[0] + rolls[1] + rolls[2]; // Drop lowest (rolls[3])
    };
    
    // Base stats by zodiac sign and element
    let baseStats;
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) { // Aries (Fire)
      baseStats = { str: 2, dex: 1, con: 1, int: 0, wis: -1, cha: 1 };
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) { // Taurus (Earth)
      baseStats = { str: 1, dex: -1, con: 2, int: 0, wis: 1, cha: 0 };
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) { // Gemini (Air)
      baseStats = { str: 0, dex: 2, con: 0, int: 1, wis: 0, cha: 1 };
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) { // Cancer (Water)
      baseStats = { str: 0, dex: 0, con: 1, int: 1, wis: 2, cha: 0 };
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) { // Leo (Fire)
      baseStats = { str: 1, dex: 1, con: 0, int: 0, wis: -1, cha: 2 };
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) { // Virgo (Earth)
      baseStats = { str: 0, dex: 1, con: 1, int: 2, wis: 0, cha: -1 };
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) { // Libra (Air)
      baseStats = { str: 0, dex: 1, con: 0, int: 1, wis: 1, cha: 1 };
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) { // Scorpio (Water)
      baseStats = { str: 1, dex: 1, con: 1, int: 1, wis: 0, cha: 0 };
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) { // Sagittarius (Fire)
      baseStats = { str: 1, dex: 2, con: 0, int: 0, wis: 0, cha: 1 };
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) { // Capricorn (Earth)
      baseStats = { str: 1, dex: 0, con: 2, int: 1, wis: 1, cha: -1 };
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) { // Aquarius (Air)
      baseStats = { str: 0, dex: 1, con: 0, int: 2, wis: 1, cha: 0 };
    } else { // Pisces (Water)
      baseStats = { str: -1, dex: 1, con: 1, int: 1, wis: 2, cha: 0 };
    }

    // Generate base stats using 4d6 drop lowest, then add zodiac modifiers
    const stats = {
      strength: Math.max(8, Math.min(20, roll4d6DropLowest() + baseStats.str)),
      dexterity: Math.max(8, Math.min(20, roll4d6DropLowest() + baseStats.dex)),
      constitution: Math.max(8, Math.min(20, roll4d6DropLowest() + baseStats.con)),
      intelligence: Math.max(8, Math.min(20, roll4d6DropLowest() + baseStats.int)),
      wisdom: Math.max(8, Math.min(20, roll4d6DropLowest() + baseStats.wis)),
      charisma: Math.max(8, Math.min(20, roll4d6DropLowest() + baseStats.cha))
    };

    // Calculate HP (based on constitution)
    const conMod = Math.floor((stats.constitution - 10) / 2);
    stats.hp = 10 + conMod; // Level 1 HP calculation

    return stats;
  }
}
