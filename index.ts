// --- безопасный шим для Metro на iOS dev-client ---
// В некоторых окружениях глобальный `require` ещё не проинициализирован,
// пока доступен внутренний загрузчик Metro `__r`. Аккуратно прокидываем его.
declare const global: any;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (typeof (global as any).require !== 'function' && typeof (global as any).__r === 'function') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (global as any).require = (global as any).__r;
}

// Обязательно самым первым делом — gesture handler, если используете навигацию
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);