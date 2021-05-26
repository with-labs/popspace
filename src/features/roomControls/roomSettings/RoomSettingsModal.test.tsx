/* eslint-disable import/first */
const updateRoomState = jest.fn();
jest.mock('@roomState/useRoomStore', () => ({ useRoomStore: () => updateRoomState }));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { RoomSettingsModal } from './RoomSettingsModal';
import { MuiThemeProvider } from '@material-ui/core';
import { mandarin as theme } from '../../../theme/theme';

// mocked
import { wallPaperOptions } from './WallpaperOptions';
import { useRoomModalStore } from '../useRoomModalStore';

const TEST_CATEGORY = 'todoBoards';

jest.mock('@material-ui/core', () => ({
  ...(jest.requireActual('@material-ui/core') as any),
  useMediaQuery: () => false,
}));

const Wrapper = (p: any) => <MuiThemeProvider theme={theme} {...p} />;
describe('RoomSettingsModal component', () => {
  beforeEach(() => {
    useRoomModalStore.getState().api.openModal('settings');
  });

  it('can set wallpaper from built-ins', async () => {
    const props = {};
    const result = render(<RoomSettingsModal {...props} />, {
      wrapper: Wrapper,
    });

    fireEvent.click(result.getByRole('button', { name: wallPaperOptions[TEST_CATEGORY][2].name }));

    expect(updateRoomState).toHaveBeenCalledWith(
      // index 2, because our label indices start at 1
      { wallpaperUrl: wallPaperOptions[TEST_CATEGORY][2].url, isCustomWallpaper: false }
    );
  });

  it('can set wallpaper from custom url', async () => {
    const props = {};
    const result = render(<RoomSettingsModal {...props} />, {
      wrapper: Wrapper,
    });

    // notes for how to test fomik changes and submits, see this article
    // https://dev.to/charlespeters/formik-react-testing-library-and-screaming-at-a-computer-for-an-hour-5h5f
    const input = await result.findByLabelText('Link to an image ( JPG, PNG, WEBP, and GIF are supported )');
    const button = await result.findByTestId('custom-wallpaper-submit-button');

    fireEvent.change(input, {
      target: {
        value: 'https://imaginary.images/unicorn.png',
      },
    });

    fireEvent.click(button);

    waitFor(() => {
      expect(updateRoomState).toHaveBeenCalledWith({
        wallpaperUrl: 'https://imaginary.images/unicorn.png',
        isCustomWallpaper: true,
      });
    });
  });

  it('only accepts certain filetypes', async () => {
    const props = {};
    const result = render(<RoomSettingsModal {...props} />, {
      wrapper: Wrapper,
    });

    const input = await result.findByLabelText('Link to an image ( JPG, PNG, WEBP, and GIF are supported )');
    const button = await result.findByTestId('custom-wallpaper-submit-button');

    fireEvent.change(input, {
      target: {
        value: 'https://imaginary.documents/unicorn.pdf',
      },
    });

    fireEvent.click(button);
    expect(updateRoomState).not.toHaveBeenCalled();
  });
});
