import { createContext } from 'react';
import { Viewport } from './Viewport';

export const ViewportContext = createContext<Viewport | null>(null);

export const ViewportProvider = ViewportContext.Provider;
