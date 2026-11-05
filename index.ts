import { registerRootComponent } from 'expo';

import App from './App';
import { getDatabase } from './src/data/db';

async function startApp(): Promise<void> {
  await getDatabase();
  registerRootComponent(App);
}

void startApp().catch((error: unknown) => {
  console.error('Failed to initialize the local database.', error);
});
