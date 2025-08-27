/**
 * Audio Manifest Types
 * Defines the structure for the audio file manifest system
 */

export interface AudioFileFormat {
  wav?: string;
  mp3?: string;
  ogg?: string;
}

export interface AudioManifestFile {
  id: string;
  irish?: string;
  english?: string;
  phonetic?: string;
  description?: string;
  files: AudioFileFormat;
  duration: number;
  dialect?: 'ulster' | 'connacht' | 'munster';
  volume?: number;
  tags?: string[];
}

export interface AudioCategory {
  description: string;
  files: AudioManifestFile[];
}

export interface AudioManifestValidation {
  totalFiles: number;
  categories: number;
  checksum: string;
  integrityCheck: boolean;
}

export interface AudioManifest {
  version: string;
  lastUpdated: string;
  description: string;
  supportedFormats: string[];
  defaultFormat: string;
  fallbackFormat: string;
  categories: {
    [categoryName: string]: AudioCategory;
  };
  validation: AudioManifestValidation;
}

export type AudioCategory_ =
  | 'colors'
  | 'animals'
  | 'numbers'
  | 'letters'
  | 'ui';

export interface AudioLoadResult {
  success: boolean;
  audioElement?: HTMLAudioElement;
  error?: string;
  fileUsed?: string;
}

export interface AudioPreloadResult {
  loaded: number;
  total: number;
  failed: string[];
  successful: string[];
}
