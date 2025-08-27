# Audio File Guidelines

## Overview

This document outlines the naming conventions, organization standards, and technical requirements for audio files in the Irish Game Claude Demo application.

## Directory Structure

```
public/audio/
├── colors/          # Color vocabulary pronunciations
├── animals/         # Animal vocabulary pronunciations
├── numbers/         # Number vocabulary pronunciations
├── letters/         # Letter pronunciation guide
└── ui/             # User interface sound effects
```

## File Naming Conventions

### Vocabulary Audio Files

#### Colors (`public/audio/colors/`)

- File format: `{irish_word}.{ext}`
- Example: `dearg.wav` (Irish for "red")
- Avoid diacritical marks in filenames (use `bui.wav` instead of `buí.wav`)

#### Animals (`public/audio/animals/`)

- File format: `{irish_word}.{ext}`
- Example: `madra.wav` (Irish for "dog")
- Use simplified spellings without special characters

#### Numbers (`public/audio/numbers/`)

- File format: `{number_irish}.{ext}`
- Example: `haon.wav` (Irish for "one")
- Use the Irish word, not the English equivalent

#### Letters (`public/audio/letters/`)

- File format: `letter_{letter}.{ext}`
- Example: `letter_a.wav`, `letter_b.wav`
- Use lowercase letters only

### UI Sound Effects (`public/audio/ui/`)

| Sound Type     | Filename             | Purpose                   |
| -------------- | -------------------- | ------------------------- |
| Success        | `success.wav`        | Correct answer feedback   |
| Error          | `error.wav`          | Incorrect answer feedback |
| Click          | `click.wav`          | Button/UI interaction     |
| Achievement    | `achievement.wav`    | Achievement unlock        |
| Game Start     | `game_start.wav`     | Game session begins       |
| Game End       | `game_end.wav`       | Game session complete     |
| Correct Answer | `correct_answer.wav` | Positive reinforcement    |
| Wrong Answer   | `wrong_answer.wav`   | Gentle correction         |

## Technical Specifications

### Audio Formats

- **Primary**: WAV (uncompressed, high quality)
- **Fallback**: MP3 (compressed, broad compatibility)
- **Future**: OGG Vorbis (open source, good compression)

### Audio Quality Standards

- **Sample Rate**: 22,050 Hz minimum (44,100 Hz preferred)
- **Bit Depth**: 16-bit minimum
- **Channels**: Mono preferred for vocabulary, stereo for UI sounds
- **Duration**: 0.3-2.0 seconds for vocabulary, 0.2-1.5 seconds for UI

### Volume Guidelines

- **Vocabulary**: Consistent levels across all words
- **UI Success**: 60% of max volume (0.6)
- **UI Error**: 40% of max volume (0.4)
- **UI Click**: 30% of max volume (0.3)
- **Achievements**: 70% of max volume (0.7)

## Ulster Irish Pronunciation Standards

### Dialect Consistency

- All vocabulary audio must use **Ulster Irish** pronunciation
- Phonetic transcriptions follow Ulster Irish patterns
- Maintain consistency across all vocabulary items

### Recording Guidelines

- Native or near-native Ulster Irish speakers preferred
- Clear, child-friendly pronunciation
- Moderate speaking pace (not too fast/slow)
- Minimal background noise
- Consistent recording environment

## File Management

### Audio Manifest System

- All audio files must be registered in `src/data/audio-manifest.json`
- Manifest includes metadata: duration, phonetics, volume, dialect
- Automated validation ensures file integrity

### Version Control

- Audio files are tracked in Git (placeholder files only)
- Production audio files should be stored externally
- Use placeholder files for development and testing

### Browser Compatibility

- Test across Chrome, Firefox, Safari, Edge
- Provide fallback formats for older browsers
- Handle loading failures gracefully

## Development Workflow

### Adding New Audio Files

1. **Create Audio File**

   ```bash
   # Place in appropriate directory
   public/audio/colors/new_color.wav
   ```

2. **Update Manifest**

   ```json
   {
     "id": "new_color",
     "irish": "irish_word",
     "english": "english_translation",
     "phonetic": "PHONETIC-GUIDE",
     "files": {
       "wav": "audio/colors/new_color.wav",
       "mp3": "audio/colors/new_color.mp3"
     },
     "duration": 0.5,
     "dialect": "ulster"
   }
   ```

3. **Update Vocabulary Data**

   ```typescript
   {
     audioFile: 'new_color', // Use manifest ID, not file path
     // ... other properties
   }
   ```

4. **Test Loading**

   ```typescript
   await audioManifestManager.loadAudioFile('new_color');
   ```

### Testing Audio Files

#### Automated Tests

- Playwright tests verify all manifest files load
- Cross-browser compatibility testing
- Error handling for missing files

#### Manual Testing

- Listen to pronunciation accuracy
- Check volume consistency
- Verify audio quality on different devices

## Quality Assurance

### Pre-Production Checklist

- [ ] All files follow naming conventions
- [ ] Manifest is updated and valid
- [ ] Audio quality meets standards
- [ ] Ulster Irish pronunciation verified
- [ ] Cross-browser compatibility tested
- [ ] Volume levels consistent
- [ ] No audio clipping or distortion
- [ ] Loading performance acceptable

### Production Deployment

- Replace placeholder files with production audio
- Update manifest checksums
- Verify CDN/hosting configuration
- Monitor loading performance
- Set up error tracking for failed loads

## Accessibility

### Audio Accessibility

- Provide visual feedback for audio playback
- Support for users with hearing impairments
- Clear phonetic transcriptions available
- Volume controls accessible via keyboard
- Screen reader compatibility

### Performance

- Lazy loading for non-critical audio
- Preloading for immediate gameplay needs
- Efficient caching strategies
- Graceful degradation for slow connections

## Future Enhancements

### Planned Features

- Multiple speaker voices for variety
- Pronunciation difficulty levels
- Regional dialect options
- Audio speed controls
- Interactive pronunciation practice

### Technical Improvements

- WebAudio API integration
- Advanced audio processing
- Real-time pronunciation feedback
- Audio compression optimization
- Offline audio caching

## Support and Maintenance

### Audio File Issues

- Check browser console for loading errors
- Verify file paths in manifest
- Test audio codec support
- Check network connectivity

### Performance Monitoring

- Track audio loading times
- Monitor cache hit rates
- Measure user interaction patterns
- Analyze cross-browser performance

---

**Last Updated**: 2024-01-01  
**Version**: 1.0.0  
**Maintainer**: Irish Game Development Team
