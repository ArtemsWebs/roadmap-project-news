import { useLocationStore } from './locationStore';
import { LANGUAGES, useFiltersStore } from '@/app/news/filters/model';

export const initLocationSync = () =>
  useLocationStore.subscribe((state, prev) => {
    const code = state.location?.countryCode;
    console.log(code);
    const findEqualToFilters = LANGUAGES.find((lang) => lang.label === code);
    if (code && code !== prev.location?.countryCode) {
      useFiltersStore.getState().patchFilters({
        lang: findEqualToFilters ? [findEqualToFilters.code] : ['eng'],
      });
    }
  });
