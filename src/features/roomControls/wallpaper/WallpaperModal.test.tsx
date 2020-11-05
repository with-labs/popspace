import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { WallpaperModal } from './WallpaperModal';
// mocked
import { useCoordinatedDispatch } from '../../room/CoordinatedDispatchProvider';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { actions } from '../../room/roomSlice';
import { BUILT_IN_WALLPAPERS } from '../../../constants/wallpapers';

jest.mock('../../room/CoordinatedDispatchProvider', () => ({
  useCoordinatedDispatch: jest.fn().mockReturnValue(jest.fn()),
}));

// extract mock value
const mockDispatch = useCoordinatedDispatch() as jest.Mock;

describe('WallpaperModal component', () => {
  it('can set wallpaper from built-ins', async () => {
    const mockStore = createStore(() => ({
      roomControls: {
        isWallpaperModalOpen: true,
      },
      room: {
        wallpaperUrl: null,
      },
    }));

    const props = {};
    const result = render(<WallpaperModal {...props} />, {
      wrapper: (p) => <Provider store={mockStore} {...p} />,
    });

    fireEvent.click(result.getByLabelText('Default wallpaper 3'));

    expect(mockDispatch).toHaveBeenCalledWith(
      // index 2, because our label indices start at 1
      actions.updateRoomWallpaper({ wallpaperUrl: BUILT_IN_WALLPAPERS[2] })
    );
  });

  it('can set wallpaper from custom url', async () => {
    const mockStore = createStore(() => ({
      roomControls: {
        isWallpaperModalOpen: true,
      },
      room: {
        wallpaperUrl: null,
      },
    }));

    const props = {};
    const result = render(<WallpaperModal {...props} />, {
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
        isWallpaperModalOpen: true,
      },
      room: {
        wallpaperUrl: null,
      },
    }));

    const props = {};
    const result = render(<WallpaperModal {...props} />, {
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
