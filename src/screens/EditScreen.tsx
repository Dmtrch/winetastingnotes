import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import WineRecordService from '../services/WineRecordService';
import { WineRecord } from '../constants/WineRecord';
import Logo from '../components/Logo';
import PhotoService from '../services/PhotoService';
import { RECORDS_FILENAME } from '../constants/Constants';
import * as FileSystem from 'expo-file-system';

type EditScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Edit'>;
type EditScreenRouteProp = RouteProp<RootStackParamList, 'Edit'>;

const EditScreen = () => {
  const navigation = useNavigation<EditScreenNavigationProp>();
  const route = useRoute<EditScreenRouteProp>();
  
  const recordId = parseInt(route.params.recordId, 10);

  const [wineryName, setWineryName] = useState('');
  const [wineName, setWineName] = useState('');
  const [harvestYear, setHarvestYear] = useState('');
  const [bottlingYear, setBottlingYear] = useState('');
  const [grapeVarietiesInput, setGrapeVarietiesInput] = useState('');
  const [winemaker, setWinemaker] = useState('');
  const [owner, setOwner] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [sugarContent, setSugarContent] = useState('');
  const [alcoholContent, setAlcoholContent] = useState('');
  const [wineType, setWineType] = useState('');
  const [wineStyle, setWineStyle] = useState('');
  const [color, setColor] = useState('');
  const [price, setPrice] = useState('');
  const [appearanceNotes, setAppearanceNotes] = useState('');
  const [density, setDensity] = useState('');
  const [initialNose, setInitialNose] = useState('');
  const [aromaAfterAeration, setAromaAfterAeration] = useState('');
  const [taste, setTaste] = useState('');
  const [tannins, setTannins] = useState('');
  const [acidity, setAcidity] = useState('');
  const [sweetness, setSweetness] = useState('');
  const [balance, setBalance] = useState('');
  const [associations, setAssociations] = useState('');
  const [consumptionDate, setConsumptionDate] = useState('');
  const [personalVerdict, setPersonalVerdict] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [bottlePhoto, setBottlePhoto] = useState('');
  const [labelPhoto, setLabelPhoto] = useState('');
  const [backLabelPhoto, setBackLabelPhoto] = useState('');
  const [plaquePhoto, setPlaquePhoto] = useState('');

  // Сохраняем старые пути к изображениям, чтобы удалить неиспользуемые фото при сохранении
  const [oldBottlePhoto, setOldBottlePhoto] = useState('');
  const [oldLabelPhoto, setOldLabelPhoto] = useState('');
  const [oldBackLabelPhoto, setOldBackLabelPhoto] = useState('');
  const [oldPlaquePhoto, setOldPlaquePhoto] = useState('');

  useEffect(() => {
    const records = WineRecordService.getRecords();
    const currentRecord = records[recordId];
    if (currentRecord) {
      setWineryName(currentRecord.wineryName);
      setWineName(currentRecord.wineName);
      setHarvestYear(currentRecord.harvestYear);
      setBottlingYear(currentRecord.bottlingYear);
      const gvString = currentRecord.grapeVarieties.map(gv => `${gv.variety}:${gv.percentage}`).join(', ');
      setGrapeVarietiesInput(gvString);
      setWinemaker(currentRecord.winemaker);
      setOwner(currentRecord.owner);
      setCountry(currentRecord.country);
      setRegion(currentRecord.region);
      setSugarContent(currentRecord.sugarContent.toString());
      setAlcoholContent(currentRecord.alcoholContent.toString());
      setWineType(currentRecord.wineType);
      setWineStyle(currentRecord.wineStyle);
      setColor(currentRecord.color);
      setPrice(currentRecord.price.toString());
      setAppearanceNotes(currentRecord.appearanceNotes);
      setDensity(currentRecord.density);
      setInitialNose(currentRecord.initialNose);
      setAromaAfterAeration(currentRecord.aromaAfterAeration);
      setTaste(currentRecord.taste);
      setTannins(currentRecord.tannins);
      setAcidity(currentRecord.acidity);
      setSweetness(currentRecord.sweetness);
      setBalance(currentRecord.balance);
      setAssociations(currentRecord.associations);
      setConsumptionDate(currentRecord.consumptionDate);
      setPersonalVerdict(currentRecord.personalVerdict);
      setAdditionalNotes(currentRecord.additionalNotes);

      // Сохраняем текущие пути к фото, чтобы можно было удалить неиспользуемые фото при сохранении
      setOldBottlePhoto(currentRecord.bottlePhoto);
      setOldLabelPhoto(currentRecord.labelPhoto);
      setOldBackLabelPhoto(currentRecord.backLabelPhoto);
      setOldPlaquePhoto(currentRecord.plaquePhoto || '');

      // Устанавливаем текущие значения для отображения
      setBottlePhoto(currentRecord.bottlePhoto);
      setLabelPhoto(currentRecord.labelPhoto);
      setBackLabelPhoto(currentRecord.backLabelPhoto);
      setPlaquePhoto(currentRecord.plaquePhoto || '');
    } else {
      Alert.alert('Ошибка', 'Запись не найдена');
    }
  }, [recordId]);

  // Функция запуска камеры для конкретного поля фотографии
  const handleTakePhoto = async (photoType: 'bottlePhoto' | 'labelPhoto' | 'backLabelPhoto' | 'plaquePhoto') => {
    const uri = await PhotoService.takePhoto();

    if (uri) {
      // Удаляем старое фото, если оно существует
      if (photoType === 'bottlePhoto' && bottlePhoto) {
        await PhotoService.deletePhoto(bottlePhoto);
        setBottlePhoto(uri);
      } else if (photoType === 'labelPhoto' && labelPhoto) {
        await PhotoService.deletePhoto(labelPhoto);
        setLabelPhoto(uri);
      } else if (photoType === 'backLabelPhoto' && backLabelPhoto) {
        await PhotoService.deletePhoto(backLabelPhoto);
        setBackLabelPhoto(uri);
      } else if (photoType === 'plaquePhoto' && plaquePhoto) {
        await PhotoService.deletePhoto(plaquePhoto);
        setPlaquePhoto(uri);
      } else {
        // Если старого фото не было, просто устанавливаем новое
        if (photoType === 'bottlePhoto') {
          setBottlePhoto(uri);
        } else if (photoType === 'labelPhoto') {
          setLabelPhoto(uri);
        } else if (photoType === 'backLabelPhoto') {
          setBackLabelPhoto(uri);
        } else if (photoType === 'plaquePhoto') {
          setPlaquePhoto(uri);
        }
      }
    }
  };

  const handleSave = async () => {
    try {
      // Проверяем, какие фотографии были заменены и удаляем старые
      if (oldBottlePhoto && oldBottlePhoto !== bottlePhoto) {
        await PhotoService.deletePhoto(oldBottlePhoto);
      }

      if (oldLabelPhoto && oldLabelPhoto !== labelPhoto) {
        await PhotoService.deletePhoto(oldLabelPhoto);
      }

      if (oldBackLabelPhoto && oldBackLabelPhoto !== backLabelPhoto) {
        await PhotoService.deletePhoto(oldBackLabelPhoto);
      }

      if (oldPlaquePhoto && oldPlaquePhoto !== plaquePhoto) {
        await PhotoService.deletePhoto(oldPlaquePhoto);
      }

      const grapeVarieties = grapeVarietiesInput.split(',').map(item => {
        const [variety, percentage] = item.split(':').map(s => s.trim());
        return { variety, percentage: Number(percentage) || 0 };
      }).filter(item => item.variety);

      const updatedRecord: WineRecord = {
        wineryName,
        wineName,
        harvestYear,
        bottlingYear,
        grapeVarieties,
        winemaker,
        owner,
        country,
        region,
        sugarContent: Number(sugarContent) || 0,
        alcoholContent: Number(alcoholContent) || 0,
        wineType: wineType as WineRecord['wineType'],
        wineStyle: wineStyle as WineRecord['wineStyle'],
        color: color as WineRecord['color'],
        price: Number(price) || 0,
        appearanceNotes,
        density,
        initialNose,
        aromaAfterAeration,
        taste,
        tannins,
        acidity,
        sweetness,
        balance,
        associations,
        consumptionDate,
        personalVerdict,
        additionalNotes,
        bottlePhoto,
        labelPhoto,
        backLabelPhoto,
        plaquePhoto: plaquePhoto || '',
      };

      WineRecordService.updateRecord(recordId, updatedRecord);

      // Сохраняем обновленные записи в файл
      const filePath = FileSystem.documentDirectory + RECORDS_FILENAME;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(WineRecordService.getRecords(), null, 2));

      Alert.alert('Успех', 'Запись обновлена');
      navigation.navigate('RecordDetail', { recordId: recordId.toString() });
    } catch (error) {
      console.error('Ошибка при сохранении записи:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить запись');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Logo />
      <Text style={styles.header}>Редактирование записи</Text>
      <Text>Название винодельни:</Text>
      <TextInput style={styles.input} value={wineryName} onChangeText={setWineryName} placeholder="Введите название винодельни" />
      <Text>Название вина:</Text>
      <TextInput style={styles.input} value={wineName} onChangeText={setWineName} placeholder="Введите название вина" />
      <Text>Год урожая:</Text>
      <TextInput style={styles.input} value={harvestYear} onChangeText={setHarvestYear} placeholder="Введите год урожая" keyboardType="numeric" />
      <Text>Год розлива:</Text>
      <TextInput style={styles.input} value={bottlingYear} onChangeText={setBottlingYear} placeholder="Введите год розлива" keyboardType="numeric" />
      <Text>Сорта винограда и % содержания (формат: сорт:процент, сорт:процент):</Text>
      <TextInput style={styles.input} value={grapeVarietiesInput} onChangeText={setGrapeVarietiesInput} placeholder="например: Каберне:60, Мерло:40" />
      <Text>Винодел:</Text>
      <TextInput style={styles.input} value={winemaker} onChangeText={setWinemaker} placeholder="Введите имя винодела" />
      <Text>Собственник:</Text>
      <TextInput style={styles.input} value={owner} onChangeText={setOwner} placeholder="Введите имя собственника" />
      <Text>Страна:</Text>
      <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Введите страну" />
      <Text>Регион:</Text>
      <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="Введите регион" />
      <Text>Содержание сахара (%):</Text>
      <TextInput style={styles.input} value={sugarContent} onChangeText={setSugarContent} placeholder="Введите содержание сахара" keyboardType="numeric" />
      <Text>Содержание спирта (%):</Text>
      <TextInput style={styles.input} value={alcoholContent} onChangeText={setAlcoholContent} placeholder="Введите содержание спирта" keyboardType="numeric" />
      <Text>Вид вина (сухое, полусухое, полусладкое, сладкое, десертное):</Text>
      <TextInput style={styles.input} value={wineType} onChangeText={setWineType} placeholder="Введите вид вина" />
      <Text>Тип вина (тихое, игристое):</Text>
      <TextInput style={styles.input} value={wineStyle} onChangeText={setWineStyle} placeholder="Введите тип вина" />
      <Text>Цвет вина (красное, белое, розовое, оранж, глу-глу, другое):</Text>
      <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="Введите цвет вина" />
      <Text>Цена:</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Введите цену" keyboardType="numeric" />

      <Text style={styles.sectionHeader}>Дегустация</Text>
      <Text>Цвет (заметки):</Text>
      <TextInput style={styles.input} value={appearanceNotes} onChangeText={setAppearanceNotes} placeholder="Введите заметки о цвете" />
      <Text>Плотность:</Text>
      <TextInput style={styles.input} value={density} onChangeText={setDensity} placeholder="Введите плотность" />
      <Text>Первый нос (без аэрации):</Text>
      <TextInput style={styles.input} value={initialNose} onChangeText={setInitialNose} placeholder="Введите описание первого носа" />
      <Text>Аромат после аэрации:</Text>
      <TextInput style={styles.input} value={aromaAfterAeration} onChangeText={setAromaAfterAeration} placeholder="Введите аромат после аэрации" />
      <Text>Вкус (спиртуозность):</Text>
      <TextInput style={styles.input} value={taste} onChangeText={setTaste} placeholder="Введите описание вкуса" />
      <Text>Танины:</Text>
      <TextInput style={styles.input} value={tannins} onChangeText={setTannins} placeholder="Введите описание танинов" />
      <Text>Кислотность:</Text>
      <TextInput style={styles.input} value={acidity} onChangeText={setAcidity} placeholder="Введите кислотность" />
      <Text>Сладость:</Text>
      <TextInput style={styles.input} value={sweetness} onChangeText={setSweetness} placeholder="Введите сладость" />
      <Text>Баланс:</Text>
      <TextInput style={styles.input} value={balance} onChangeText={setBalance} placeholder="Введите баланс" />
      <Text>Ассоциации:</Text>
      <TextInput style={styles.input} value={associations} onChangeText={setAssociations} placeholder="Введите ассоциации" />
      <Text>Дата потребления:</Text>
      <TextInput style={styles.input} value={consumptionDate} onChangeText={setConsumptionDate} placeholder="Введите дату потребления" />

      <Text style={styles.sectionHeader}>Личный вердикт</Text>
      <Text>Моё/не моё, брать/не брать:</Text>
      <TextInput style={styles.input} value={personalVerdict} onChangeText={setPersonalVerdict} placeholder="Введите вердикт" />
      <Text>Прочее:</Text>
      <TextInput style={styles.input} value={additionalNotes} onChangeText={setAdditionalNotes} placeholder="Введите дополнительные заметки" />

      <Text style={styles.sectionHeader}>Фотографии</Text>
      <Text>Фотография бутылки:</Text>
      <View style={styles.photoContainer}>
        {bottlePhoto ? (
          <View style={styles.photoWrapper}>
            <Image source={{ uri: bottlePhoto }} style={styles.photoThumbnail} />
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={() => handleTakePhoto('bottlePhoto')}
            >
              <Text style={styles.changePhotoButtonText}>Изменить</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            title="Сделать фото бутылки"
            onPress={() => handleTakePhoto('bottlePhoto')}
          />
        )}
      </View>
      <Text>Фотография этикетки:</Text>
      <View style={styles.photoContainer}>
        {labelPhoto ? (
          <View style={styles.photoWrapper}>
            <Image source={{ uri: labelPhoto }} style={styles.photoThumbnail} />
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={() => handleTakePhoto('labelPhoto')}
            >
              <Text style={styles.changePhotoButtonText}>Изменить</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            title="Сделать фото этикетки"
            onPress={() => handleTakePhoto('labelPhoto')}
          />
        )}
      </View>

      <Text>Фотография контрэтикетки:</Text>
      <View style={styles.photoContainer}>
        {backLabelPhoto ? (
          <View style={styles.photoWrapper}>
            <Image source={{ uri: backLabelPhoto }} style={styles.photoThumbnail} />
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={() => handleTakePhoto('backLabelPhoto')}
            >
              <Text style={styles.changePhotoButtonText}>Изменить</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            title="Сделать фото контрэтикетки"
            onPress={() => handleTakePhoto('backLabelPhoto')}
          />
        )}
      </View>

      <Text>Фотография плакетки (для игристого вина):</Text>
      <View style={styles.photoContainer}>
        {plaquePhoto ? (
          <View style={styles.photoWrapper}>
            <Image source={{ uri: plaquePhoto }} style={styles.photoThumbnail} />
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={() => handleTakePhoto('plaquePhoto')}
            >
              <Text style={styles.changePhotoButtonText}>Изменить</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            title="Сделать фото плакетки"
            onPress={() => handleTakePhoto('plaquePhoto')}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Сохранить изменения" onPress={handleSave} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  photoContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  photoWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  photoThumbnail: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  changePhotoButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 5,
  },
  changePhotoButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default EditScreen;
