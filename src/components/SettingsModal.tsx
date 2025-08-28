import { useState } from 'react';

import { useProgress } from '../contexts/ProgressContext';
import { useAudio } from '../hooks/useAudioContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { AppSettings, Difficulty, IrishDialect } from '../types';
import {
  exportUserData,
  importUserData,
  clearAllData,
} from '../utils/localStorage';

import { Modal, Button, Card, CardHeader, CardTitle, CardContent } from './ui';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { volume, setVolume, isMuted, toggleMute } = useAudio();
  const { resetProgress } = useProgress();
  const { settings, updateData } = useLocalStorage();
  const [activeTab, setActiveTab] = useState<
    'audio' | 'game' | 'accessibility' | 'data'
  >('audio');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const updateSettings = (updates: Partial<AppSettings>) => {
    updateData({
      settings: {
        ...settings,
        ...updates,
      },
    });
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    updateSettings({ masterVolume: newVolume });
  };

  const handleExportData = () => {
    try {
      const data = exportUserData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `irish-game-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          const data = e.target?.result as string;
          if (importUserData(data)) {
            alert('Data imported successfully! The page will reload.');
            window.location.reload();
          } else {
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleResetData = () => {
    if (showResetConfirm) {
      clearAllData();
      resetProgress();
      alert('All data has been reset! The page will reload.');
      window.location.reload();
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000); // Reset confirmation after 5 seconds
    }
  };

  const tabs = [
    { id: 'audio' as const, label: 'Audio', icon: '🔊' },
    { id: 'game' as const, label: 'Game', icon: '🎮' },
    { id: 'accessibility' as const, label: 'Accessibility', icon: '♿' },
    { id: 'data' as const, label: 'Data', icon: '💾' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Settings'>
      <div className='space-y-6'>
        {/* Tab Navigation */}
        <div className='flex flex-wrap gap-2'>
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setActiveTab(tab.id)}
              className='flex items-center gap-2'
            >
              <span>{tab.icon}</span>
              <span className='hidden sm:inline'>{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Audio Settings */}
        {activeTab === 'audio' && (
          <Card>
            <CardHeader>
              <CardTitle>Audio Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Master Volume */}
              <div>
                <label
                  htmlFor='master-volume'
                  className='block text-sm font-medium text-dark-gray mb-2'
                >
                  Master Volume: {Math.round(volume * 100)}%
                </label>
                <input
                  id='master-volume'
                  type='range'
                  min='0'
                  max='1'
                  step='0.1'
                  value={volume}
                  onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                  className='w-full accent-irish-green'
                />
              </div>

              {/* Mute Toggle */}
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-dark-gray'>
                  Mute All Sounds
                </span>
                <Button
                  variant={isMuted ? 'danger' : 'ghost'}
                  size='sm'
                  onClick={toggleMute}
                >
                  {isMuted ? '🔇 Muted' : '🔊 On'}
                </Button>
              </div>

              {/* Individual Volume Controls */}
              <div>
                <label
                  htmlFor='speech-volume'
                  className='block text-sm font-medium text-dark-gray mb-2'
                >
                  Speech Volume: {Math.round(settings.speechVolume * 100)}%
                </label>
                <input
                  id='speech-volume'
                  type='range'
                  min='0'
                  max='1'
                  step='0.1'
                  value={settings.speechVolume}
                  onChange={e =>
                    updateSettings({ speechVolume: parseFloat(e.target.value) })
                  }
                  className='w-full accent-irish-green'
                />
              </div>

              <div>
                <label
                  htmlFor='music-volume'
                  className='block text-sm font-medium text-dark-gray mb-2'
                >
                  Music Volume: {Math.round(settings.musicVolume * 100)}%
                </label>
                <input
                  id='music-volume'
                  type='range'
                  min='0'
                  max='1'
                  step='0.1'
                  value={settings.musicVolume}
                  onChange={e =>
                    updateSettings({ musicVolume: parseFloat(e.target.value) })
                  }
                  className='w-full accent-irish-green'
                />
              </div>

              {/* Audio Preferences */}
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-dark-gray'>
                  Celebration Sounds
                </span>
                <Button
                  variant={settings.celebrationSounds ? 'success' : 'ghost'}
                  size='sm'
                  onClick={() =>
                    updateSettings({
                      celebrationSounds: !settings.celebrationSounds,
                    })
                  }
                >
                  {settings.celebrationSounds ? '🎉 On' : '🔕 Off'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Settings */}
        {activeTab === 'game' && (
          <Card>
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Difficulty */}
              <div>
                <div className='block text-sm font-medium text-dark-gray mb-2'>
                  Default Difficulty
                </div>
                <div className='flex gap-2'>
                  {[1, 2, 3, 4, 5].map(level => (
                    <Button
                      key={level}
                      variant={
                        settings.difficulty === level ? 'default' : 'ghost'
                      }
                      size='sm'
                      onClick={() =>
                        updateSettings({ difficulty: level as Difficulty })
                      }
                    >
                      {'⭐'.repeat(level)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Irish Dialect */}
              <div>
                <div className='block text-sm font-medium text-dark-gray mb-2'>
                  Irish Dialect
                </div>
                <div className='flex gap-2'>
                  {[
                    { id: 'ulster', name: 'Ulster' },
                    { id: 'connacht', name: 'Connacht' },
                    { id: 'munster', name: 'Munster' },
                  ].map(dialect => (
                    <Button
                      key={dialect.id}
                      variant={
                        settings.dialect === dialect.id ? 'default' : 'ghost'
                      }
                      size='sm'
                      onClick={() =>
                        updateSettings({ dialect: dialect.id as IrishDialect })
                      }
                    >
                      {dialect.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Game Preferences */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-dark-gray'>
                    Auto-repeat Audio
                  </span>
                  <Button
                    variant={settings.autoRepeat ? 'success' : 'ghost'}
                    size='sm'
                    onClick={() =>
                      updateSettings({ autoRepeat: !settings.autoRepeat })
                    }
                  >
                    {settings.autoRepeat ? '🔄 On' : '⏹️ Off'}
                  </Button>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-dark-gray'>
                    Show Hints
                  </span>
                  <Button
                    variant={settings.showHints ? 'success' : 'ghost'}
                    size='sm'
                    onClick={() =>
                      updateSettings({ showHints: !settings.showHints })
                    }
                  >
                    {settings.showHints ? '💡 On' : '🚫 Off'}
                  </Button>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-dark-gray'>
                    Allow Skipping
                  </span>
                  <Button
                    variant={settings.allowSkipping ? 'success' : 'ghost'}
                    size='sm'
                    onClick={() =>
                      updateSettings({ allowSkipping: !settings.allowSkipping })
                    }
                  >
                    {settings.allowSkipping ? '⏭️ On' : '🔒 Off'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accessibility Settings */}
        {activeTab === 'accessibility' && (
          <Card>
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-dark-gray'>
                  High Contrast Mode
                </span>
                <Button
                  variant={settings.highContrast ? 'success' : 'ghost'}
                  size='sm'
                  onClick={() =>
                    updateSettings({ highContrast: !settings.highContrast })
                  }
                >
                  {settings.highContrast ? '🔆 On' : '🌙 Off'}
                </Button>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-dark-gray'>
                  Large Text
                </span>
                <Button
                  variant={settings.largeText ? 'success' : 'ghost'}
                  size='sm'
                  onClick={() =>
                    updateSettings({ largeText: !settings.largeText })
                  }
                >
                  {settings.largeText ? '🔍 On' : '📝 Off'}
                </Button>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-dark-gray'>
                  Reduced Motion
                </span>
                <Button
                  variant={settings.reducedMotion ? 'success' : 'ghost'}
                  size='sm'
                  onClick={() =>
                    updateSettings({ reducedMotion: !settings.reducedMotion })
                  }
                >
                  {settings.reducedMotion ? '🐌 On' : '🚀 Off'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Management */}
        {activeTab === 'data' && (
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <Button
                  variant='outline'
                  onClick={handleExportData}
                  className='w-full'
                >
                  📤 Export Progress Data
                </Button>

                <Button
                  variant='outline'
                  onClick={handleImportData}
                  className='w-full'
                >
                  📥 Import Progress Data
                </Button>

                <Button
                  variant={showResetConfirm ? 'danger' : 'outline'}
                  onClick={handleResetData}
                  className='w-full'
                >
                  {showResetConfirm
                    ? '⚠️ Click Again to Confirm Reset'
                    : '🗑️ Reset All Data'}
                </Button>
              </div>

              <div className='text-xs text-dark-gray/70'>
                <p className='mb-2'>
                  <strong>Export:</strong> Save your progress to a file for
                  backup
                </p>
                <p className='mb-2'>
                  <strong>Import:</strong> Restore progress from a backup file
                </p>
                <p>
                  <strong>Reset:</strong> Permanently delete all progress and
                  settings
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Actions */}
        <div className='flex justify-end gap-2 pt-4 border-t border-soft-gray'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
