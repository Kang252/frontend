// frontend/src/context/AudioContext.js (PHIÊN BẢN DÙNG expo-av VÀ JAMENDO)
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Audio } from 'expo-av';
// Bỏ import getMockSongs
// import { getMockSongs } from '../data/songs';

// --- (Helper Functions: formatTime, shuffleArray - Unchanged) ---
const formatTime = (millis) => { /* ... */ };
function shuffleArray(array) { /* ... */ }
// --- (End Helper Functions) ---

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  // --- States ---
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  // songList sẽ được cập nhật bởi màn hình (vd: Home, Search)
  const [songList, setSongList] = useState([]);
  // currentSongIndex giờ sẽ lưu ID bài hát thay vì index
  const [currentSongId, setCurrentSongId] = useState(null);
  const [currentSong, setCurrentSong] = useState(null); // Lưu trữ object bài hát đang phát
  const [repeatMode, setRepeatMode] = useState('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [playbackOrderIds, setPlaybackOrderIds] = useState([]); // Lưu thứ tự ID
  // const [volume, setVolume] = useState(1.0); // Đã bỏ
  const [sleepTimerId, setSleepTimerId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Effects ---
  // Bỏ useEffect tải getMockSongs

  // Cập nhật playbackOrder khi songList hoặc shuffle thay đổi
  useEffect(() => {
    if (songList.length === 0) {
        setPlaybackOrderIds([]);
        return;
    };
    let newOrderId = songList.map((track) => track.id); // Lấy ID
    if (isShuffle) {
      const currentTrackIndexInList = currentSongId ? newOrderId.indexOf(currentSongId) : -1;
      if (currentTrackIndexInList !== -1) {
        newOrderId.splice(currentTrackIndexInList, 1); // Xóa bài hiện tại
        newOrderId = shuffleArray(newOrderId); // Xáo trộn phần còn lại
        newOrderId.unshift(currentSongId); // Thêm bài hiện tại về đầu
      } else {
        newOrderId = shuffleArray(newOrderId); // Xáo trộn tất cả
      }
    }
    setPlaybackOrderIds(newOrderId);
    console.log("Cập nhật thứ tự phát (IDs):", newOrderId);
  }, [isShuffle, songList, currentSongId]); // Phụ thuộc vào currentSongId nữa

  useEffect(() => {
    // Cleanup function (Giữ nguyên)
    return () => { /* ... */ };
  }, [sound]);

  // --- Audio Handling Functions ---
  const onPlaybackStatusUpdate = async (status) => { /* ... (Giữ nguyên logic) ... */ };

  // --- CẬP NHẬT playTrack ĐỂ NHẬN OBJECT ---
  // Hàm này sẽ được gọi từ SongItem với toàn bộ object track từ Jamendo
  const playTrack = async (track) => {
    if (!track || !track.trackUrl) {
        console.error("playTrack: Dữ liệu track không hợp lệ hoặc thiếu trackUrl");
        return;
    }
    console.log(`playTrack called for song ID: ${track.id}, Title: ${track.title}`);
    setIsLoading(true);
    setPositionMillis(0);
    setDurationMillis(0);

    if (sound) {
      console.log('Unloading previous sound...');
      try { await sound.unloadAsync(); }
      catch (error) { console.error("Error unloading previous sound:", error); }
      finally { setSound(null); }
    }

    // Cập nhật bài hát hiện tại ngay lập tức (cho UI)
    setCurrentSong(track);
    setCurrentSongId(track.id);

    console.log('Attempting to create sound for:', track.title, 'URL:', track.trackUrl);
    try {
      console.log('Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, playsInSilentModeIOS: true,
        staysActiveInBackground: true, shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('Audio mode set.');

      console.log('Creating sound instance...');
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: track.trackUrl },
        {
          shouldPlay: true,
          // volume: 1.0,
          isLooping: repeatMode === 'one',
        },
        onPlaybackStatusUpdate
      );
      console.log('Sound instance created, status:', status.isLoaded ? 'Loaded' : 'Not Loaded', 'Error:', status.error);

      if (!status.isLoaded) { throw new Error(`Failed to load sound: ${status.error || 'Unknown error'}`); }

      setSound(newSound);
      // Cập nhật state từ status (có thể dư thừa nếu onPlaybackStatusUpdate chạy ngay)
      setDurationMillis(status.durationMillis || 0);
      setPositionMillis(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
      setIsLoading(false);
      console.log('Playback started successfully for:', track.title);

    } catch (error) {
      console.error('Lỗi khi tải hoặc phát bài hát:', error);
      setIsPlaying(false);
      setCurrentSongId(null); // Reset nếu lỗi
      setCurrentSong(null);
      setIsLoading(false);
      setSound(null);
    }
  };

  // --- Control Functions (Cập nhật logic Next/Prev để dùng ID) ---
  const handlePlayPause = async () => { /* ... (Giữ nguyên logic) ... */ };
  const seekTo = async (value) => { /* ... (Giữ nguyên logic) ... */ };

  const playNext = async () => {
      if (currentSongId === null || playbackOrderIds.length === 0) { console.log("playNext: No current song or empty playlist"); return; }
      if (!sound) { console.warn("playNext: Sound is null"); return;}
      console.log("playNext called");

      const currentOrderIndex = playbackOrderIds.indexOf(currentSongId);
      let nextOrderIndex = currentOrderIndex + 1;

      if (nextOrderIndex >= playbackOrderIds.length) {
          if (repeatMode === 'all') {
              console.log("playNext: Repeating all");
              nextOrderIndex = 0;
          } else {
              console.log("playNext: End of list, stopping.");
              setIsPlaying(false);
              try { if(sound) { /* ... (stop logic) ... */ } } catch (e) { /*...*/ }
              return;
          }
      }
       // Kiểm tra xem index có hợp lệ không
      if (nextOrderIndex < 0 || nextOrderIndex >= playbackOrderIds.length) {
          console.error("playNext: Invalid nextOrderIndex", nextOrderIndex);
          return;
      }

      const nextSongId = playbackOrderIds[nextOrderIndex];
      const nextTrack = songList.find(t => t.id === nextSongId); // Tìm object track
      if (nextTrack) {
          console.log(`playNext: Playing ID ${nextSongId}`);
          await playTrack(nextTrack); // Gọi playTrack với object
      } else {
          console.error(`playNext: Không tìm thấy track với ID ${nextSongId} trong songList`);
      }
  };

  const playPrevious = async () => {
      if (currentSongId === null || playbackOrderIds.length === 0) { console.log("playPrevious: No current song or empty playlist"); return; }
      if (!sound) { console.warn("playPrevious: Sound is null"); return;}
      console.log("playPrevious called");

      if (positionMillis > 3000) {
          console.log("playPrevious: Seeking to 0");
          await seekTo(0);
          return;
      }

      const currentOrderIndex = playbackOrderIds.indexOf(currentSongId);
      let prevOrderIndex = currentOrderIndex - 1;

      if (prevOrderIndex < 0) {
          if (repeatMode === 'all') {
               console.log("playPrevious: Repeating all (wrapping to end)");
               prevOrderIndex = playbackOrderIds.length - 1;
          } else {
              console.log("playPrevious: At start, seeking to 0");
              await seekTo(0); return;
          }
      }
       // Kiểm tra xem index có hợp lệ không
      if (prevOrderIndex < 0 || prevOrderIndex >= playbackOrderIds.length) {
           console.error("playPrevious: Invalid prevOrderIndex", prevOrderIndex);
           return;
      }

      const prevSongId = playbackOrderIds[prevOrderIndex];
      const prevTrack = songList.find(t => t.id === prevSongId); // Tìm object track
      if (prevTrack) {
          console.log(`playPrevious: Playing ID ${prevSongId}`);
          await playTrack(prevTrack); // Gọi playTrack với object
      } else {
           console.error(`playPrevious: Không tìm thấy track với ID ${prevSongId} trong songList`);
      }
  };

  const toggleShuffle = () => { setIsShuffle(prev => !prev); console.log("Shuffle toggled:", !isShuffle); };
  const toggleRepeatMode = async () => { /* ... (Giữ nguyên logic) ... */ };
  // const setAudioVolume = async (value) => { /* Đã bỏ */ };

  // --- Sleep Timer Functions (Giữ nguyên) ---
  const clearSleepTimer = () => { /* ... */ };
  const setSleepTimer = (minutes) => { /* ... */ };

  // --- HÀM MỚI ĐỂ CẬP NHẬT DANH SÁCH PHÁT ---
  // Các màn hình (Home, Search) sẽ gọi hàm này để đặt danh sách hiện tại
  const setCurrentPlaybackList = (tracks) => {
      console.log(`Setting current playback list with ${tracks.length} tracks.`);
      setSongList(tracks);
      // playbackOrderIds sẽ tự động cập nhật qua useEffect
  };


  // --- Context Value (CẬP NHẬT) ---
  const value = {
    sound, isPlaying, positionMillis, durationMillis,
    currentSong, // <-- Giữ lại object bài hát hiện tại
    formatTime,
    playTrack, // <-- Hàm playTrack đã thay đổi
    handlePlayPause, seekTo, playNext, playPrevious,
    repeatMode, isShuffle, toggleRepeatMode, toggleShuffle,
    // volume, // <-- Đã bỏ
    sleepTimerId, setSleepTimer, clearSleepTimer,
    isLoading,
    setCurrentPlaybackList, // <-- Thêm hàm mới
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};