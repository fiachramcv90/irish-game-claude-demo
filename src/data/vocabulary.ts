// Irish Vocabulary Data - Ulster Irish Focus
import type { VocabularyItem, VocabularySet, Category } from '../types';

// Ulster Irish vocabulary items for young learners
export const vocabularyItems: VocabularyItem[] = [
  // Colors (Dathanna)
  {
    id: 'color_red_001',
    category: 'colors',
    irish: 'dearg',
    english: 'red',
    phonetic: 'JARR-ag',
    difficulty: 1,
    audioFile: 'dearg',
    imageFile: 'images/colors/red.jpg',
    tags: ['basic', 'primary-color'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'color_blue_002',
    category: 'colors',
    irish: 'gorm',
    english: 'blue',
    phonetic: 'GOR-um',
    difficulty: 1,
    audioFile: 'gorm',
    imageFile: 'images/colors/blue.jpg',
    tags: ['basic', 'primary-color'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'color_yellow_003',
    category: 'colors',
    irish: 'buí',
    english: 'yellow',
    phonetic: 'BOO-ee',
    difficulty: 1,
    audioFile: 'bui',
    imageFile: 'images/colors/yellow.jpg',
    tags: ['basic', 'primary-color'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'color_green_004',
    category: 'colors',
    irish: 'glas',
    english: 'green',
    phonetic: 'GLASS',
    difficulty: 1,
    audioFile: 'glas',
    imageFile: 'images/colors/green.jpg',
    tags: ['basic', 'nature'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'color_white_005',
    category: 'colors',
    irish: 'bán',
    english: 'white',
    phonetic: 'BAWN',
    difficulty: 2,
    audioFile: 'ban',
    imageFile: 'images/colors/white.jpg',
    tags: ['basic'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'color_black_006',
    category: 'colors',
    irish: 'dubh',
    english: 'black',
    phonetic: 'DOO',
    difficulty: 2,
    audioFile: 'dubh',
    imageFile: 'images/colors/black.jpg',
    tags: ['basic'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'color_orange_007',
    category: 'colors',
    irish: 'oráiste',
    english: 'orange',
    phonetic: 'or-AWSH-te',
    difficulty: 3,
    audioFile: 'oraiste',
    imageFile: 'images/colors/orange.jpg',
    tags: ['basic', 'fruit-color'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'color_purple_008',
    category: 'colors',
    irish: 'corcra',
    english: 'purple',
    phonetic: 'KOR-kra',
    difficulty: 3,
    audioFile: 'corcra',
    imageFile: 'images/colors/purple.jpg',
    tags: ['intermediate'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // Animals (Ainmhithe)
  {
    id: 'animal_cat_009',
    category: 'animals',
    irish: 'cat',
    english: 'cat',
    phonetic: 'CAT',
    difficulty: 1,
    audioFile: 'cat',
    imageFile: 'images/animals/cat.jpg',
    tags: ['pet', 'basic'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'animal_dog_010',
    category: 'animals',
    irish: 'madra',
    english: 'dog',
    phonetic: 'MAD-ra',
    difficulty: 1,
    audioFile: 'madra',
    imageFile: 'images/animals/dog.jpg',
    tags: ['pet', 'basic'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'animal_cow_011',
    category: 'animals',
    irish: 'bó',
    english: 'cow',
    phonetic: 'BOH',
    difficulty: 1,
    audioFile: 'bo',
    imageFile: 'images/animals/cow.jpg',
    tags: ['farm', 'basic'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'animal_horse_012',
    category: 'animals',
    irish: 'each',
    english: 'horse',
    phonetic: 'AKH',
    difficulty: 2,
    audioFile: 'each',
    imageFile: 'images/animals/horse.jpg',
    tags: ['farm', 'transport'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'animal_sheep_013',
    category: 'animals',
    irish: 'caora',
    english: 'sheep',
    phonetic: 'KEE-ra',
    difficulty: 2,
    audioFile: 'caora',
    imageFile: 'images/animals/sheep.jpg',
    tags: ['farm', 'wool'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'animal_bird_014',
    category: 'animals',
    irish: 'éan',
    english: 'bird',
    phonetic: 'AY-an',
    difficulty: 2,
    audioFile: 'ean',
    imageFile: 'images/animals/bird.jpg',
    tags: ['wild', 'flying'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'animal_fish_015',
    category: 'animals',
    irish: 'iasc',
    english: 'fish',
    phonetic: 'EE-ask',
    difficulty: 2,
    audioFile: 'iasc',
    imageFile: 'images/animals/fish.jpg',
    tags: ['water', 'food'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'animal_rabbit_016',
    category: 'animals',
    irish: 'coinín',
    english: 'rabbit',
    phonetic: 'kun-EEN',
    difficulty: 3,
    audioFile: 'coinin',
    imageFile: 'images/animals/rabbit.jpg',
    tags: ['wild', 'pet'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // Numbers (Uimhreacha) - Basic 1-10
  {
    id: 'number_one_017',
    category: 'numbers',
    irish: 'a haon',
    english: 'one',
    phonetic: 'a-HAYN',
    difficulty: 1,
    audioFile: 'haon',
    imageFile: 'images/numbers/one.jpg',
    tags: ['counting', 'basic'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'number_two_018',
    category: 'numbers',
    irish: 'a dó',
    english: 'two',
    phonetic: 'a-DOH',
    difficulty: 1,
    audioFile: 'do',
    imageFile: 'images/numbers/two.jpg',
    tags: ['counting', 'basic'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'number_three_019',
    category: 'numbers',
    irish: 'a trí',
    english: 'three',
    phonetic: 'a-TREE',
    difficulty: 1,
    audioFile: 'tri',
    imageFile: 'images/numbers/three.jpg',
    tags: ['counting', 'basic'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'number_four_020',
    category: 'numbers',
    irish: 'a ceathair',
    english: 'four',
    phonetic: 'a-KAH-her',
    difficulty: 2,
    audioFile: 'ceathair',
    imageFile: 'images/numbers/four.jpg',
    tags: ['counting'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'number_five_021',
    category: 'numbers',
    irish: 'a cúig',
    english: 'five',
    phonetic: 'a-COO-ig',
    difficulty: 2,
    audioFile: 'cuig',
    imageFile: 'images/numbers/five.jpg',
    tags: ['counting'],
    dialect: 'ulster',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Vocabulary sets organized by learning progression
export const vocabularySets: VocabularySet[] = [
  {
    id: 'colors_basic',
    name: 'Basic Colors',
    description: 'Learn the most common colors in Irish',
    category: 'colors',
    difficulty: 1,
    recommendedAge: [4, 7],
    items: vocabularyItems.filter(
      item => item.category === 'colors' && item.difficulty <= 2
    ),
  },
  {
    id: 'colors_advanced',
    name: 'More Colors',
    description: 'Additional colors to expand vocabulary',
    category: 'colors',
    difficulty: 3,
    recommendedAge: [5, 8],
    prerequisites: ['colors_basic'],
    unlockRequirement: {
      type: 'items_learned',
      value: 6, // Must learn 6 basic colors first
    },
    items: vocabularyItems.filter(
      item => item.category === 'colors' && item.difficulty >= 3
    ),
  },
  {
    id: 'animals_pets',
    name: 'Pet Animals',
    description: 'Common pets and domestic animals',
    category: 'animals',
    difficulty: 1,
    recommendedAge: [4, 7],
    items: vocabularyItems.filter(
      item => item.category === 'animals' && item.tags.includes('pet')
    ),
  },
  {
    id: 'animals_farm',
    name: 'Farm Animals',
    description: 'Animals you might find on a farm',
    category: 'animals',
    difficulty: 2,
    recommendedAge: [5, 8],
    prerequisites: ['animals_pets'],
    items: vocabularyItems.filter(
      item => item.category === 'animals' && item.tags.includes('farm')
    ),
  },
  {
    id: 'animals_wild',
    name: 'Wild Animals',
    description: 'Animals in nature',
    category: 'animals',
    difficulty: 3,
    recommendedAge: [6, 9],
    prerequisites: ['animals_farm'],
    unlockRequirement: {
      type: 'items_learned',
      value: 8, // Must learn 8 animals first
    },
    items: vocabularyItems.filter(
      item => item.category === 'animals' && item.tags.includes('wild')
    ),
  },
  {
    id: 'numbers_basic',
    name: 'Numbers 1-5',
    description: 'Learn to count from one to five in Irish',
    category: 'numbers',
    difficulty: 1,
    recommendedAge: [4, 7],
    items: vocabularyItems.filter(
      item => item.category === 'numbers' && item.difficulty <= 2
    ),
  },
];

// Helper functions for vocabulary management
export const getVocabularyByCategory = (
  category: Category
): VocabularyItem[] => {
  return vocabularyItems.filter(item => item.category === category);
};

export const getVocabularyByDifficulty = (
  difficulty: number
): VocabularyItem[] => {
  return vocabularyItems.filter(item => item.difficulty <= difficulty);
};

export const getVocabularySet = (setId: string): VocabularySet | undefined => {
  return vocabularySets.find(set => set.id === setId);
};

export const getUnlockedSets = (learnedItems: string[]): VocabularySet[] => {
  return vocabularySets.filter(set => {
    if (!set.prerequisites) return true;

    if (set.unlockRequirement) {
      const { type, value } = set.unlockRequirement;

      if (type === 'items_learned') {
        const categoryItems = learnedItems.filter(itemId => {
          const item = vocabularyItems.find(v => v.id === itemId);
          return item && item.category === set.category;
        });
        return categoryItems.length >= value;
      }
    }

    // Check if all prerequisite sets have been started
    return set.prerequisites.every(preReqId => {
      const preReqSet = vocabularySets.find(s => s.id === preReqId);
      if (!preReqSet) return false;

      // Check if user has learned at least one item from prerequisite set
      return preReqSet.items.some(item => learnedItems.includes(item.id));
    });
  });
};

// Sample achievements based on vocabulary progress
export const vocabularyAchievements = [
  {
    id: 'first_color',
    title: 'Color Explorer',
    description: 'Learn your first color in Irish',
    icon: '🎨',
    type: 'mastery' as const,
    requirement: {
      type: 'category_items_learned',
      value: 1,
      category: 'colors' as Category,
    },
  },
  {
    id: 'rainbow_master',
    title: 'Rainbow Master',
    description: 'Learn 6 different colors',
    icon: '🌈',
    type: 'mastery' as const,
    requirement: {
      type: 'category_items_learned',
      value: 6,
      category: 'colors' as Category,
    },
  },
  {
    id: 'animal_friend',
    title: 'Animal Friend',
    description: 'Learn 5 animal names',
    icon: '🐾',
    type: 'mastery' as const,
    requirement: {
      type: 'category_items_learned',
      value: 5,
      category: 'animals' as Category,
    },
  },
  {
    id: 'counting_star',
    title: 'Counting Star',
    description: 'Learn numbers 1 through 5',
    icon: '⭐',
    type: 'mastery' as const,
    requirement: {
      type: 'category_items_learned',
      value: 5,
      category: 'numbers' as Category,
    },
  },
  {
    id: 'vocabulary_builder',
    title: 'Vocabulary Builder',
    description: 'Learn 25 Irish words',
    icon: '📚',
    type: 'mastery' as const,
    requirement: {
      type: 'total_items_learned',
      value: 25,
    },
  },
];
