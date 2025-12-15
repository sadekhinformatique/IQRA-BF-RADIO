import { AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  radioName: "RADIO IQRA BF",
  primaryColor: "#10B981", // Emerald-500
  logoUrl: "https://picsum.photos/400/400", // Placeholder
  streams: [
    {
      id: '1',
      title: 'Main Stream (Quran)',
      url: 'https://stream.zeno.fm/0r0xa792kwzuv', // Example stream
      active: true,
    },
    {
      id: '2',
      title: 'Backup Stream 1',
      url: 'https://stream.zeno.fm/v3p6454402quv', // Example stream
      active: true,
    },
    {
      id: '3',
      title: 'Backup Stream 2',
      url: 'https://l3.itworkscdn.net/itwaudio/9006/stream', // Example stream
      active: true,
    }
  ]
};

export const STORAGE_KEY = 'radio_iqra_config_v1';