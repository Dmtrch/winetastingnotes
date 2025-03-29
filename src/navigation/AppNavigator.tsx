import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainMenu from '../screens/MainMenu';
import NotesScreen from '../screens/NotesScreen';
import SearchScreen from '../screens/SearchScreen';
import RecordDetailScreen from '../screens/RecordDetailScreen';
import EditScreen from '../screens/EditScreen';
import ExportImportScreen from '../screens/ExportImportScreen';
import ExportSelectScreen from '../screens/ExportSelectScreen';
import DeleteScreen from '../screens/DeleteScreen';

export type RootStackParamList = {
  MainMenu: undefined;
  Notes: undefined;
  Search: undefined;
  RecordDetail: { recordId: string };
  Edit: { recordId: string };
  ExportImport: undefined;
  ExportSelect: undefined;
  Delete: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainMenu">
        <Stack.Screen
          name="MainMenu"
          component={MainMenu}
          options={{ title: 'Главное меню' }}
        />
        <Stack.Screen
          name="Notes"
          component={NotesScreen}
          options={{ title: 'Дегустационные заметки' }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: 'Поиск' }}
        />
        <Stack.Screen
          name="RecordDetail"
          component={RecordDetailScreen}
          options={{ title: 'Детали записи' }}
        />
        <Stack.Screen
          name="Edit"
          component={EditScreen}
          options={{ title: 'Редактирование записи' }}
        />
        <Stack.Screen
          name="ExportImport"
          component={ExportImportScreen}
          options={{ title: 'Экспорт / Импорт' }}
        />
        <Stack.Screen
          name="ExportSelect"
          component={ExportSelectScreen}
          options={{ title: 'Выбор записей для экспорта' }}
        />
        <Stack.Screen
          name="Delete"
          component={DeleteScreen}
          options={{ title: 'Удаление записей' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
