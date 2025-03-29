import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WineRecord } from '../constants/WineRecord';

interface ExportSelectItemProps {
  item: WineRecord;
  index: number;
  isSelected: boolean;
  onToggle: (index: number) => void;
}

const ExportSelectItem: React.FC<ExportSelectItemProps> = ({
  item,
  index,
  isSelected,
  onToggle,
}) => {
  // Проверка наличия фотографий
  const hasPhotos = !!item.bottlePhoto || !!item.labelPhoto || !!item.backLabelPhoto || !!item.plaquePhoto;

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onToggle(index)}
    >
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.wineName}>{item.wineName}</Text>
        <Text style={styles.wineryName}>{item.wineryName}</Text>
        <Text style={styles.itemDetails}>
          {[
            item.harvestYear,
            item.wineType,
            item.color,
            item.region ? `${item.region}${item.country ? `, ${item.country}` : ''}` : item.country,
          ].filter(Boolean).join(' · ')}
        </Text>
        {hasPhotos && (
          <Text style={styles.hasImage}>📷 Есть фото</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#000000',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  checkboxSelected: {
    backgroundColor: '#E1F5FE',
    borderColor: '#3498DB',
  },
  checkmark: {
    fontSize: 16,
    color: '#3498DB',
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  wineName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  wineryName: {
    fontSize: 14,
    color: '#555555',
    marginTop: 2,
  },
  itemDetails: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },
  hasImage: {
    fontSize: 12,
    color: '#2980B9',
    marginTop: 4,
  },
});

export default ExportSelectItem;
