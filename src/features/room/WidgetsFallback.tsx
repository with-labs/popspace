import React, { useState } from 'react';
import { WithModal } from '../../withComponents/WithModal/WithModal';

export const WidgetsFallback = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <WithModal isOpen={isOpen} onCloseHandler={() => setIsOpen(false)}>
      <h1 className="u-fontH1">Accessories error</h1>
      <p className="u-fontP1">
        An error occurred while setting up the room's accessories. Try refreshing the page and rejoining the room to fix
        this error.
      </p>
    </WithModal>
  );
};
