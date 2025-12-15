import { AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  radioName: "RADIO IQRA BF",
  primaryColor: "#10B981", // Emerald-500
  logoUrl: "https://i.pinimg.com/1200x/f6/d3/f6/f6d3f61ec150126bb68dcd3fc45aa508.jpg", // Placeholder
  streams: [
    {
      id: '1',
      title: 'Main Stream (Quran)',
      url: 'https://stream.zeno.fm/ztmkyozjspltv', // Example stream
      active: true,
    },
    {
      id: '2',
      title: 'Backup Stream 1',
      url: 'https://stream.zeno.fm/ztmkyozjspltv.m3u', // Example stream
      active: true,
    },
    {
      id: '3',
      title: 'Backup Stream 2',
      url: 'https://stream.zeno.fm/ztmkyozjspltv.pls', // Example stream
      active: true,
    }
  ]
};

export const STORAGE_KEY = 'radio_iqra_config_v1';
