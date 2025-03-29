import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import JSZip from 'jszip';
import { decode as atob } from 'base-64';

/**
 * Вспомогательный класс для работы с экспортом и импортом данных
 */
class ExportHelper {
  /**
   * Создает ZIP-архив с данными JSON и фотографиями
   */
  async exportAsZipArchive(exportDir: string, jsonPath: string, imagesPaths: string[]): Promise<string> {
    try {
      const zip = new JSZip();

      // Добавляем JSON файл
      const jsonContent = await FileSystem.readAsStringAsync(jsonPath);
      zip.file('WineTastingData.json', jsonContent);

      // Добавляем папку для изображений
      const imagesFolder = zip.folder('exported_images');

      if (imagesFolder) {
        // Добавляем все изображения
        for (const imagePath of imagesPaths) {
          try {
            const imageName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
            const fileInfo = await FileSystem.getInfoAsync(imagePath);

            if (fileInfo.exists) {
              // Получаем содержимое файла как base64
              const base64 = await FileSystem.readAsStringAsync(imagePath, {
                encoding: FileSystem.EncodingType.Base64
              });
              imagesFolder.file(imageName, base64, { base64: true });
              console.log(`Добавлено изображение ${imageName} в ZIP`);
            } else {
              console.warn(`Файл не найден при создании ZIP: ${imagePath}`);
            }
          } catch (imgError) {
            console.error('Ошибка при добавлении изображения в ZIP:', imgError);
          }
        }
      }

      // Генерируем ZIP-файл
      const zipContent = await zip.generateAsync({ type: 'base64' });

      // Сохраняем ZIP-файл
      const zipPath = `${exportDir}/WineTastingExport.zip`;
      await FileSystem.writeAsStringAsync(zipPath, zipContent, {
        encoding: FileSystem.EncodingType.Base64
      });

      return zipPath;
    } catch (error) {
      console.error('Ошибка создания ZIP архива:', error);
      throw new Error('Не удалось создать ZIP архив');
    }
  }

  /**
   * Создает HTML файл с инструкциями
   */
  async createReadmeHTML(exportDir: string, _failedImages: number, _totalImages: number): Promise<string> {
    const htmlPath = `${exportDir}/README.html`;
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Экспортированные данные дегустационных заметок</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        h1 { color: #722F37; }
        .info { background: #f9f9f9; padding: 15px; border-left: 4px solid #722F37; }
      </style>
    </head>
    <body>
      <h1>Данные дегустационных заметок</h1>
      <div class="info">
        <p>Файлы успешно экспортированы.</p>
        <p><strong>WineTastingData.json</strong> - содержит все записи в формате JSON</p>
        <p><strong>/exported_images/</strong> - содержит все изображения, на которые ссылаются записи</p>
        <p><strong>WineTastingExport.zip</strong> - архив, содержащий JSON и изображения</p>
        <p>Для импорта данных обратно в приложение используйте функцию импорта.</p>
      </div>
    </body>
    </html>
    `;
    await FileSystem.writeAsStringAsync(htmlPath, htmlContent);
    return htmlPath;
  }

  /**
   * Удаляет временные файлы экспорта после завершения
   */
  async cleanupExportFiles(exportDir: string, keepTime: number = 60000): Promise<void> {
    try {
      // Планируем удаление через указанное время
      setTimeout(async () => {
        try {
          const fileInfo = await FileSystem.getInfoAsync(exportDir);
          if (fileInfo.exists) {
            console.log(`Начинаем удаление временной директории экспорта: ${exportDir}`);
            await FileSystem.deleteAsync(exportDir);
            console.log(`Успешно удалена директория экспорта: ${exportDir}`);
          } else {
            console.log(`Директория экспорта не найдена: ${exportDir}`);
          }
        } catch (error) {
          console.error('Ошибка при удалении временных файлов экспорта:', error);
          // Повторная попытка удаления
          setTimeout(async () => {
            try {
              const stillExists = await FileSystem.getInfoAsync(exportDir);
              if (stillExists.exists) {
                await FileSystem.deleteAsync(exportDir);
                console.log(`Повторная попытка: удалена директория экспорта: ${exportDir}`);
              }
            } catch (retryError) {
              console.error('Окончательная ошибка при удалении временных файлов:', retryError);
            }
          }, 60000);
        }
      }, keepTime);
    } catch (error) {
      console.error('Ошибка при планировании удаления временных файлов:', error);
    }
  }

  /**
   * Запрос разрешения на доступ к файловой системе
   */
  async requestStoragePermission(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.error('Ошибка запроса разрешений:', err);
      return false;
    }
  }

  /**
   * Шаринг ZIP-архива с экспортированными данными
   */
  async shareZipFile(zipPath: string, title: string): Promise<void> {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(zipPath, {
          mimeType: 'application/zip',
          dialogTitle: title,
          UTI: 'com.pkware.zip-archive' // Для iOS
        });
      } else {
        Alert.alert(
          'Информация о файле',
          `ZIP-архив с данными сохранен в:\n${zipPath}\n\nШаринг файлов не поддерживается на этом устройстве.`
        );
      }
    } catch (shareError) {
      console.error('Ошибка при шаринге файла:', shareError);
      Alert.alert(
        'Информация о файле',
        `ZIP-архив с данными сохранен в:\n${zipPath}\n\nВы можете найти этот файл через Файловый менеджер.`
      );
    }
  }

  /**
   * Распаковка ZIP-архива
   */
  async extractZipArchive(zipPath: string, extractDir: string): Promise<{jsonPath: string, imagesDir: string}> {
    try {
      // Создаем директорию для распаковки
      await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });

      // Читаем ZIP файл
      const zipData = await FileSystem.readAsStringAsync(zipPath, {
        encoding: FileSystem.EncodingType.Base64
      });
      const zip = new JSZip();
      await zip.loadAsync(zipData, { base64: true });

      // Директория для изображений
      const imagesDir = `${extractDir}/exported_images`;
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });

      // Распаковываем JSON
      let jsonPath = '';
      const jsonFile = zip.file('WineTastingData.json');
      if (jsonFile) {
        const jsonContent = await jsonFile.async('string');
        jsonPath = `${extractDir}/WineTastingData.json`;
        await FileSystem.writeAsStringAsync(jsonPath, jsonContent);
      }

      // Распаковываем изображения
      const imageFiles = zip.folder('exported_images');
      if (imageFiles) {
        const imageFileObjects = imageFiles.files;
        for (const filePath in imageFileObjects) {
          // Пропускаем директории и корневую папку
          if (filePath === 'exported_images/' || imageFileObjects[filePath].dir) {
            continue;
          }

          const fileName = filePath.replace('exported_images/', '');
          const fileData = await imageFileObjects[filePath].async('base64');
          const outputPath = `${imagesDir}/${fileName}`;

          await FileSystem.writeAsStringAsync(outputPath, fileData, {
            encoding: FileSystem.EncodingType.Base64
          });
          console.log(`Распакован файл: ${fileName}`);
        }
      }

      return { jsonPath, imagesDir };
    } catch (error) {
      console.error('Ошибка распаковки ZIP:', error);
      throw new Error('Не удалось распаковать ZIP-архив');
    }
  }
}

export default new ExportHelper();
