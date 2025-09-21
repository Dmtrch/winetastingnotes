import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import HomeButton from '../components/HomeButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import WineRecordService from '../services/WineRecordService';
import { WineRecord } from '../constants/WineRecord';
import Logo from '../components/Logo';
import ExportHelper from '../services/ExportHelper';
import { EXPORT_FILE_PREFIX, RECORDS_FILENAME } from '../constants/Constants';

// Объявляем тип для полей фотографий
type PhotoField = 'bottlePhoto' | 'labelPhoto' | 'backLabelPhoto' | 'plaquePhoto';

type ExportImportScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExportImport'>;

interface FileItem {
  name: string;
  path: string;
  isZip?: boolean;
  isWineTastingFile?: boolean; // Добавлено: флаг для файлов WineTasting
}

const ExportImportScreen = () => {
  const navigation = useNavigation<ExportImportScreenNavigationProp>();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <HomeButton />,
    });
  }, [navigation]);

  const [isLoading, setIsLoading] = useState(false);

  /**
   * Запрос разрешения на доступ к файловой системе
   */
  const requestStoragePermission = async (): Promise<boolean> => {
    return await ExportHelper.requestStoragePermission();
  };

  /**
   * Создает подготовленные данные для экспорта с ссылками на изображения
   */
  const prepareExportData = async (records: WineRecord[]): Promise<{ data: any[], images: { uri: string, name: string }[] }> => {
    const imagesToExport: { uri: string, name: string }[] = [];

    // Клонируем записи для модификации без изменения оригиналов
    const exportData = JSON.parse(JSON.stringify(records));

    // Модифицируем пути к изображениям для экспорта
    for (let i = 0; i < exportData.length; i++) {
      const record = exportData[i];

      // Обработка фото бутылки
      if (record.bottlePhoto) {
        // Получаем расширение файла или используем .jpg по умолчанию
        const extension = record.bottlePhoto.includes('.')
          ? record.bottlePhoto.substring(record.bottlePhoto.lastIndexOf('.'))
          : '.jpg';
        const fileName = `bottle_${i}_${new Date().getTime()}${extension}`;

        // Добавляем в список для копирования
        imagesToExport.push({
          uri: record.bottlePhoto,
          name: fileName,
        });

        // Устанавливаем относительный путь в экспортируемых данных
        exportData[i].bottlePhoto = `exported_images/${fileName}`;
      }

      // Обработка фото этикетки
      if (record.labelPhoto) {
        const extension = record.labelPhoto.includes('.')
          ? record.labelPhoto.substring(record.labelPhoto.lastIndexOf('.'))
          : '.jpg';
        const fileName = `label_${i}_${new Date().getTime()}${extension}`;

        imagesToExport.push({
          uri: record.labelPhoto,
          name: fileName,
        });

        exportData[i].labelPhoto = `exported_images/${fileName}`;
      }

      // Обработка фото контрэтикетки
      if (record.backLabelPhoto) {
        const extension = record.backLabelPhoto.includes('.')
          ? record.backLabelPhoto.substring(record.backLabelPhoto.lastIndexOf('.'))
          : '.jpg';
        const fileName = `backlabel_${i}_${new Date().getTime()}${extension}`;

        imagesToExport.push({
          uri: record.backLabelPhoto,
          name: fileName,
        });

        exportData[i].backLabelPhoto = `exported_images/${fileName}`;
      }

      // Обработка фото плакетки
      if (record.plaquePhoto) {
        const extension = record.plaquePhoto.includes('.')
          ? record.plaquePhoto.substring(record.plaquePhoto.lastIndexOf('.'))
          : '.jpg';
        const fileName = `plaque_${i}_${new Date().getTime()}${extension}`;

        imagesToExport.push({
          uri: record.plaquePhoto,
          name: fileName,
        });

        exportData[i].plaquePhoto = `exported_images/${fileName}`;
      }
    }

    return { data: exportData, images: imagesToExport };
  };

  /**
   * Экспорт всех записей: создаёт ZIP-архив с JSON-файлом и изображениями
   */
  const handleExportWithPhotos = async () => {
    try {
      setIsLoading(true);
      const recordsToExport = WineRecordService.getRecords();

      // Проверка разрешений
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Ошибка', 'Нет разрешения на доступ к файловой системе');
        setIsLoading(false);
        return;
      }

      if (recordsToExport.length === 0) {
        Alert.alert('Информация', 'Нет записей для экспорта');
        setIsLoading(false);
        return;
      }

      // Подготавливаем данные и список изображений
      const { data, images } = await prepareExportData(recordsToExport);

      // Определяем папки для экспорта
      const timestamp = new Date().getTime();
      const exportDirName = `${EXPORT_FILE_PREFIX}_${timestamp}`;
      const exportDir = FileSystem.documentDirectory + exportDirName;

      // Создаём директорию для экспорта
      await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

      // Создаём директорию для изображений
      const imagesDir = `${exportDir}/exported_images`;
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });

      // Копируем все изображения
      let failedImages = 0;
      const successfulImagePaths: string[] = [];

      for (const image of images) {
        try {
          const sourceUri = image.uri;
          const targetPath = `${imagesDir}/${image.name}`;

          // Проверяем, существует ли фотография по указанному URI
          const fileInfo = await FileSystem.getInfoAsync(sourceUri);
          if (fileInfo.exists) {
            await FileSystem.copyAsync({
              from: sourceUri,
              to: targetPath
            });
            successfulImagePaths.push(targetPath);
            console.log(`Скопирован файл: ${image.name}`);
          } else {
            failedImages++;
            console.warn(`Файл не найден: ${sourceUri}`);
          }
        } catch (copyError) {
          failedImages++;
          console.error(`Ошибка копирования изображения ${image.name}:`, copyError);
        }
      }

      // Сохраняем JSON с данными
      const jsonPath = `${exportDir}/WineTastingData.json`;
      await FileSystem.writeAsStringAsync(jsonPath, JSON.stringify(data, null, 2));

      if (failedImages > 0) {
        console.warn(`Не удалось скопировать ${failedImages} из ${images.length} изображений`);
      }

      // Создаем ZIP архив
      const zipPath = await ExportHelper.exportAsZipArchive(exportDir, jsonPath, successfulImagePaths);

      // Создаем HTML файл с инструкциями
      await ExportHelper.createReadmeHTML(exportDir, failedImages, images.length);

      // Показываем уведомление об успешном экспорте
      const messageText = failedImages > 0
        ? `Данные успешно экспортированы.\n\nНе удалось скопировать некоторые изображения (${failedImages} из ${images.length}).\n\nСоздан ZIP-архив с JSON и изображениями.`
        : `Данные успешно экспортированы.\n\nСоздан ZIP-архив с JSON и изображениями.`;

      Alert.alert(
        'Экспорт выполнен',
        messageText
      );

      // Шарим ZIP-архив
      await ExportHelper.shareZipFile(zipPath, 'Экспорт данных дегустационных заметок о винах');

      // Планируем удаление временных файлов после завершения
      ExportHelper.cleanupExportFiles(exportDir);
    } catch (error) {
      console.error('General export error:', error);
      Alert.alert('Ошибка экспорта', error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Переход на экран экспорта выбранных записей
   */
  const handleExportSelected = () => {
    const records = WineRecordService.getRecords();
    if (records.length === 0) {
      Alert.alert('Информация', 'Нет записей для экспорта');
      return;
    }
    navigation.navigate('ExportSelect');
  };

  /**
   * Выбор файла для импорта с помощью Expo DocumentPicker
   */
  // Исправляем функцию handleImportFile
const handleImportFile = async () => {
    try {
      // Проверка разрешений
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Ошибка', 'Нет разрешения на доступ к файловой системе');
        return;
      }
  
      // Открываем диалог выбора файла
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'application/zip'],
        copyToCacheDirectory: true,
      });
  
      if (result.canceled) {
        console.log('Выбор файла отменен');
        return;
      }
  
      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name || 'unknown_file';
      
      console.log(`Выбран файл: ${fileName}, URI: ${fileUri}`);
      
      // Импортируем файл
      await handleImportFromFile(fileUri);
    } catch (error) {
      console.error('Ошибка при выборе файла:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать файл для импорта');
    }
  };
  
    
      /**
       * Функция импорта данных из выбранного файла с поддержкой относительных изображений.
       */
      const handleImportFromFile = async (filePath: string) => {
        try {
          setIsLoading(true);
    
          let jsonContent: string;
          let imagesDir: string = '';
          let isZipFile = filePath.toLowerCase().endsWith('.zip');
          let extractDir = '';
    
          // Если импортируем ZIP-файл
          if (isZipFile) {
            try {
              extractDir = `${FileSystem.documentDirectory}/WineTasting_Import_${new Date().getTime()}`;
              await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });
              
              const extractResult = await ExportHelper.extractZipArchive(filePath, extractDir);
              jsonContent = await FileSystem.readAsStringAsync(extractResult.jsonPath);
              imagesDir = extractResult.imagesDir;
            } catch (zipError) {
              console.error('Ошибка распаковки ZIP:', zipError);
              Alert.alert('Ошибка импорта', 'Не удалось распаковать ZIP архив');
              setIsLoading(false);
              return;
            }
          } else {
            // Если импортируем JSON-файл
            jsonContent = await FileSystem.readAsStringAsync(filePath);
            // Получаем директорию, где находится JSON-файл
            const lastSlash = filePath.lastIndexOf('/');
            if (lastSlash !== -1) {
              imagesDir = filePath.substring(0, lastSlash) + '/exported_images';
            }
          }
    
          let parsedData: WineRecord[] = [];
          try {
            parsedData = JSON.parse(jsonContent) as WineRecord[];
          } catch (parseError) {
            Alert.alert('Ошибка', 'Файл содержит некорректный JSON-формат');
            setIsLoading(false);
            return;
          }
    
          if (Array.isArray(parsedData)) {
            // Проверяем структуру данных
            if (parsedData.length > 0 &&
                typeof parsedData[0] === 'object' &&
                parsedData[0] !== null &&
                'wineName' in parsedData[0] &&
                'wineryName' in parsedData[0]) {
    
              // Обрабатываем относительные пути к изображениям
              for (let i = 0; i < parsedData.length; i++) {
                const record = parsedData[i];
                console.log(`Обработка записи ${i + 1}/${parsedData.length}: ${record.wineName}`);
    
                // Обрабатываем все 4 поля изображений
                const imageFields = ['bottlePhoto', 'labelPhoto', 'backLabelPhoto', 'plaquePhoto'];
    
                for (const field of imageFields as PhotoField[]) {
                  const fieldValue = record[field];
                  if (fieldValue && typeof fieldValue === 'string' && fieldValue.startsWith('exported_images/')) {
                    // Проверяем, существует ли файл изображения в указанной директории
                    const imagePath = `${imagesDir}/${fieldValue.replace('exported_images/', '')}`;
                    const imageInfo = await FileSystem.getInfoAsync(imagePath);
                    const imageExists = imageInfo.exists;
                    console.log(`Проверка изображения ${field}: ${imagePath}, существует: ${imageExists}`);
    
                    if (imageExists) {
                      // Создаем директорию для сохранения изображений
                      const albumDir = FileSystem.documentDirectory + 'winetastenote';
                      
                      // Убеждаемся, что директория для изображений существует
                      try {
                        const dirInfo = await FileSystem.getInfoAsync(albumDir);
                        if (!dirInfo.exists) {
                          await FileSystem.makeDirectoryAsync(albumDir, { intermediates: true });
                          console.log('Создана директория для изображений:', albumDir);
                        }
                      } catch (mkdirError) {
                        console.error('Ошибка создания директории:', mkdirError);
                      }
    
                      // Формируем имя файла для сохранения
                      const imageFileName = `winetastenote_${new Date().getTime()}_${fieldValue.split('/').pop() || ''}`;
                      const newImagePath = `${albumDir}/${imageFileName}`;
    
                      try {
                        // Копируем файл изображения в альбом приложения
                        await FileSystem.copyAsync({
                          from: imagePath,
                          to: newImagePath
                        });
                        console.log(`Изображение скопировано: ${newImagePath}`);
    
                        // Обновляем путь к изображению
                        parsedData[i][field] = newImagePath;
                      } catch (copyError) {
                        console.error(`Ошибка копирования ${field}:`, copyError);
                        // Если копирование не удалось, очищаем поле
                        parsedData[i][field] = '';
                      }
                    } else {
                      console.log(`Не найдено изображение: ${imagePath}`);
                      // Если изображение не найдено, очищаем поле
                      parsedData[i][field] = '';
                    }
                  }
                }
              }
    
              const currentRecords = WineRecordService.getRecords();
    
              // Опция импорта: заменить все или добавить
              Alert.alert(
                'Импорт данных',
                `Найдено ${parsedData.length} записей. Как импортировать данные?`,
                [
                  {
                    text: 'Заменить все',
                    onPress: async () => {
                      WineRecordService.importRecords(JSON.stringify(parsedData));
                      
                      // Сохраняем обновленные записи в файл
                      const filePath = FileSystem.documentDirectory + RECORDS_FILENAME;
                      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(parsedData, null, 2));
                      
                      Alert.alert('Успех', `Данные импортированы, загружено ${parsedData.length} записей`);
                      setIsLoading(false);
    
                      // Удаляем временные файлы после импорта, если это был ZIP
                      if (extractDir) {
                        ExportHelper.cleanupExportFiles(extractDir, 0);
                      }
                    },
                  },
                  {
                    text: 'Добавить к существующим',
                    onPress: async () => {
                      const newRecords = currentRecords.concat(parsedData);
                      WineRecordService.importRecords(JSON.stringify(newRecords));
                      
                      // Сохраняем обновленные записи в файл
                      const filePath = FileSystem.documentDirectory + RECORDS_FILENAME;
                      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(newRecords, null, 2));
                      
                      Alert.alert('Успех', `Данные добавлены, всего записей: ${newRecords.length}`);
                      setIsLoading(false);
    
                      // Удаляем временные файлы после импорта, если это был ZIP
                      if (extractDir) {
                        ExportHelper.cleanupExportFiles(extractDir, 0);
                      }
                    },
                  },
                  {
                    text: 'Отмена',
                    style: 'cancel',
                    onPress: () => {
                      setIsLoading(false);
    
                      // Удаляем временные файлы после отмены, если это был ZIP
                      if (extractDir) {
                        ExportHelper.cleanupExportFiles(extractDir, 0);
                      }
                    },
                  },
                ]
              );
            } else {
              Alert.alert('Ошибка', 'Файл не содержит данные в нужном формате');
              setIsLoading(false);
    
              // Удаляем временные файлы после ошибки, если это был ZIP
              if (extractDir) {
                ExportHelper.cleanupExportFiles(extractDir, 0);
              }
            }
          } else {
            Alert.alert('Ошибка', 'Файл не содержит массив записей');
            setIsLoading(false);
    
            // Удаляем временные файлы после ошибки, если это был ZIP
            if (extractDir) {
              ExportHelper.cleanupExportFiles(extractDir, 0);
            }
          }
        } catch (error) {
          console.error('Error importing file:', error);
          Alert.alert('Ошибка импорта', 'Не удалось прочитать файл или импортировать данные');
          setIsLoading(false);
        }
      };
    
      return (
        <SafeAreaView style={styles.container}>
          <Logo />
          <Text style={styles.header}>Экспорт и импорт данных</Text>
    
          <View style={styles.buttonContainer}>
            <Button
              title="Экспорт всех данных"
              onPress={handleExportWithPhotos}
              color="#3498DB"
              disabled={isLoading}
            />
          </View>
    
          <View style={styles.buttonContainer}>
            <Button
              title="Экспорт выбранных данных"
              onPress={handleExportSelected}
              color="#2ECC71"
              disabled={isLoading}
            />
          </View>
    
          <View style={styles.buttonContainer}>
            <Button
              title="Импорт данных"
              onPress={handleImportFile}
              color="#F39C12"
              disabled={isLoading}
            />
          </View>
    
          {/* Загрузочный индикатор */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498DB" />
              <Text style={styles.loadingText}>Пожалуйста, подождите...</Text>
            </View>
          )}
        </SafeAreaView>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
      },
      header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
      },
      subHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 10,
        textAlign: 'center',
      },
      importHint: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
      },
      buttonContainer: {
        marginVertical: 10,
      },
      loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      },
      loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
      },
    });
    
    export default ExportImportScreen;

