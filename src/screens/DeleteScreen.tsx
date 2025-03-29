import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Button } from 'react-native';
import * as FileSystem from 'expo-file-system';
import WineRecordService from '../services/WineRecordService';
import { WineRecord } from '../constants/WineRecord';
import Logo from '../components/Logo';
import PhotoService from '../services/PhotoService';
import { RECORDS_FILENAME } from '../constants/Constants';

const DeleteScreen = () => {
  // Состояния для списка записей и выбранных индексов
  const [records, setRecords] = useState<WineRecord[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Загружаем записи из сервиса при инициализации экрана
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const allRecords = WineRecordService.getRecords();
    setRecords(allRecords);
    setSelectedIndices([]);
  };

  // Функция для переключения выбора записи
  const toggleSelectRecord = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  // Функция для выбора всех записей
  const selectAllRecords = () => {
    if (records.length === 0) {
      Alert.alert('Информация', 'Нет записей для выбора');
      return;
    }
    const allIndices = records.map((_, index) => index);
    setSelectedIndices(allIndices);
  };

  // Функция для снятия выбора со всех записей
  const unselectAllRecords = () => {
    setSelectedIndices([]);
  };

  // Функция для удаления фотографий
  const deletePhotos = async (record: WineRecord) => {
    try {
      // Массив URI фотографий для удаления
      const photoURIs = [
        record.bottlePhoto,
        record.labelPhoto,
        record.backLabelPhoto,
        record.plaquePhoto,
      ].filter(uri => uri && uri.length > 0);

      console.log(`Удаление ${photoURIs.length} фотографий для записи: ${record.wineName}`);

      for (const uri of photoURIs) {
        if (uri) {
          await PhotoService.deletePhoto(uri);
          console.log(`Успешно удалено фото: ${uri}`);
        }
      }
    } catch (error) {
      console.error('Ошибка при удалении фотографий:', error);
    }
  };

  // Функция для удаления выбранных записей
  const handleDeleteSelected = () => {
    if (selectedIndices.length === 0) {
      Alert.alert('Информация', 'Выберите записи для удаления');
      return;
    }
    Alert.alert(
      'Подтверждение удаления',
      `Вы уверены, что хотите удалить ${selectedIndices.length} записей?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentRecords = WineRecordService.getRecords();

              // Сначала удаляем фотографии выбранных записей
              for (const index of selectedIndices) {
                const record = currentRecords[index];
                if (record) {
                  await deletePhotos(record);
                }
              }

              // Удаляем записи
              const newRecords = currentRecords.filter((_, index) => !selectedIndices.includes(index));
              WineRecordService.importRecords(JSON.stringify(newRecords));

              // Сохраняем обновленные записи в файл
              const filePath = FileSystem.documentDirectory + RECORDS_FILENAME;
              try {
                await FileSystem.writeAsStringAsync(filePath, JSON.stringify(newRecords, null, 2));
                console.log('Файл с записями успешно обновлен после удаления');
              } catch (error) {
                console.error('Ошибка при сохранении файла после удаления:', error);
                Alert.alert('Внимание', 'Записи удалены из памяти, но не удалось обновить файл.');
              }

              // Обновляем список записей
              setRecords(newRecords);
              setSelectedIndices([]);
              Alert.alert('Удаление', `Выбранные записи (${selectedIndices.length}) успешно удалены`);
            } catch (error) {
              console.error('Ошибка при удалении выбранных записей:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при удалении записей');
            }
          },
        },
      ]
    );
  };

  // Функция для удаления всех записей
  const handleDeleteAll = () => {
    if (records.length === 0) {
      Alert.alert('Информация', 'Нет записей для удаления');
      return;
    }

    Alert.alert(
      'Подтверждение удаления',
      `Вы уверены, что хотите удалить ВСЕ записи (${records.length})? Это действие нельзя отменить!`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить все',
          style: 'destructive',
          onPress: async () => {
            try {
              // Удаляем все фотографии перед удалением записей
              const allRecords = WineRecordService.getRecords();
              for (const record of allRecords) {
                await deletePhotos(record);
              }

              // Удаляем все записи
              WineRecordService.deleteAllRecords();

              // Сохраняем пустой массив записей в файл
              const filePath = FileSystem.documentDirectory + RECORDS_FILENAME;
              try {
                await FileSystem.writeAsStringAsync(filePath, JSON.stringify([]));
                console.log('Файл с записями успешно очищен');
              } catch (error) {
                console.error('Ошибка при сохранении файла после удаления всех записей:', error);
                Alert.alert('Внимание', 'Записи удалены из памяти, но не удалось обновить файл.');
              }

              setRecords([]);
              setSelectedIndices([]);
              Alert.alert('Удаление', 'Все записи успешно удалены');
            } catch (error) {
              console.error('Ошибка при удалении всех записей:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при удалении всех записей');
            }
          },
        },
      ]
    );
  };

  // Отрисовка одного элемента списка с возможностью выбора
  const renderItem = ({ item, index }: { item: WineRecord; index: number }) => {
    const isSelected = selectedIndices.includes(index);
    return (
      <TouchableOpacity style={[styles.itemContainer, isSelected && styles.selectedItem]} onPress={() => toggleSelectRecord(index)}>
        <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
          {isSelected ? <Text style={styles.checkboxText}>✓</Text> : null}
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.wineNameText}>{item.wineName}</Text>
          <Text style={styles.wineryNameText}>{item.wineryName}</Text>
          <Text style={styles.itemInfoText}>
            {[
              item.harvestYear && `Год: ${item.harvestYear}`,
              item.wineType,
              item.color,
            ].filter(Boolean).join(' • ')}
          </Text>
          <Text style={styles.itemInfoText}>
            {[
              item.region,
              item.country,
            ].filter(Boolean).join(', ')}
          </Text>
          {/* Показываем, сколько фотографий есть у записи */}
          {(item.bottlePhoto || item.labelPhoto || item.backLabelPhoto || item.plaquePhoto) && (
            <Text style={styles.photoInfoText}>
             Фото: {[
                item.bottlePhoto && 'бутылка',
                item.labelPhoto && 'этикетка',
                item.backLabelPhoto && 'контрэтикетка',
                item.plaquePhoto && 'плакетка',
              ].filter(Boolean).join(', ')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Logo />
      <Text style={styles.header}>Удаление записей</Text>

      <View style={styles.actionsContainer}>
        <View style={styles.selectionButtonsContainer}>
          <TouchableOpacity
            style={[styles.selectionButton, styles.selectAllButton]}
            onPress={selectAllRecords}
          >
            <Text style={styles.selectionButtonText}>Выбрать все</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectionButton, styles.unselectAllButton]}
            onPress={unselectAllRecords}
            disabled={selectedIndices.length === 0}
          >
            <Text style={styles.selectionButtonText}>Снять выбор</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.selectionText}>
          Выбрано: {selectedIndices.length} из {records.length} записей
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title={`Удалить выбранные записи (${selectedIndices.length})`}
            onPress={handleDeleteSelected}
            color="#E74C3C"
            disabled={selectedIndices.length === 0}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Удалить все записи"
            onPress={handleDeleteAll}
            color="#E74C3C"
            disabled={records.length === 0}
          />
        </View>
      </View>

      <Text style={styles.sectionHeader}>Список записей:</Text>

      <FlatList
        style={styles.list}
        data={records}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>Нет записей</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 8,
  },
  actionsContainer: {
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  selectionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  selectionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectAllButton: {
    backgroundColor: '#3498DB',
  },
  unselectAllButton: {
    backgroundColor: '#95A5A6',
  },
  selectionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectionText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  buttonContainer: {
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  selectedItem: {
    backgroundColor: '#F0F9FF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#000000',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  checkboxChecked: {
    backgroundColor: '#2ECC71',
    borderColor: '#27AE60',
  },
  checkboxText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
  },
  wineNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  wineryNameText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  itemInfoText: {
    fontSize: 14,
    marginBottom: 2,
    color: '#555555',
  },
  photoInfoText: {
    fontSize: 12,
    color: '#3498DB',
    marginTop: 2,
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#999999',
    fontStyle: 'italic',
  },
});

export default DeleteScreen;
 