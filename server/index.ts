import { createApp } from './app.ts';
import { Store } from './store.ts';
const store = new Store(process.env.AGARENA_DB ?? 'data/agarena.sqlite');
const server = createApp(store).listen(8787, '127.0.0.1', () => console.log('AgArena API + built demo: http://127.0.0.1:8787'));
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => server.close(() => { store.close(); process.exit(0); }));
