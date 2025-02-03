'use client';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import es from 'date-fns/locale/es';

export default function Providers({ children }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      {children}
    </LocalizationProvider>
  );
}
