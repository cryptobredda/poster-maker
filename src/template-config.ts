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
    latitude: 52.4590857,
    longitude: -1.9009277,
    timezone: 'Europe/London',
  },

  jumuahTimePosition: {
    x: 680,
    y: 1265,
    fontSize: 28,
  },

  // Calculation settings
  calculationMethod: 15, // 15 = Moonsighting Committee
  school: 0, // 0 = Shafi, 1 = Hanafi

  // Time offsets in minutes (positive = later, negative = earlier)
  timeOffsets: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },

  // Prayer column display config
  // showStart: false = combined (JAMAT only), true = non-combined (START + JAMAT)
  prayerColumns: {
    maghrib: { showStart: false },
    isha: { showStart: false },
  },
} as const;
