
import { ObjectId } from 'mongodb';

export class StatGenerationService {
  generateStatsFromDate(creationDate) {
    const month = creationDate.getMonth() + 1;
    const day = creationDate.getDate();
    
    // Deterministic base stats by zodiac sign and element
    let baseStats;
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) { // Aries (Fire)
      baseStats = { str: 16, dex: 14, con: 14, int: 10, wis: 8, cha: 12 };
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) { // Taurus (Earth)
      baseStats = { str: 14, dex: 8, con: 16, int: 10, wis: 14, cha: 12 };
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) { // Gemini (Air)
      baseStats = { str: 10, dex: 16, con: 12, int: 14, wis: 10, cha: 14 };
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) { // Cancer (Water)
      baseStats = { str: 10, dex: 12, con: 14, int: 12, wis: 16, cha: 10 };
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) { // Leo (Fire)
      baseStats = { str: 14, dex: 12, con: 12, int: 10, wis: 8, cha: 16 };
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) { // Virgo (Earth)
      baseStats = { str: 10, dex: 14, con: 14, int: 16, wis: 12, cha: 8 };
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) { // Libra (Air)
      baseStats = { str: 10, dex: 14, con: 12, int: 14, wis: 14, cha: 12 };
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) { // Scorpio (Water)
      baseStats = { str: 14, dex: 14, con: 14, int: 12, wis: 12, cha: 10 };
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) { // Sagittarius (Fire)
      baseStats = { str: 12, dex: 16, con: 12, int: 10, wis: 12, cha: 14 };
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) { // Capricorn (Earth)
      baseStats = { str: 14, dex: 10, con: 16, int: 14, wis: 12, cha: 8 };
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) { // Aquarius (Air)
      baseStats = { str: 10, dex: 14, con: 12, int: 16, wis: 14, cha: 10 };
    } else { // Pisces (Water)
      baseStats = { str: 8, dex: 14, con: 12, int: 12, wis: 16, cha: 12 };
    }

    // Calculate HP based on constitution
    const conMod = Math.floor((baseStats.con - 10) / 2);
    const stats = {
      strength: baseStats.str,
      dexterity: baseStats.dex,
      constitution: baseStats.con,
      intelligence: baseStats.int,
      wisdom: baseStats.wis,
      charisma: baseStats.cha,
      hp: 10 + conMod // Level 1 HP calculation
    };

    return stats;
  }

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
