import { create } from 'zustand';
import { GeoLocation } from './api';

interface LocationStore {
  location: GeoLocation | null;
  setLocation: (location: GeoLocation) => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  location: null,
  setLocation: (location: GeoLocation) => set({ location }),
}));
