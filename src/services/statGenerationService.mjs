
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
    
    // Base stats by zodiac element
    let baseStats;
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) { // Aries (Fire)
      baseStats = { str: 14, dex: 12, con: 13, int: 10, wis: 8, cha: 12 };
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) { // Taurus (Earth)
      baseStats = { str: 13, dex: 8, con: 14, int: 10, wis: 13, cha: 11 };
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) { // Gemini (Air)
      baseStats = { str: 10, dex: 14, con: 11, int: 13, wis: 10, cha: 13 };
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) { // Cancer (Water)
      baseStats = { str: 10, dex: 11, con: 12, int: 12, wis: 14, cha: 12 };
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) { // Leo (Fire)
      baseStats = { str: 13, dex: 12, con: 12, int: 10, wis: 9, cha: 14 };
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) { // Virgo (Earth)
      baseStats = { str: 11, dex: 13, con: 12, int: 14, wis: 12, cha: 9 };
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) { // Libra (Air)
      baseStats = { str: 10, dex: 13, con: 11, int: 12, wis: 12, cha: 13 };
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) { // Scorpio (Water)
      baseStats = { str: 12, dex: 12, con: 13, int: 13, wis: 11, cha: 10 };
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) { // Sagittarius (Fire)
      baseStats = { str: 13, dex: 14, con: 11, int: 11, wis: 10, cha: 12 };
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) { // Capricorn (Earth)
      baseStats = { str: 13, dex: 10, con: 14, int: 12, wis: 13, cha: 9 };
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) { // Aquarius (Air)
      baseStats = { str: 10, dex: 12, con: 11, int: 14, wis: 12, cha: 12 };
    } else { // Pisces (Water)
      baseStats = { str: 9, dex: 12, con: 12, int: 12, wis: 14, cha: 12 };
    }

    // Apply fractal variation based on seed
    return {
      hp: 20 + seededRandom(-5, 5),
      strength: baseStats.str + seededRandom(-2, 2),
      dexterity: baseStats.dex + seededRandom(-2, 2),
      constitution: baseStats.con + seededRandom(-2, 2),
      intelligence: baseStats.int + seededRandom(-2, 2),
      wisdom: baseStats.wis + seededRandom(-2, 2),
      charisma: baseStats.cha + seededRandom(-2, 2)
    };
  }
}
