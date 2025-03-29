import React from 'react';
import { ScrollView, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type MainMenuNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainMenu'>;

const MainMenu = () => {
  const navigation = useNavigation<MainMenuNavigationProp>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Шапка с заголовком */}
      <Text style={styles.header}>Дегустационные заметки</Text>

      {/* Логотип в центре */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Блок кнопок */}
      <TouchableOpacity
        style={[styles.menuButton, styles.menuButtonBlue]}
        onPress={() => navigation.navigate('Search')}
      >
        <Text style={styles.buttonText}>Поиск вина</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuButton, styles.menuButtonGreen]}
        onPress={() => navigation.navigate('Notes')}
      >
        <Text style={styles.buttonText}>Дегустация</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuButton, styles.menuButtonOrange]}
        onPress={() => navigation.navigate('ExportImport')}
      >
        <Text style={styles.buttonText}>Экспорт и импорт данных</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuButton, styles.menuButtonRed]}
        onPress={() => navigation.navigate('Delete')}
      >
        <Text style={styles.buttonText}>Удаление</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 40,
  },
  menuButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  menuButtonBlue: {
    backgroundColor: '#3498DB',
  },
  menuButtonGreen: {
    backgroundColor: '#2ECC71',
  },
  menuButtonOrange: {
    backgroundColor: '#F39C12',
  },
  menuButtonRed: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MainMenu;
