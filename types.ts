export interface Stream {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

export interface AppConfig {
  radioName: string;
  primaryColor: string; // Hex code
  logoUrl: string;
  streams: Stream[];
}

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface PrayerData {
  timings: PrayerTimings;
  date: {
    readable: string;
    hijri: {
      date: string;
      month: { en: string };
      weekday: { en: string };
    };
  };
  meta: {
    timezone: string;
  };
}

export interface LocationData {
  latitude: number;
  longitude: number;
  country?: string;
  city?: string;
}