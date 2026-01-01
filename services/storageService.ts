import { GratitudeEntry, PrayerRequest } from "../types";

const KEYS = {
  PRAYERS: 'aposento_prayers',
  GRATITUDE: 'aposento_gratitude',
  LAST_DEVOTIONAL: 'aposento_devotional_cache',
  THEME_PREF: 'aposento_theme'
};

export const savePrayer = (prayer: PrayerRequest) => {
  const existing = getPrayers();
  const updated = [prayer, ...existing];
  localStorage.setItem(KEYS.PRAYERS, JSON.stringify(updated));
  return updated;
};

export const getPrayers = (): PrayerRequest[] => {
  const data = localStorage.getItem(KEYS.PRAYERS);
  return data ? JSON.parse(data) : [];
};

export const updatePrayer = (updatedPrayer: PrayerRequest) => {
    const existing = getPrayers();
    const updated = existing.map(p => p.id === updatedPrayer.id ? updatedPrayer : p);
    localStorage.setItem(KEYS.PRAYERS, JSON.stringify(updated));
    return updated;
}

export const deletePrayer = (id: string) => {
    const existing = getPrayers();
    const updated = existing.filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRAYERS, JSON.stringify(updated));
    return updated;
}

export const saveGratitude = (entry: GratitudeEntry) => {
  const existing = getGratitude();
  // Check if entry for today exists, if so update it, else unshift
  const todayIndex = existing.findIndex(e => e.date === entry.date);
  let updated;
  if (todayIndex >= 0) {
      updated = [...existing];
      updated[todayIndex] = entry;
  } else {
      updated = [entry, ...existing];
  }
  localStorage.setItem(KEYS.GRATITUDE, JSON.stringify(updated));
  return updated;
};

export const getGratitude = (): GratitudeEntry[] => {
  const data = localStorage.getItem(KEYS.GRATITUDE);
  return data ? JSON.parse(data) : [];
};

export const saveDevotionalCache = (devotional: any) => {
    localStorage.setItem(KEYS.LAST_DEVOTIONAL, JSON.stringify({
        date: new Date().toDateString(),
        data: devotional
    }));
};

export const getDevotionalCache = () => {
    const data = localStorage.getItem(KEYS.LAST_DEVOTIONAL);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed.date !== new Date().toDateString()) return null;
    return parsed.data;
};