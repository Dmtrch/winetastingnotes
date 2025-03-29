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
  SafeAreaView,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import WineRecordService from '../services/WineRecordService';
import { WineRecord } from '../constants/WineRecord';
import Logo from '../components/Logo';
import ExportHelper from '../services/ExportHelper';
import { EXPORT_FILE_PREFIX } from '../constants/Constants';
import ExportSelectItem from '../components/ExportSelectItem';

type ExportSelectScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExportSelect'>;

const ExportSelectScreen = () => {
  const navigation = useNavigation<ExportSelectScreenNavigationProp>();
  const [records, setRecords] = useState<WineRecord[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Загружаем записи при первом рендере
    const allRecords = WineRecordService.getRecords();
    setRecords(allRecords);
  }, []);

  /**
   * Переключает выбор записи по индексу.
   * Если запись уже была выбрана, убираем её из массива.
   * Если не была выбрана, добавляем в массив.
   */
  const toggleSelectRecord = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(item => item !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  /**
   * Выбирает все записи
   */
  const selectAll = () => {
    const allIndices = records.map((_, index) => index);
    setSelectedIndices(allIndices);
  };

  /**
   * Снимает выбор со всех записей
   */
  const unselectAll = () => {
    setSelectedIndices([]);
  };

  /**
   * Получение выбранных записей
   */
  const getSelectedRecords = (): WineRecord[] => {
    return selectedIndices.map(index => records[index]);
  };

  /**
   * Создает подготовленные данные для экспорта с ссылками на изображения
   */
  const prepareExportData = async (selectedRecords: WineRecord[]): Promise<{ data: any[], images: { uri: string, name: string }[] }> => {
    const imagesToExport: { uri: string, name: string }[] = [];

    // Клонируем записи для модификации без изменения оригиналов
    const exportData = JSON.parse(JSON.stringify(selectedRecords));

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
   * Экспорт выбранных записей
   */
  const handleExportSelected = async () => {
    const selectedRecords = getSelectedRecords();

    if (selectedRecords.length === 0) {
      Alert.alert('Информация', 'Не выбрано ни одной записи для экспорта');
      return;
    }

    try {
      setIsLoading(true);

      // Проверка разрешений для доступа к файловой системе
      const hasPermission = await ExportHelper.requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Ошибка', 'Нет разрешения на доступ к файловой системе');
        setIsLoading(false);
        return;
      }

      // Подготавливаем данные и список изображений
      const { data, images } = await prepareExportData(selectedRecords);

      // Создаем временную директорию для экспорта
      const timestamp = new Date().getTime();
      const exportDirName = `${EXPORT_FILE_PREFIX}_Selected_${timestamp}`;
      const exportDir = FileSystem.documentDirectory + exportDirName;
      
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

          // Проверяем, существует ли фотография
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
        ? `Выбранные данные успешно экспортированы в папку:\n${exportDir}\n\nНе удалось скопировать некоторые изображения (${failedImages} из ${images.length}).\n\nСоздан ZIP-архив с JSON и изображениями.`
        : `Выбранные данные успешно экспортированы в папку:\n${exportDir}\n\nСоздан ZIP-архив с JSON и изображениями.`;

      Alert.alert(
        'Экспорт выполнен',
        messageText
      );

      // Шарим ZIP-архив
      await ExportHelper.shareZipFile(zipPath, 'Экспорт выбранных данных о винах (ZIP)');

      // Планируем удаление временных файлов после завершения
      ExportHelper.cleanupExportFiles(exportDir);
    } catch (error) {
      console.error('General export error:', error);
      Alert.alert('Ошибка экспорта', error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  // Рендер элемента списка с использованием отдельного компонента
  const renderItem = ({ item, index }: { item: WineRecord; index: number }) => (
    <ExportSelectItem
      item={item}
      index={index}
      isSelected={selectedIndices.includes(index)}
      onToggle={toggleSelectRecord}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Logo />
      <Text style={styles.header}>Выберите записи для экспорта</Text>

      <View style={styles.selectAllContainer}>
        <View style={styles.buttonGroup}>
          <Button
            title="Выбрать все"
            onPress={selectAll}
            color="#3498DB"
            disabled={isLoading || records.length === 0}
          />
        </View>
        <View style={styles.buttonGroup}>
          <Button
            title="Снять все"
            onPress={unselectAll}
            color="#E74C3C"
            disabled={isLoading || selectedIndices.length === 0}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Выбрано: {selectedIndices.length} из {records.length} записей
        </Text>
      </View>

      <FlatList
        data={records}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Нет доступных записей</Text>}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Экспортировать выбранные"
          onPress={handleExportSelected}
          color="#2ECC71"
          disabled={isLoading || selectedIndices.length === 0}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Отмена"
          onPress={() => navigation.goBack()}
          color="#E74C3C"
          disabled={isLoading}
        />
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498DB" />
            <Text style={styles.loadingText}>Экспорт данных...</Text>
          </View>
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
  selectAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  buttonGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  statsContainer: {
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  statsText: {
    fontSize: 14,
    color: '#333333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777777',
  },
  buttonContainer: {
    marginVertical: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default ExportSelectScreen;
