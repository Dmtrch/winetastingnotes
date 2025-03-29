import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import { ALBUM_NAME } from '../constants/Constants';

class PhotoService {
  /**
   * Создает директорию для хранения изображений в приложении, если она не существует
   */
  private async ensureWineAlbumDirExists(): Promise<string> {
    const albumDir = FileSystem.documentDirectory + ALBUM_NAME + '/';
    
    try {
      const dirInfo = await FileSystem.getInfoAsync(albumDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(albumDir, { intermediates: true });
        console.log(`Создана директория альбома ${ALBUM_NAME}:`, albumDir);
      }
    } catch (error) {
      console.error(`Ошибка при создании директории альбома ${ALBUM_NAME}:`, error);
    }

    return albumDir;
  }

  /**
   * Запрашивает разрешения на доступ к камере и медиатеке
   */
  private async requestPermissions(): Promise<boolean> {
    // Запрос разрешения на использование камеры
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      Alert.alert('Требуется разрешение', 'Для работы приложению необходим доступ к камере');
      return false;
    }

    // Запрос разрешения на доступ к библиотеке медиа
    const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
    if (mediaStatus !== 'granted') {
      Alert.alert('Требуется разрешение', 'Для работы приложению необходим доступ к фотогалерее');
      return false;
    }

    return true;
  }

  /**
   * Сделать фото через камеру и сохранить в альбом приложения
   */
  async takePhoto(): Promise<string | null> {
    // Запрашиваем разрешения
    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      return null;
    }

    // Открываем камеру
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    if (!asset.uri) {
      return null;
    }

    // Сохраняем изображение в директорию приложения
    return await this.savePhotoToWineAlbum(asset.uri);
  }

  /**
   * Сохраняет фото в альбом приложения и возвращает путь
   */
  async savePhotoToWineAlbum(uri: string): Promise<string> {
    try {
      // Создаем директорию альбома если нужно
      const albumDir = await this.ensureWineAlbumDirExists();

      // Генерируем имя файла с временной меткой для уникальности
      const timestamp = new Date().getTime();
      const extension = uri.includes('.')
        ? uri.substring(uri.lastIndexOf('.'))
        : '.jpg';
      const fileName = `${ALBUM_NAME}_${timestamp}${extension}`;

      // Путь назначения в альбоме приложения
      const destPath = albumDir + fileName;

      // Копируем файл
      await FileSystem.copyAsync({
        from: uri,
        to: destPath
      });
      console.log(`Изображение скопировано в: ${destPath}`);

      return destPath;
    } catch (error) {
      console.error('Ошибка при сохранении фото в альбом приложения:', error);
      return uri; // В случае ошибки возвращаем исходный URI
    }
  }

  /**
   * Удаляет фото из файловой системы
   */
  async deletePhoto(photoUri: string): Promise<void> {
    if (!photoUri) {return;}

    try {
      const fileInfo = await FileSystem.getInfoAsync(photoUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(photoUri);
        console.log(`Успешно удалено фото: ${photoUri}`);
      }
    } catch (error) {
      console.error('Ошибка при удалении фото:', error);
    }
  }
  
  /**
   * Проверяет наличие всех разрешений для работы с фотографиями
   */
  async checkAndRequestAllPermissions(): Promise<boolean> {
    return await this.requestPermissions();
  }
}

export default new PhotoService();
