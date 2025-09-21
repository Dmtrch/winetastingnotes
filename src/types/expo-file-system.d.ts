// src/types/expo-file-system.d.ts
// Дополняем типы expo-file-system для совместимости TS.
// Не влияет на рантайм, только на проверку типов.
declare module 'expo-file-system' {
  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;

  // Expo допускает строковые значения 'utf8' | 'base64'.
  // Добавляем enum-подобное пространство имён для удобного доступа:
  export namespace EncodingType {
    const UTF8: 'utf8';
    const Base64: 'base64';
  }
}
