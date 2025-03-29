import { WineRecord } from '../constants/WineRecord';
import { RECORDS_FILENAME } from '../constants/Constants';
import * as FileSystem from 'expo-file-system';
import PhotoService from './PhotoService';

class WineRecordService {
  private records: WineRecord[] = [];
  private initialized: boolean = false;

  constructor() {
    this.loadRecordsFromStorage();
  }

  /**
   * Загружает записи из хранилища при инициализации
   */
  private async loadRecordsFromStorage() {
    try {
      const filePath = FileSystem.documentDirectory + RECORDS_FILENAME;
      const fileInfo = await FileSystem.getInfoAsync(filePath);

      if (fileInfo.exists) {
        const jsonData = await FileSystem.readAsStringAsync(filePath);
        this.importRecords(jsonData);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Ошибка загрузки записей из хранилища:', error);
      this.initialized = true;
    }
  }

  /**
   * Сохраняет все записи в файл
   */
  private async saveRecordsToStorage() {
    try {
      const filePath = FileSystem.documentDirectory + RECORDS_FILENAME;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(this.records, null, 2), {
        encoding: FileSystem.EncodingType.UTF8
      });
    } catch (error) {
      console.error('Ошибка сохранения записей в хранилище:', error);
    }
  }

  /**
   * Дождаться инициализации сервиса
   */
  async waitForInitialization(): Promise<void> {
    // Если сервис уже инициализирован, просто возвращаем Promise
    if (this.initialized) {
      return Promise.resolve();
    }

    // Иначе ждем инициализации через небольшие интервалы
    return new Promise((resolve) => {
      const checkInitialized = () => {
        if (this.initialized) {
          resolve();
        } else {
          setTimeout(checkInitialized, 100);
        }
      };
      checkInitialized();
    });
  }

  /**
   * Добавить запись
   */
  async addRecord(record: WineRecord) {
    await this.waitForInitialization();
    this.records.push(record);
    this.saveRecordsToStorage();
  }

  /**
   * Получить все записи
   */
  getRecords(): WineRecord[] {
    return this.records;
  }

  /**
   * Обновить запись по индексу
   */
  async updateRecord(index: number, updatedRecord: WineRecord) {
    await this.waitForInitialization();
    if (index >= 0 && index < this.records.length) {
      this.records[index] = updatedRecord;
      this.saveRecordsToStorage();
    }
  }

  /**
   * Удалить запись по индексу
   */
  async deleteRecord(index: number) {
    await this.waitForInitialization();
    if (index >= 0 && index < this.records.length) {
      // Получаем запись перед удалением
      const recordToDelete = this.records[index];

      // Удаляем связанные фотографии
      if (recordToDelete.bottlePhoto) {
        await PhotoService.deletePhoto(recordToDelete.bottlePhoto);
      }
      if (recordToDelete.labelPhoto) {
        await PhotoService.deletePhoto(recordToDelete.labelPhoto);
      }
      if (recordToDelete.backLabelPhoto) {
        await PhotoService.deletePhoto(recordToDelete.backLabelPhoto);
      }
      if (recordToDelete.plaquePhoto) {
        await PhotoService.deletePhoto(recordToDelete.plaquePhoto);
      }

      // Удаляем запись из массива
      this.records.splice(index, 1);
      this.saveRecordsToStorage();
    }
  }

  /**
   * Удалить все записи
   */
  async deleteAllRecords() {
    await this.waitForInitialization();

    // Удаляем все фотографии
    for (const record of this.records) {
      if (record.bottlePhoto) {
        await PhotoService.deletePhoto(record.bottlePhoto);
      }
      if (record.labelPhoto) {
        await PhotoService.deletePhoto(record.labelPhoto);
      }
      if (record.backLabelPhoto) {
        await PhotoService.deletePhoto(record.backLabelPhoto);
      }
      if (record.plaquePhoto) {
        await PhotoService.deletePhoto(record.plaquePhoto);
      }
    }

    // Очищаем массив записей
    this.records = [];
    this.saveRecordsToStorage();
  }

  /**
   * Экспорт записей в JSON
   */
  exportRecords(): string {
    return JSON.stringify(this.records, null, 2);
  }

  /**
   * Импорт записей из JSON
   */
  importRecords(jsonData: string) {
    try {
      const importedRecords = JSON.parse(jsonData);
      if (Array.isArray(importedRecords)) {
        this.records = importedRecords;
        this.saveRecordsToStorage();
      }
    } catch (error) {
      console.error('Ошибка импорта записей', error);
    }
  }

  /**
   * Поиск записей по фильтру
   */
  searchRecords(filter: Partial<WineRecord>): WineRecord[] {
    return this.records.filter(record => {
      for (const key in filter) {
        if (filter[key as keyof WineRecord]) {
          const filterValue = String(filter[key as keyof WineRecord]).toLowerCase();
          const recordValue = String(record[key as keyof WineRecord]).toLowerCase();
          if (!recordValue.includes(filterValue)) {
            return false;
          }
        }
      }
      return true;
    });
  }
}

export default new WineRecordService();