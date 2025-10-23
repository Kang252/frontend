// frontend/src/context/AudioContext.js (PHIÊN BẢN DÙNG expo-av)
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Audio } from 'expo-av'; // <-- QUAY LẠI expo-av
import { getMockSongs } from '../data/songs';

// --- (Helper Functions: formatTime, shuffleArray - Unchanged) ---
const formatTime = (millis) => {
  if (!millis) return '00:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

function shuffleArray(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}
// --- (End Helper Functions) ---

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  // --- States ---
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [songList, setSongList] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [repeatMode, setRepeatMode] = useState('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [playbackOrder, setPlaybackOrder] = useState([]);
  const [volume, setVolume] = useState(1.0);
  const [sleepTimerId, setSleepTimerId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Effects ---
  useEffect(() => { /* Load songList */ }, []);
  useEffect(() => { /* Update playbackOrder */ }, [isShuffle, songList, currentSongIndex]);
  useEffect(() => { /* Cleanup sound and timer */
    return () => {
      if (sound) {
        sound.setOnPlaybackStatusUpdate(null);
        sound.unloadAsync();
      }
      if (sleepTimerId) {
        clearTimeout(sleepTimerId);
      }
    };
  }, [sound]);

  // --- Audio Handling Functions ---
  const onPlaybackStatusUpdate = async (status) => {
    if (!sound) { // Added check
        console.warn("onPlaybackStatusUpdate called but sound is null");
        return;
    }

    if (!status.isLoaded) {
      if (status.didJustFinish) {
        if (repeatMode === 'one') {
          try {
            await sound.setPositionAsync(0);
            await sound.playAsync();
          } catch(error) {
             console.error("Error replaying track:", error);
             setIsPlaying(false); // Update state if replay fails
          }
        } else {
          playNext();
        }
      } else {
          // Handle potential errors where unload happened unexpectedly
          console.warn("Playback status update: Sound is not loaded", status.error);
          setIsPlaying(false); // Ensure UI reflects unloaded state
      }
      return;
    }
    // Only update if the sound object is still valid
    setPositionMillis(status.positionMillis || 0);
    setDurationMillis(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);
  };

  const playTrack = async (index) => {
    setIsLoading(true);
    setPositionMillis(0);
    setDurationMillis(0);

    if (sound) {
      try { await sound.unloadAsync(); } catch (error) { console.error("Error unloading previous sound:", error); }
      setSound(null);
    }

    if (index < 0 || index >= songList.length) {
      setIsPlaying(false); setCurrentSongIndex(null); setIsLoading(false); return;
    }
    const track = songList[index];
    if (!track || !track.trackUrl) {
        console.error("Track or track URL is missing for index:", index);
        setIsPlaying(false); setCurrentSongIndex(null); setIsLoading(false); return;
    };

    try {
      console.log('Đang tải bài hát (index):', index, track.title);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound: newSound, status } = await Audio.Sound.createAsync( // Get status too
        { uri: track.trackUrl },
        {
          shouldPlay: true,
          volume: volume,
          isLooping: repeatMode === 'one',
        }
      );

      // Check status immediately after creation
      if (!status.isLoaded) {
          throw new Error(`Failed to load sound: ${status.error || 'Unknown error'}`);
      }

      setSound(newSound);
      setCurrentSongIndex(index);
      // Update initial duration/position from status
      setDurationMillis(status.durationMillis || 0);
      setPositionMillis(status.positionMillis || 0);
      setIsPlaying(status.isPlaying); // Set initial playing state
      newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      setIsLoading(false);

    } catch (error) {
      console.error('Lỗi khi tải hoặc phát bài hát:', error);
      setIsPlaying(false);
      setCurrentSongIndex(null);
      setIsLoading(false);
      setSound(null); // Ensure sound is null on error
    }
  };

  // --- Control Functions ---
  const handlePlayPause = async () => {
      if (!sound) { console.warn("handlePlayPause called but sound is null"); return; }
      try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
              if (isPlaying) await sound.pauseAsync(); else await sound.playAsync();
          } else {
              console.warn("handlePlayPause: Sound not loaded.");
          }
      }
      catch (error) { console.error("Error handling play/pause:", error); }
  };

  // --- REFINED seekTo FUNCTION ---
  const seekTo = async (value) => {
      if (!sound) {
          console.warn("seekTo called but sound is null");
          return;
      }
      // Ensure value is a valid number and within bounds
      const seekMillis = Math.max(0, Math.floor(value));

      console.log(`Attempting to seek to: ${seekMillis}`); // Log intended seek value

      try {
           const status = await sound.getStatusAsync();
           if (status.isLoaded) {
                // Check if seek value is within duration to avoid potential errors
                if (status.durationMillis && seekMillis >= status.durationMillis) {
                    console.warn(`Seek value ${seekMillis} exceeds duration ${status.durationMillis}. Seeking to end.`);
                    await sound.setPositionAsync(status.durationMillis - 1); // Seek near the end
                    setPositionMillis(status.durationMillis - 1);
                } else {
                    await sound.setPositionAsync(seekMillis);
                    setPositionMillis(seekMillis); // Update state only after successful seek
                }
           } else {
                console.warn("seekTo: Sound not loaded when trying to seek.");
           }
      }
      catch (error) {
          console.error("Error seeking:", error);
          // Potentially reset UI position if seek fails?
          // setPositionMillis(currentPositionBeforeSeekAttempt);
      }
  };
  
  const playNext = async () => {
      if (currentSongIndex === null || !sound) return;
      const currentOrderIndex = playbackOrder.indexOf(currentSongIndex);
      let nextOrderIndex = currentOrderIndex + 1;
      if (nextOrderIndex >= playbackOrder.length) {
          if (repeatMode === 'all') nextOrderIndex = 0;
          else {
              setIsPlaying(false);
              try { if(sound) {
                  const status = await sound.getStatusAsync();
                  if(status.isLoaded){
                      await sound.pauseAsync(); await sound.setPositionAsync(0);
                  }
              } }
              catch (error) { console.error("Error stopping at end:", error); }
              return;
          }
      }
      const nextSongIndex = playbackOrder[nextOrderIndex];
      await playTrack(nextSongIndex);
  };
  const playPrevious = async () => {
      if (currentSongIndex === null || !sound) return;
      if (positionMillis > 3000) { await seekTo(0); return; }
      const currentOrderIndex = playbackOrder.indexOf(currentSongIndex);
      let prevOrderIndex = currentOrderIndex - 1;
      if (prevOrderIndex < 0) {
          if (repeatMode === 'all') prevOrderIndex = playbackOrder.length - 1;
          else { await seekTo(0); return; }
      }
      const prevSongIndex = playbackOrder[prevOrderIndex];
      await playTrack(prevSongIndex);
  };
  const toggleShuffle = () => { setIsShuffle(prev => !prev); };
  const toggleRepeatMode = async () => {
     const nextMode = ((prev) => {
        if (prev === 'off') return 'all';
        if (prev === 'all') return 'one';
        return 'off';
     })(repeatMode);
     if (sound) {
        try {
            const status = await sound.getStatusAsync();
            if(status.isLoaded){
                 await sound.setIsLoopingAsync(nextMode === 'one');
            }
        }
        catch (error) { console.error("Error setting looping:", error); }
     }
     setRepeatMode(nextMode);
  };
  const setAudioVolume = async (value) => {
     if (sound) {
        try {
            const status = await sound.getStatusAsync();
            if(status.isLoaded){
                 await sound.setVolumeAsync(value);
            }
        }
        catch(error){ console.error("Error setting volume:", error); }
     }
     setVolume(value);
  };

  // --- Sleep Timer Functions (Unchanged) ---
  const clearSleepTimer = () => { if (sleepTimerId) { clearTimeout(sleepTimerId); setSleepTimerId(null); console.log('Đã hủy Hẹn giờ ngủ'); } };
  const setSleepTimer = (minutes) => {
    clearSleepTimer();
    const milliseconds = minutes * 60 * 1000;
    console.log(`Đặt Hẹn giờ ngủ trong ${minutes} phút.`);
    const timerId = setTimeout(() => {
      if (isPlaying) { handlePlayPause(); }
      setSleepTimerId(null);
      console.log('Hẹn giờ ngủ: Đã tự động tắt nhạc.');
    }, milliseconds);
    setSleepTimerId(timerId);
  };

  // --- Current Song (Unchanged) ---
  const currentSong = currentSongIndex !== null ? songList[currentSongIndex] : null;

  // --- Context Value ---
  const value = {
    sound, isPlaying, positionMillis, durationMillis, currentSong, formatTime,
    playTrack, handlePlayPause, seekTo, playNext, playPrevious,
    repeatMode, isShuffle, toggleRepeatMode, toggleShuffle,
    volume, setAudioVolume,
    sleepTimerId, setSleepTimer, clearSleepTimer,
    isLoading,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};