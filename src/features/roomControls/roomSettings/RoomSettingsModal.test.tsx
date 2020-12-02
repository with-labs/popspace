import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { RoomSettingsModal } from './RoomSettingsModal';
// mocked
import { useCoordinatedDispatch } from '../../room/CoordinatedDispatchProvider';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { actions } from '../../room/roomSlice';
import { wallPaperOptions } from './WallpaperOptions';

jest.mock('../../room/CoordinatedDispatchProvider', () => ({
  useCoordinatedDispatch: jest.fn().mockReturnValue(jest.fn()),
}));

jest.mock('@material-ui/core', () => ({
  ...(jest.requireActual('@material-ui/core') as any),
  useMediaQuery: () => false,
}));

// extract mock value
const mockDispatch = useCoordinatedDispatch() as jest.Mock;

describe('RoomSettingsModal component', () => {
  it('can set wallpaper from built-ins', async () => {
    const mockStore = createStore(() => ({
      roomControls: {
        isRoomSettingsModalOpen: true,
      },
      room: {
        wallpaperUrl: null,
      },
    }));

    const props = {};
    const result = render(<RoomSettingsModal {...props} />, {
      wrapper: (p) => <Provider store={mockStore} {...p} />,
    });

    fireEvent.click(result.getByLabelText(wallPaperOptions[2].name));

    expect(mockDispatch).toHaveBeenCalledWith(
      // index 2, because our label indices start at 1
      actions.updateRoomWallpaper({ wallpaperUrl: wallPaperOptions[2].url })
    );
  });

  it('can set wallpaper from custom url', async () => {
    const mockStore = createStore(() => ({
      roomControls: {
        isRoomSettingsModalOpen: true,
      },
      room: {
        wallpaperUrl: null,
      },
    }));

    const props = {};
    const result = render(<RoomSettingsModal {...props} />, {
      wrapper: (p) => <Provider store={mockStore} {...p} />,
    });

    fireEvent.change(result.getByLabelText('features.room.customWallpaperLabel'), {
      target: {
        value: 'https://imaginary.images/unicorn.png',
      },
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      // index 2, because our label indices start at 1
      actions.updateRoomWallpaper({ wallpaperUrl: 'https://imaginary.images/unicorn.png' })
    );
  });

  it('only accepts certain filetypes', async () => {
    const mockStore = createStore(() => ({
      roomControls: {
        isRoomSettingsModalOpen: true,
      },
      room: {
        wallpaperUrl: null,
      },
    }));

    const props = {};
    const result = render(<RoomSettingsModal {...props} />, {
      wrapper: (p) => <Provider store={mockStore} {...p} />,
    });

    fireEvent.change(result.getByLabelText('features.room.customWallpaperLabel'), {
      target: {
        value: 'https://imaginary.documents/unicorn.pdf',
      },
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
