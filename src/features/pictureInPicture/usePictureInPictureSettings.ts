import create from 'zustand';

const AUTOPIP_SETTING = 'disableAutoPIP';

export type PictureInPictureSettingsState = {
  autoPIPEnabled: boolean;
  api: {
    setAutoPIPEnabled(val: boolean): void;
  };
};

export const usePictureInPictureSettings = create<PictureInPictureSettingsState>((set) => ({
  autoPIPEnabled: localStorage.getItem(AUTOPIP_SETTING) !== 'true',
  api: {
    setAutoPIPEnabled: (val: boolean) => {
      set({ autoPIPEnabled: val });
      localStorage.setItem(AUTOPIP_SETTING, `${!val}`);
    },
  },
}));
