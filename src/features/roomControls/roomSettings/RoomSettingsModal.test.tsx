import React from 'react';
import { render, fireEvent, waitForElement, wait } from '@testing-library/react';
import { RoomSettingsModal } from './RoomSettingsModal';
import { MuiThemeProvider } from '@material-ui/core';
import { mandarin as theme } from '../../../theme/theme';

// mocked
import { useCoordinatedDispatch } from '../../room/CoordinatedDispatchProvider';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { actions } from '../../room/roomSlice';
import { wallPaperOptions } from './WallpaperOptions';

const TEST_CATEGORY = 'todoBoards';

jest.mock('../../room/CoordinatedDispatchProvider', () => ({
  useCoordinatedDispatch: jest.fn().mockReturnValue(jest.fn()),
}));

jest.mock('@material-ui/core', () => ({
  ...(jest.requireActual('@material-ui/core') as any),
  useMediaQuery: () => false,
}));

// extract mock value
const mockDispatch = useCoordinatedDispatch() as jest.Mock;

const renderWrapper = (p: any, mockStore: any) => (
  <MuiThemeProvider theme={theme}>
    <Provider store={mockStore} {...p} />
  </MuiThemeProvider>
);

describe('RoomSettingsModal component', () => {
  it('can set wallpaper from built-ins', async () => {
    const mockStore = createStore(() => ({
      roomControls: {
        isRoomSettingsModalOpen: true,
      },
      room: {
        wallpaperUrl: null,
        isCustomWallpaper: false,
      },
    }));

    const props = {};
    const result = render(<RoomSettingsModal {...props} />, {
      wrapper: (p) => renderWrapper(p, mockStore),
    });

    fireEvent.click(result.getByRole('button', { name: wallPaperOptions[TEST_CATEGORY][2].name }));

    expect(mockDispatch).toHaveBeenCalledWith(
      actions.updateRoomWallpaper({ wallpaperUrl: wallPaperOptions[TEST_CATEGORY][2].url, isCustomWallpaper: false })
    );
  });

  it('can set wallpaper from custom url', async () => {
    const mockStore = createStore(() => ({
      roomControls: {
        isRoomSettingsModalOpen: true,
      },
      room: {
        wallpaperUrl: null,
        isCustomWallpaper: false,
      },
    }));

    const props = {};
    const result = render(<RoomSettingsModal {...props} />, {
      wrapper: (p) => renderWrapper(p, mockStore),
    });

    // notes for how to test fomik changes and submits, see this article
    // https://dev.to/charlespeters/formik-react-testing-library-and-screaming-at-a-computer-for-an-hour-5h5f
    const input = await waitForElement(() => result.getByLabelText('features.room.customWallpaperLabel'));
    const button = await waitForElement(() => result.getByRole('button', { name: 'custom-wallpaper-submit-button' }));

    fireEvent.change(input, {
      target: {
        value: 'https://imaginary.images/unicorn.png',
      },
    });

    fireEvent.click(button);

    wait(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        actions.updateRoomWallpaper({ wallpaperUrl: 'https://imaginary.images/unicorn.png', isCustomWallpaper: true })
      );
    });
  });

  it('only accepts certain filetypes', async () => {
    const mockStore = createStore(() => ({
      roomControls: {
        isRoomSettingsModalOpen: true,
      },
      room: {
        wallpaperUrl: null,
        isCustomWallpaper: false,
      },
    }));

    const props = {};
    const result = render(<RoomSettingsModal {...props} />, {
      wrapper: (p) => renderWrapper(p, mockStore),
    });

    const input = await waitForElement(() => result.getByLabelText('features.room.customWallpaperLabel'));
    const button = await waitForElement(() => result.getByRole('button', { name: 'custom-wallpaper-submit-button' }));

    fireEvent.change(input, {
      target: {
        value: 'https://imaginary.documents/unicorn.pdf',
      },
    });

    fireEvent.click(button);
    wait(() => {
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});
