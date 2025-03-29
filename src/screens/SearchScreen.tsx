import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import WineRecordService from '../services/WineRecordService';
import { WineRecord } from '../constants/WineRecord';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

const SORT_OPTIONS: { label: string; value: keyof WineRecord }[] = [
  { label: 'Винодельня', value: 'wineryName' },
  { label: 'Вино', value: 'wineName' },
  { label: 'Год урожая', value: 'harvestYear' },
];

// Компонент "кнопка назад"
const BackButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.backButtonContainer}>
    <Text style={styles.backButton}>←</Text>
  </TouchableOpacity>
);

// Компонент элемента результата поиска
const ResultItem = ({
  item,
  index,
  onPress,
}: {
  item: WineRecord;
  index: number;
  onPress: (index: number) => void;
}) => (
  <TouchableOpacity
    style={styles.resultItem}
    onPress={() => onPress(index)}
  >
    <Text style={styles.resultText}>
      {item.wineryName} — {item.wineName} — {item.harvestYear}
    </Text>
  </TouchableOpacity>
);

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [records, setRecords] = useState<WineRecord[]>([]);

  // 28 полей фильтра
  const [wineryNameFilter, setWineryNameFilter] = useState('');
  const [wineNameFilter, setWineNameFilter] = useState('');
  const [harvestYearFilter, setHarvestYearFilter] = useState('');
  const [bottlingYearFilter, setBottlingYearFilter] = useState('');
  const [grapeVarietiesFilter, setGrapeVarietiesFilter] = useState('');
  const [winemakerFilter, setWinemakerFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sugarContentFilter, setSugarContentFilter] = useState('');
  const [alcoholContentFilter, setAlcoholContentFilter] = useState('');
  const [wineTypeFilter, setWineTypeFilter] = useState('');
  const [wineStyleFilter, setWineStyleFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [appearanceNotesFilter, setAppearanceNotesFilter] = useState('');
  const [densityFilter, setDensityFilter] = useState('');
  const [initialNoseFilter, setInitialNoseFilter] = useState('');
  const [aromaAfterAerationFilter, setAromaAfterAerationFilter] = useState('');
  const [tasteFilter, setTasteFilter] = useState('');
  const [tanninsFilter, setTanninsFilter] = useState('');
  const [acidityFilter, setAcidityFilter] = useState('');
  const [sweetnessFilter, setSweetnessFilter] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('');
  const [associationsFilter, setAssociationsFilter] = useState('');
  const [consumptionDateFilter, setConsumptionDateFilter] = useState('');
  const [personalVerdictFilter, setPersonalVerdictFilter] = useState('');
  const [additionalNotesFilter, setAdditionalNotesFilter] = useState('');

  // Состояние для выбранного критерия сортировки
  // По умолчанию сортируем по названию вина
  const [selectedSort, setSelectedSort] = useState<keyof WineRecord>('wineName');

  // Управляет показом выпадающего меню
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Выносим навигацию на главное меню в useCallback
  const navigateToMainMenu = useCallback(() => {
    navigation.navigate('MainMenu');
  }, [navigation]);

  // При нажатии кнопки назад переходим на главное меню
  useEffect(() => {
    // Устанавливаем обработчик события нажатия кнопки назад
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Предотвращаем стандартное действие и перенаправляем на экран MainMenu
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault();
        navigateToMainMenu();
      }
    });

    return unsubscribe;
  }, [navigation, navigateToMainMenu]);

  // Устанавливаем заголовок с кнопкой назад
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <BackButton onPress={navigateToMainMenu} />,
    });
  }, [navigation, navigateToMainMenu]);

  useEffect(() => {
    setRecords(WineRecordService.getRecords());
  }, []);

  const handleSearch = () => {
    const allRecords = WineRecordService.getRecords();
    const filtered = allRecords.filter((record) => {
      const grapeVarietiesStr = record.grapeVarieties.map((gv) => gv.variety).join(' ');
      return (
        record.wineryName.toLowerCase().includes(wineryNameFilter.toLowerCase()) &&
        record.wineName.toLowerCase().includes(wineNameFilter.toLowerCase()) &&
        record.harvestYear.toLowerCase().includes(harvestYearFilter.toLowerCase()) &&
        record.bottlingYear.toLowerCase().includes(bottlingYearFilter.toLowerCase()) &&
        grapeVarietiesStr.toLowerCase().includes(grapeVarietiesFilter.toLowerCase()) &&
        record.winemaker.toLowerCase().includes(winemakerFilter.toLowerCase()) &&
        record.owner.toLowerCase().includes(ownerFilter.toLowerCase()) &&
        record.country.toLowerCase().includes(countryFilter.toLowerCase()) &&
        record.region.toLowerCase().includes(regionFilter.toLowerCase()) &&
        record.sugarContent.toString().toLowerCase().includes(sugarContentFilter.toLowerCase()) &&
        record.alcoholContent.toString().toLowerCase().includes(alcoholContentFilter.toLowerCase()) &&
        record.wineType.toLowerCase().includes(wineTypeFilter.toLowerCase()) &&
        record.wineStyle.toLowerCase().includes(wineStyleFilter.toLowerCase()) &&
        record.color.toLowerCase().includes(colorFilter.toLowerCase()) &&
        record.price.toString().toLowerCase().includes(priceFilter.toLowerCase()) &&
        record.appearanceNotes.toLowerCase().includes(appearanceNotesFilter.toLowerCase()) &&
        record.density.toLowerCase().includes(densityFilter.toLowerCase()) &&
        record.initialNose.toLowerCase().includes(initialNoseFilter.toLowerCase()) &&
        record.aromaAfterAeration.toLowerCase().includes(aromaAfterAerationFilter.toLowerCase()) &&
        record.taste.toLowerCase().includes(tasteFilter.toLowerCase()) &&
        record.tannins.toLowerCase().includes(tanninsFilter.toLowerCase()) &&
        record.acidity.toLowerCase().includes(acidityFilter.toLowerCase()) &&
        record.sweetness.toLowerCase().includes(sweetnessFilter.toLowerCase()) &&
        record.balance.toLowerCase().includes(balanceFilter.toLowerCase()) &&
        record.associations.toLowerCase().includes(associationsFilter.toLowerCase()) &&
        record.consumptionDate.toLowerCase().includes(consumptionDateFilter.toLowerCase()) &&
        record.personalVerdict.toLowerCase().includes(personalVerdictFilter.toLowerCase()) &&
        record.additionalNotes.toLowerCase().includes(additionalNotesFilter.toLowerCase())
      );
    });
    setRecords(filtered);
  };

  const handleSort = (criterion: keyof WineRecord) => {
    const sorted = [...records].sort((a, b) => {
      const valueA = (a[criterion] as unknown as string).toLowerCase();
      const valueB = (b[criterion] as unknown as string).toLowerCase();
      if (valueA < valueB) {
        return -1;
      }
      if (valueA > valueB) {
        return 1;
      }
      return 0;
    });
    setRecords(sorted);
  };

  const navigateToDetail = (index: number) => {
    navigation.navigate('RecordDetail', { recordId: index.toString() });
  };

  // Получаем человекочитаемое название для выбранного поля
  const getSortLabel = (field: keyof WineRecord): string => {
    const option = SORT_OPTIONS.find((opt) => opt.value === field);
    return option ? option.label : 'Неизвестно';
  };

  return (
    <View style={styles.container}>
      {/* Верхняя часть (прокрутка полей) */}
      <View style={styles.topContainer}>
        <ScrollView style={styles.searchScroll} showsVerticalScrollIndicator={true}>
          <Text style={styles.title}>Поиск вина</Text>

          {/* Поля для всех 28 фильтров */}
          <Text style={styles.label}>Название винодельни:</Text>
          <TextInput
            style={styles.input}
            value={wineryNameFilter}
            onChangeText={setWineryNameFilter}
            placeholder="Фильтр по винодельне"
          />

          <Text style={styles.label}>Название вина:</Text>
          <TextInput
            style={styles.input}
            value={wineNameFilter}
            onChangeText={setWineNameFilter}
            placeholder="Фильтр по вину"
          />

          <Text style={styles.label}>Год урожая:</Text>
          <TextInput
            style={styles.input}
            value={harvestYearFilter}
            onChangeText={setHarvestYearFilter}
            placeholder="Фильтр по году урожая"
          />

          <Text style={styles.label}>Год розлива:</Text>
          <TextInput
            style={styles.input}
            value={bottlingYearFilter}
            onChangeText={setBottlingYearFilter}
            placeholder="Фильтр по году розлива"
          />

          <Text style={styles.label}>Сорта винограда:</Text>
          <TextInput
            style={styles.input}
            value={grapeVarietiesFilter}
            onChangeText={setGrapeVarietiesFilter}
            placeholder="Фильтр по сортам винограда"
          />

          <Text style={styles.label}>Винодел:</Text>
          <TextInput
            style={styles.input}
            value={winemakerFilter}
            onChangeText={setWinemakerFilter}
            placeholder="Фильтр по виноделу"
          />

          <Text style={styles.label}>Собственник:</Text>
          <TextInput
            style={styles.input}
            value={ownerFilter}
            onChangeText={setOwnerFilter}
            placeholder="Фильтр по собственнику"
          />

          <Text style={styles.label}>Страна:</Text>
          <TextInput
            style={styles.input}
            value={countryFilter}
            onChangeText={setCountryFilter}
            placeholder="Фильтр по стране"
          />

          <Text style={styles.label}>Регион:</Text>
          <TextInput
            style={styles.input}
            value={regionFilter}
            onChangeText={setRegionFilter}
            placeholder="Фильтр по региону"
          />

          <Text style={styles.label}>Содержание сахара (%):</Text>
          <TextInput
            style={styles.input}
            value={sugarContentFilter}
            onChangeText={setSugarContentFilter}
            placeholder="Фильтр по содержанию сахара"
          />

          <Text style={styles.label}>Содержание спирта (%):</Text>
          <TextInput
            style={styles.input}
            value={alcoholContentFilter}
            onChangeText={setAlcoholContentFilter}
            placeholder="Фильтр по содержанию спирта"
          />

          <Text style={styles.label}>Вид вина:</Text>
          <TextInput
            style={styles.input}
            value={wineTypeFilter}
            onChangeText={setWineTypeFilter}
            placeholder="Фильтр по виду вина (сухое, полусухое...)"
          />

          <Text style={styles.label}>Тип вина:</Text>
          <TextInput
            style={styles.input}
            value={wineStyleFilter}
            onChangeText={setWineStyleFilter}
            placeholder="Фильтр по типу вина (тихое, игристое)"
          />

          <Text style={styles.label}>Цвет вина:</Text>
          <TextInput
            style={styles.input}
            value={colorFilter}
            onChangeText={setColorFilter}
            placeholder="Фильтр по цвету вина"
          />

          <Text style={styles.label}>Цена:</Text>
          <TextInput
            style={styles.input}
            value={priceFilter}
            onChangeText={setPriceFilter}
            placeholder="Фильтр по цене"
          />

          <Text style={styles.sectionHeader}>Дегустация</Text>

          <Text style={styles.label}>Цвет (заметки):</Text>
          <TextInput
            style={styles.input}
            value={appearanceNotesFilter}
            onChangeText={setAppearanceNotesFilter}
            placeholder="Фильтр по заметкам о цвете"
          />

          <Text style={styles.label}>Плотность:</Text>
          <TextInput
            style={styles.input}
            value={densityFilter}
            onChangeText={setDensityFilter}
            placeholder="Фильтр по плотности"
          />

          <Text style={styles.label}>Первый нос:</Text>
          <TextInput
            style={styles.input}
            value={initialNoseFilter}
            onChangeText={setInitialNoseFilter}
            placeholder="Фильтр по первому носу"
          />

          <Text style={styles.label}>Аромат после аэрации:</Text>
          <TextInput
            style={styles.input}
            value={aromaAfterAerationFilter}
            onChangeText={setAromaAfterAerationFilter}
            placeholder="Фильтр по аромату после аэрации"
          />

          <Text style={styles.label}>Вкус:</Text>
          <TextInput
            style={styles.input}
            value={tasteFilter}
            onChangeText={setTasteFilter}
            placeholder="Фильтр по вкусу"
          />

          <Text style={styles.label}>Танины:</Text>
          <TextInput
            style={styles.input}
            value={tanninsFilter}
            onChangeText={setTanninsFilter}
            placeholder="Фильтр по танинам"
          />

          <Text style={styles.label}>Кислотность:</Text>
          <TextInput
            style={styles.input}
            value={acidityFilter}
            onChangeText={setAcidityFilter}
            placeholder="Фильтр по кислотности"
          />

          <Text style={styles.label}>Сладость:</Text>
          <TextInput
            style={styles.input}
            value={sweetnessFilter}
            onChangeText={setSweetnessFilter}
            placeholder="Фильтр по сладости"
          />

          <Text style={styles.label}>Баланс:</Text>
          <TextInput
            style={styles.input}
            value={balanceFilter}
            onChangeText={setBalanceFilter}
            placeholder="Фильтр по балансу"
          />

          <Text style={styles.label}>Ассоциации:</Text>
          <TextInput
            style={styles.input}
            value={associationsFilter}
            onChangeText={setAssociationsFilter}
            placeholder="Фильтр по ассоциациям"
          />

          <Text style={styles.label}>Дата потребления:</Text>
          <TextInput
            style={styles.input}
            value={consumptionDateFilter}
            onChangeText={setConsumptionDateFilter}
            placeholder="Фильтр по дате потребления"
          />

          <Text style={styles.sectionHeader}>Личный вердикт</Text>

          <Text style={styles.label}>Вердикт:</Text>
          <TextInput
            style={styles.input}
            value={personalVerdictFilter}
            onChangeText={setPersonalVerdictFilter}
            placeholder="Фильтр по вердикту (моё/не моё)"
          />

          <Text style={styles.label}>Прочее:</Text>
          <TextInput
            style={styles.input}
            value={additionalNotesFilter}
            onChangeText={setAdditionalNotesFilter}
            placeholder="Фильтр по дополнительным заметкам"
          />
        </ScrollView>
      </View>

      {/* Средняя часть (кнопка поиска и "выпадающее" меню сортировки) */}
      <View style={styles.middleContainer}>
        <Button title="Найти" onPress={handleSearch} />

        {/* Кнопка "Сортировка" + выбранный вариант */}
        <View style={styles.sortWrapper}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Text style={styles.sortButtonText}>
              Сортировка: {getSortLabel(selectedSort)}
            </Text>
          </TouchableOpacity>

          {showSortMenu && (
            <View style={styles.sortMenu}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.sortMenuItem}
                  onPress={() => {
                    setSelectedSort(opt.value);
                    handleSort(opt.value);
                    setShowSortMenu(false);
                  }}
                >
                  <Text style={styles.sortMenuItemText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Нижняя часть (прокрутка результатов) */}
      <View style={styles.bottomContainer}>
        <FlatList
          data={records}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <ResultItem item={item} index={index} onPress={navigateToDetail} />
          )}
          ListEmptyComponent={<Text>Нет записей</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButtonContainer: {
    padding: 5,
  },
  backButton: {
    fontSize: 16,
    color: '#3498DB',
    marginLeft: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topContainer: {
    flex: 3,
    borderBottomWidth: 1,
    borderColor: '#DDDDDD',
  },
  searchScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  middleContainer: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#DDDDDD',
    padding: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sortWrapper: {
    marginTop: 10,
    position: 'relative',
  },
  sortButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sortButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sortMenu: {
    position: 'absolute',
    top: 46, // чуть ниже кнопки
    left: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    width: 150,
    zIndex: 999, // чтобы перекрыть другие элементы
    paddingVertical: 4,
  },
  sortMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sortMenuItemText: {
    fontSize: 16,
  },
  bottomContainer: {
    flex: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  label: {
    fontWeight: '400',
    marginBottom: 2,
  },
  input: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  resultItem: {
    paddingVertical: 8,
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: 1,
  },
  resultText: {
    fontSize: 14,
  },
});

export default SearchScreen;
