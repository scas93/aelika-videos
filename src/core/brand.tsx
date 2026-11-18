import React, {createContext, useContext} from 'react';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/playfair-display/700-italic.css';

/**
 * Marca del negocio. Todo lo que cambia de un cliente a otro en colores,
 * tipografía y logo vive aquí.
 */
export type Brand = {
  /** Nombre comercial, p. ej. "Casa Occidente" */
  name: string;
  /** Logo redondo (avatar) dentro de /public, p. ej. "casa-occidente/logo.png" */
  logo: string;
  colors: {
    /** Fondo oscuro principal */
    dark: string;
    /** Variaciones del oscuro (degradados) */
    dark2: string;
    dark3: string;
    /** Color de acento de la marca */
    accent: string;
    accentLight: string;
    accentDark: string;
    /** Texto claro sobre fondo oscuro */
    light: string;
    /** Fondo claro del storefront */
    paper: string;
    /** Bordes suaves */
    line: string;
    /** Texto secundario */
    muted: string;
  };
  /** Tipografía de títulos (CSS font-family). Debe estar cargada vía @fontsource. */
  displayFont: string;
  /** Fondo del lienzo detrás del teléfono: oscuro (por defecto) o claro */
  canvas?: 'dark' | 'light';
};

export const DEFAULT_BRAND: Brand = {
  name: 'Mi negocio',
  logo: '',
  colors: {
    dark: '#16130f',
    dark2: '#211d19',
    dark3: '#2d2722',
    accent: '#b07a43',
    accentLight: '#d6a774',
    accentDark: '#7c5229',
    light: '#f4ede3',
    paper: '#f7f2eb',
    line: '#e5dccf',
    muted: '#8a7f73',
  },
  displayFont: '"Playfair Display", Georgia, serif',
};

const BrandContext = createContext<Brand>(DEFAULT_BRAND);

export const BrandProvider: React.FC<{brand: Brand; children: React.ReactNode}> = ({brand, children}) => (
  <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>
);

export const useBrand = () => useContext(BrandContext);
