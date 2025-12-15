import { PrayerData } from '../types';

export const fetchPrayerTimes = async (lat: number, lon: number): Promise<PrayerData | null> => {
  try {
    const date = new Date();
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    // Using Aladhan API which is free and reliable
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${lat}&longitude=${lon}&method=2`
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return null;
  }
};

export const fetchLocationName = async (lat: number, lon: number): Promise<{city: string, country: string} | null> => {
    // Basic reverse geocoding approximation or mock since generic browser API doesn't give city directly
    // Ideally we would use a dedicated Geocoding API here (like Google Maps or OpenStreetMap)
    // For this demo, we will try to use a free reverse geocoding endpoint if available, or fallback.
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await response.json();
        return {
            city: data.city || data.locality || 'Unknown City',
            country: data.countryName || 'Unknown Country'
        };
    } catch (e) {
        return null;
    }
}