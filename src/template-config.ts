export const TEMPLATE_CONFIG = {
  width: 1024,
  height: 1536,

  tableArea: {
    x: 20,
    y: 372,
    width: 1008,
  },

  titlePosition: {
    x: 520,
    y: 305,
    fontSize: 28,
  },

  location: {
    latitude: 52.479,
    longitude: -1.891,
    timezone: 'Europe/London',
  },

  jumuahTimePosition: {
    x: 680,
    y: 1265,
    fontSize: 28,
  },

  // Calculation settings
  calculationMethod: 2, // 2 = ISNA (Fajr 15°, Isha 15°)
  school: 0, // 0 = Shafi, 1 = Hanafi

  // Summer months (April-September)
  summerMonths: [4, 5, 6, 7, 8, 9],

  // Time offsets in minutes (applied to API start times)
  timeOffsets: {
    fajr: { summer: 6, winter: 0 },
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },

  // Jamat calculation parameters
  // Minutes to add to Start time to derive Jamat
  jamatIntervals: {
    fajr: 43,
    dhuhr: 24,
    asr: 46,
  },
  // Fajr Jamat rounding (nearest N minutes)
  fajrRounding: 5,
  // Maghrib Jamat offset from Maghrib Start (seasonal)
  maghribJamatOffset: { summer: -1, winter: 0 },
  // Isha Start: Maghrib Jamat + offset (varies by month)
  ishaRuleOffsets: {
    default: 75,
    5: 75,  // May
    6: 70,  // June
    7: 70,  // July
    8: 80,  // August
    9: 80,  // September
  },
  // Isha Jamat interval from Isha Start (seasonal)
  ishaJamatInterval: { summer: 11, winter: 21 },

  // Prayer column display config
  prayerColumns: {
    maghrib: { showStart: false },
    isha: { showStart: false },
  },
};
