import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Button, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import WineRecordService from '../services/WineRecordService';
import { WineRecord } from '../constants/WineRecord';
import Logo from '../components/Logo';

type RecordDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecordDetail'>;
type RecordDetailScreenRouteProp = RouteProp<RootStackParamList, 'RecordDetail'>;

// Вынесли компонент "кнопка назад" за пределы компонента RecordDetailScreen
const BackButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.backButtonContainer}>
    <Text style={styles.backButton}>←</Text>
  </TouchableOpacity>
);

const RecordDetailScreen = () => {
  const navigation = useNavigation<RecordDetailScreenNavigationProp>();
  const route = useRoute<RecordDetailScreenRouteProp>();
  
  const recordId = parseInt(route.params.recordId, 10);
  const [record, setRecord] = useState<WineRecord | null>(null);
  const [currentIndex, setCurrentIndex] = useState(recordId);

  // Выносим логику кнопки назад в useCallback
  const navigateToSearch = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  // При нажатии кнопки назад переходим на экран поиска
  useEffect(() => {
    // Устанавливаем обработчик события нажатия кнопки назад
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Предотвращаем стандартное действие и перенаправляем на экран Search
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault();
        navigateToSearch();
      }
    });

    return unsubscribe;
  }, [navigation, navigateToSearch]);

  // Устанавливаем заголовок с кнопкой назад
  useEffect(() => {
    // Используем компонент BackButton с заранее определенной функцией
    navigation.setOptions({
      headerLeft: () => <BackButton onPress={navigateToSearch} />,
    });
  }, [navigation, navigateToSearch]);

  useEffect(() => {
    const records = WineRecordService.getRecords();
    if (records[currentIndex]) {
      setRecord(records[currentIndex]);
    } else {
      Alert.alert('Ошибка', 'Запись не найдена');
    }
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      Alert.alert('Информация', 'Это первая запись');
    }
  };

  const handleNext = () => {
    const records = WineRecordService.getRecords();
    if (currentIndex < records.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert('Информация', 'Это последняя запись');
    }
  };

  if (!record) {
    return (
      <View style={styles.container}>
        <Text>Запись не найдена</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Logo />
      <Text style={styles.header}>Детали записи</Text>

      <Text style={styles.label}>Название винодельни: {record.wineryName}</Text>
      <Text style={styles.label}>Название вина: {record.wineName}</Text>
      <Text style={styles.label}>Год урожая: {record.harvestYear}</Text>
      <Text style={styles.label}>Год розлива: {record.bottlingYear}</Text>
      <Text style={styles.label}>Сорта винограда:</Text>
      {record.grapeVarieties.map((gv, index) => (
        <Text key={index} style={styles.subLabel}>
          {gv.variety}: {gv.percentage}%
        </Text>
      ))}
      <Text style={styles.label}>Винодел: {record.winemaker}</Text>
      <Text style={styles.label}>Собственник: {record.owner}</Text>
      <Text style={styles.label}>Страна: {record.country}</Text>
      <Text style={styles.label}>Регион: {record.region}</Text>
      <Text style={styles.label}>Содержание сахара: {record.sugarContent}%</Text>
      <Text style={styles.label}>Содержание спирта: {record.alcoholContent}%</Text>
      <Text style={styles.label}>Вид вина: {record.wineType}</Text>
      <Text style={styles.label}>Тип вина: {record.wineStyle}</Text>
      <Text style={styles.label}>Цвет вина: {record.color}</Text>
      <Text style={styles.label}>Цена: {record.price}</Text>

      <Text style={styles.sectionHeader}>Дегустация</Text>
      <Text style={styles.label}>Цвет (заметки): {record.appearanceNotes}</Text>
      <Text style={styles.label}>Плотность: {record.density}</Text>
      <Text style={styles.label}>Первый нос: {record.initialNose}</Text>
      <Text style={styles.label}>Аромат после аэрации: {record.aromaAfterAeration}</Text>
      <Text style={styles.label}>Вкус: {record.taste}</Text>
      <Text style={styles.label}>Танины: {record.tannins}</Text>
      <Text style={styles.label}>Кислотность: {record.acidity}</Text>
      <Text style={styles.label}>Сладость: {record.sweetness}</Text>
      <Text style={styles.label}>Баланс: {record.balance}</Text>
      <Text style={styles.label}>Ассоциации: {record.associations}</Text>
      <Text style={styles.label}>Дата потребления: {record.consumptionDate}</Text>

      <Text style={styles.sectionHeader}>Личный вердикт</Text>
      <Text style={styles.label}>Вердикт: {record.personalVerdict}</Text>
      <Text style={styles.label}>Прочее: {record.additionalNotes}</Text>

      <Text style={styles.sectionHeader}>Фотографии</Text>
      <Text style={styles.label}>Бутылка:</Text>
      {record.bottlePhoto ? (
        <Image source={{ uri: record.bottlePhoto }} style={styles.image} />
      ) : (
        <Text style={styles.label}>Нет фото</Text>
      )}
      <Text style={styles.label}>Этикетка:</Text>
      {record.labelPhoto ? (
        <Image source={{ uri: record.labelPhoto }} style={styles.image} />
      ) : (
        <Text style={styles.label}>Нет фото</Text>
      )}
      <Text style={styles.label}>Контрэтикетка:</Text>
      {record.backLabelPhoto ? (
        <Image source={{ uri: record.backLabelPhoto }} style={styles.image} />
      ) : (
        <Text style={styles.label}>Нет фото</Text>
      )}
      {record.plaquePhoto ? (
        <>
          <Text style={styles.label}>Плакетка:</Text>
          <Image source={{ uri: record.plaquePhoto }} style={styles.image} />
        </>
      ) : null}

      <View style={styles.buttonContainer}>
        <Button title="Редактировать" onPress={() => navigation.navigate('Edit', { recordId: currentIndex.toString() })} />
      </View>
      <View style={styles.navButtons}>
        <Button title="Предыдущая" onPress={handlePrevious} />
        <Button title="Следующая" onPress={handleNext} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  subLabel: {
    fontSize: 14,
    marginLeft: 16,
    marginBottom: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 8,
  },
  buttonContainer: {
    marginVertical: 12,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  backButton: {
    fontSize: 16,
    color: '#3498DB',
    marginLeft: 10,
  },
  backButtonContainer: {
    padding: 5,
  },
});

export default RecordDetailScreen;
