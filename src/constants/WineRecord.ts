export interface WineRecord {
    wineryName: string;       // Название винодельни
    wineName: string;         // Название вина
    harvestYear: string;      // Год урожая
    bottlingYear: string;     // Год розлива
    grapeVarieties: {         // Сорта винограда и % содержания каждого сорта
      variety: string;
      percentage: number;
    }[];
    winemaker: string;        // Винодел
    owner: string;            // Собственник
    country: string;          // Страна
    region: string;           // Регион
    sugarContent: number;     // Содержание сахара (%)
    alcoholContent: number;   // Содержание спирта (%)
    wineType: 'сухое' | 'полусухое' | 'полусладкое' | 'сладкое' | 'десертное';
    wineStyle: 'тихое' | 'игристое';
    color: 'красное' | 'белое' | 'розовое' | 'оранж' | 'глу-глу' | 'другое';
    price: number;
    // Дегустация
    appearanceNotes: string;
    density: string;
    initialNose: string;
    aromaAfterAeration: string;
    taste: string;
    tannins: string;
    acidity: string;
    sweetness: string;
    balance: string;
    associations: string;
    consumptionDate: string;
    // Личный вердикт
    personalVerdict: string;
    additionalNotes: string;
    // Фотографии
    bottlePhoto: string;
    labelPhoto: string;
    backLabelPhoto: string;
    plaquePhoto?: string;
}
