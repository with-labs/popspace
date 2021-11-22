import * as React from 'react';
import { Viewport } from '../viewport/Viewport';
import { Canvas } from './Canvas';

// A 'default' implementation of CanvasContext which essentially does nothing,
// might assist in easier isolated rendering of canvas-dependent components
const dummyCanvas = new Canvas(new Viewport({}));

export const CanvasContext = React.createContext<Canvas>(dummyCanvas);

/**
 * Abstractly, a CanvasProvider provides a way of handling changes to object positions,
 * including the act of moving an object and that of releasing it to a final location.
 */
export const CanvasProvider = CanvasContext.Provider;

export const useCanvas = () => React.useContext(CanvasContext);
