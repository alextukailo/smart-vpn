import { type ReactElement } from 'react';

import { DashboardPage } from '@renderer/pages/dashboard';

import { QueryProvider } from './providers';

const App = (): ReactElement => {
  return (
    <QueryProvider>
      <DashboardPage />
    </QueryProvider>
  );
};

export default App;
