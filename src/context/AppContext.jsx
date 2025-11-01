import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from 'react';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors } from '../utils/colors';
import { addSongToHistory } from '../database/db';

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback');

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [layout, setLayout] = useState('list');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState({ position: 0, duration: 0 });

  const soundRef = useRef(null);
  const progressInterval = useRef(null);

  const colors = getColors(isDark);

  useEffect(() => {
    loadSettings();

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedLayout = await AsyncStorage.getItem('layout');
      const savedShuffle = await AsyncStorage.getItem('shuffleMode');
      const savedRepeat = await AsyncStorage.getItem('repeatMode');

      if (savedTheme) setIsDark(savedTheme === 'dark');
      if (savedLayout) setLayout(savedLayout);
      if (savedShuffle) setShuffleMode(savedShuffle === 'true');
      if (savedRepeat) setRepeatMode(savedRepeat);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const toggleLayout = async () => {
    const newLayout = layout === 'list' ? 'grid' : 'list';
    setLayout(newLayout);
    await AsyncStorage.setItem('layout', newLayout);
  };

  const toggleShuffle = async () => {
    const newShuffle = !shuffleMode;
    setShuffleMode(newShuffle);
    await AsyncStorage.setItem('shuffleMode', String(newShuffle));
  };

  const cycleRepeatMode = async () => {
    const modes = ['off', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const newMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(newMode);
    await AsyncStorage.setItem('repeatMode', newMode);
  };

  const startProgressTracking = sound => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (sound && sound.isLoaded()) {
        sound.getCurrentTime(seconds => {
          setProgress(prev => ({ ...prev, position: seconds }));
        });
      }
    }, 500);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  // Play a song or list of songs
  const playSong = (song, songList = []) => {
    try {
      console.log('🎵 Playing song:', song.title, 'Path:', song.path);

      // Release previous sound
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
        stopProgressTracking();
      }

      const tracksToPlay = songList.length > 0 ? songList : [song];
      const indexToPlay =
        songList.length > 0 ? songList.findIndex(s => s.id === song.id) : 0;

      setQueue(tracksToPlay);
      setCurrentIndex(indexToPlay);
      setCurrentTrack(song);

      // Create new sound instance
      const sound = new Sound(song.path, '', error => {
        if (error) {
          console.error('❌ Failed to load sound:', error);
          console.error('Path:', song.path);
          return;
        }

        console.log('✅ Sound loaded successfully');
        const duration = sound.getDuration();
        setProgress({ position: 0, duration });

        // Play sound
        sound.play(success => {
          if (success) {
            console.log('✅ Playback finished');
            handleSongEnd();
          } else {
            console.error('❌ Playback failed');
          }
        });

        setIsPlaying(true);
        startProgressTracking(sound);
      });

      soundRef.current = sound;

      // Add to play history
      addSongToHistory(song.id);

      // Save last played song
      AsyncStorage.setItem('lastPlayedSong', String(song.id));
    } catch (error) {
      console.error('❌ Error playing song:', error);
    }
  };

  const handleSongEnd = () => {
    stopProgressTracking();

    if (repeatMode === 'one') {
      // Replay current song
      if (soundRef.current) {
        soundRef.current.setCurrentTime(0);
        soundRef.current.play();
        startProgressTracking(soundRef.current);
      }
    } else if (repeatMode === 'all' || currentIndex < queue.length - 1) {
      // Play next song
      skipToNext();
    } else {
      // End of queue
      setIsPlaying(false);
      setProgress({ position: 0, duration: progress.duration });
    }
  };

  const pause = () => {
    if (soundRef.current && soundRef.current.isLoaded()) {
      soundRef.current.pause();
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  const resume = () => {
    if (soundRef.current && soundRef.current.isLoaded()) {
      soundRef.current.play(success => {
        if (!success) {
          console.error('Resume failed');
        }
      });
      setIsPlaying(true);
      startProgressTracking(soundRef.current);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const skipToNext = () => {
    let nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }

    const nextSong = queue[nextIndex];
    if (nextSong) {
      playSong(nextSong, queue);
    }
  };

  const skipToPrevious = () => {
    let prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = queue.length - 1;
      } else {
        return;
      }
    }

    const prevSong = queue[prevIndex];
    if (prevSong) {
      playSong(prevSong, queue);
    }
  };

  const seekTo = position => {
    if (soundRef.current && soundRef.current.isLoaded()) {
      soundRef.current.setCurrentTime(position);
      setProgress(prev => ({ ...prev, position }));
    }
  };

  const playShuffled = songList => {
    try {
      if (songList.length === 0) return;

      // Shuffle the list
      const shuffled = [...songList].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    } catch (error) {
      console.error('Error playing shuffled:', error);
    }
  };

  const value = {
    // Theme & Layout
    isDark,
    colors,
    toggleTheme,
    layout,
    toggleLayout,

    // Player State
    currentTrack,
    isPlaying,
    queue,
    progress,

    // Playback Controls
    playSong,
    pause,
    resume,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    playShuffled,

    // Player Modes
    shuffleMode,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
