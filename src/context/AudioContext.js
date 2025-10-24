// frontend/src/context/AudioContext.js (PHIÊN BẢN DÙNG expo-av - Load file từ assets)
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Audio } from 'expo-av'; // <-- Sử dụng expo-av
import { Alert } from 'react-native';
import { getMockSongs } from '../data/songs'; // <-- Lấy dữ liệu bài hát (chứa require path)

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
  const [isPlaying, setIsPlaying] = useState(false); // State chính cho Play/Pause
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [songList, setSongList] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [currentSong, setCurrentSong] = useState(null); // State cho object bài hát hiện tại
  const [repeatMode, setRepeatMode] = useState('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [playbackOrder, setPlaybackOrder] = useState([]); // Sẽ lưu index
  const [sleepTimerId, setSleepTimerId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const songs = getMockSongs();
    setSongList(songs);
    setPlaybackOrder(songs.map((_, index) => index));
  }, []);

  useEffect(() => {
    if (songList.length === 0) return;
    let newOrderIndex = songList.map((_, index) => index); // Dùng index
    if (isShuffle) {
      if (currentSongIndex !== null) {
        newOrderIndex.splice(currentSongIndex, 1);
        newOrderIndex = shuffleArray(newOrderIndex);
        newOrderIndex.unshift(currentSongIndex);
      } else {
        newOrderIndex = shuffleArray(newOrderIndex);
      }
    }
    setPlaybackOrder(newOrderIndex);
  }, [isShuffle, songList, currentSongIndex]); // Dùng currentSongIndex

  // Cập nhật state currentSong khi index hoặc list thay đổi
  useEffect(() => {
    if (currentSongIndex !== null && songList.length > 0 && currentSongIndex < songList.length) {
      setCurrentSong(songList[currentSongIndex]);
    } else {
      setCurrentSong(null); // Reset nếu index không hợp lệ
    }
  }, [currentSongIndex, songList]); // Phụ thuộc vào index và songList


  useEffect(() => {
    // Cleanup function
    return () => {
      if (sound) {
        console.log('Unloading sound on context unmount');
        sound.getStatusAsync() // Check status before unloading
         .then(status => {
            if (status.isLoaded) {
              sound.setOnPlaybackStatusUpdate(null); // Remove listener first
              sound.unloadAsync().catch(e => console.error("Error unloading sound during cleanup:", e));
            }
         })
         .catch(e => console.error("Error getting status during cleanup:", e));
      }
      if (sleepTimerId) {
        clearTimeout(sleepTimerId);
      }
    };
  }, [sound]); // Dependency on sound object


  // --- Audio Handling Functions ---
  const onPlaybackStatusUpdate = async (status) => {
    if (!sound) return; // Guard clause: Kiểm tra sound tồn tại

    if (!status.isLoaded) {
      // If the sound just finished AND it was NOT looping by hardware
      if (status.didJustFinish && !status.isLooping) {
        console.log("Track finished");
        if (repeatMode !== 'one') { // Chỉ chuyển bài nếu không phải lặp 1 bài
          playNext();
        }
        // Nếu repeatMode == 'one', isLooping=true sẽ tự động phát lại
      } else if (status.error) {
           console.error(`Player Error: ${status.error}`);
           // Potentially unload or reset state here
           setIsPlaying(false); // Cập nhật UI nếu có lỗi
      } else {
          // Các trường hợp khác (unloaded,...) -> có thể giữ nguyên isPlaying
          // để tránh nhấp nháy UI không cần thiết
      }
      return;
    }
    // Cập nhật state nếu sound đã load thành công
    setPositionMillis(status.positionMillis || 0);
    setDurationMillis(status.durationMillis || 0);
    // Cập nhật isPlaying TỪ STATUS để đảm bảo đồng bộ cuối cùng
    setIsPlaying(status.isPlaying);
  };

  // Play Track (NHẬN INDEX, DÙNG require)
  const playTrack = async (index) => {
    console.log(`playTrack called with index: ${index}`);
    if (typeof index !== 'number' || index < 0 || index >= songList.length) {
      console.error('playTrack: Invalid index received.', index);
      return; // Dừng nếu index không hợp lệ
    }

    setIsLoading(true); // Bắt đầu loading
    setIsPlaying(false); // Tạm đặt là false khi đang tải bài mới
    setPositionMillis(0);
    setDurationMillis(0);

    // Lấy track object dựa trên index
    const track = songList[index];
    // --- KIỂM TRA trackUrl (giờ là giá trị require) ---
    if (!track || !track.trackUrl) {
        console.error("playTrack: Track data invalid or missing trackUrl (require path) for index:", index);
        setIsPlaying(false);
        setCurrentSongIndex(null); // Reset index nếu track không hợp lệ
        // currentSong sẽ tự reset qua useEffect
        setIsLoading(false);
        return;
    };

    // Unload sound cũ một cách an toàn
    if (sound) {
      console.log('Unloading previous sound...');
      try {
        await sound.unloadAsync();
        console.log('Previous sound unloaded.');
      } catch (error) {
        console.error("Error unloading previous sound:", error);
      } finally {
        setSound(null); // Luôn đặt sound về null sau khi unload
      }
    }

    // Cập nhật index trước (sẽ kích hoạt useEffect cập nhật currentSong)
    setCurrentSongIndex(index);

    console.log('Attempting to create sound for:', track.title);
    let newSound = null; // Khai báo trước để dùng trong catch/finally
    try {
      // Cấu hình audio mode (quan trọng cho background)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, playsInSilentModeIOS: true,
        staysActiveInBackground: true, shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Tạo và tải sound mới từ asset require()
      const { sound: createdSound, status } = await Audio.Sound.createAsync(
        track.trackUrl, // <-- Sử dụng trực tiếp giá trị require từ songs.js
        {
          shouldPlay: true, // Tự động phát sau khi tải
          isLooping: repeatMode === 'one', // Cài đặt lặp lại 1 bài
          // volume: 1.0, // Âm lượng mặc định
        },
        onPlaybackStatusUpdate // Đặt callback theo dõi trạng thái
      );
      newSound = createdSound; // Gán vào biến ngoài try

      // Kiểm tra trạng thái ngay sau khi tạo
      if (!status.isLoaded) {
        throw new Error(`Failed to load sound: ${status.error || 'Unknown error'}`);
      }
      console.log('Sound loaded successfully. Initial status:', status);

      // Cập nhật state thành công
      setSound(newSound);
      // Cập nhật state từ status trả về (chính xác hơn)
      setPositionMillis(status.positionMillis || 0);
      setDurationMillis(status.durationMillis || 0);
      // Cập nhật isPlaying ngay dựa trên status ban đầu
      setIsPlaying(status.isPlaying);

    } catch (error) {
      console.error('!!!!!!!!!! LỖI KHI TẢI HOẶC PHÁT BÀI HÁT !!!!!!!!!!', error);
      // Reset state khi có lỗi
      setIsPlaying(false);
      // Giữ lại index nhưng reset sound
      setSound(null);
      // setCurrentSong(null); // useEffect sẽ xử lý
      Alert.alert(`Lỗi phát nhạc`, `Không thể phát bài hát "${track.title}". File có thể bị lỗi hoặc không tìm thấy.`);
    } finally {
      // Dù thành công hay thất bại, đặt isLoading thành false
      setIsLoading(false);
    }
  };

  // --- Control Functions ---
  const handlePlayPause = async () => {
      if (!sound || isLoading) { // Thêm kiểm tra isLoading
          console.warn("handlePlayPause: sound is null or currently loading.");
          return;
      }
      try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
              if (status.isPlaying) { // Dùng status.isPlaying thay vì state isPlaying
                  console.log("Pausing...");
                  await sound.pauseAsync();
              } else {
                  if (!status.didJustFinish) {
                      console.log("Playing...");
                      await sound.playAsync();
                  } else {
                      console.log("Replaying from start...");
                      await sound.replayAsync({ shouldPlay: true });
                  }
              }
              // KHÔNG đặt setIsPlaying ở đây, chờ callback cập nhật
          } else { console.warn("handlePlayPause: Sound not loaded."); }
      }
      catch (error) { console.error("Error handling play/pause:", error); }
  };

  // --- HÀM seekTo ĐÃ ĐƯỢC LÀM CHẶT CHẼ HƠN ---
  const seekTo = async (value) => {
      // 1. Kiểm tra sound tồn tại ngay từ đầu
      if (!sound) {
          console.warn("seekTo: sound is null. Cannot seek.");
          return;
      }

      // 2. Kiểm tra và làm sạch giá trị đầu vào
      let seekMillis = Math.floor(value); // Chuyển thành số nguyên
      if (isNaN(seekMillis) || seekMillis < 0) {
          console.warn(`seekTo: Invalid seek value received: ${value}. Seeking to 0.`);
          seekMillis = 0;
      }

      console.log(`Attempting to seek to: ${seekMillis}ms`);

      try {
           // 3. Lấy status MỚI NHẤT trước khi tua
           const status = await sound.getStatusAsync();

           // 4. Kiểm tra sound đã load CHƯA
           if (!status || !status.isLoaded) {
               console.warn("seekTo: Sound is not loaded. Cannot seek.");
               return; // Không thể tua nếu chưa load
           }

           // Log trạng thái trước khi tua
           console.log('Status before seek:', status);

           // 5. Kiểm tra giá trị tua có hợp lệ so với duration không
           const duration = status.durationMillis;
           let targetMillis = seekMillis;
           if (duration) { // Chỉ kiểm tra nếu duration tồn tại
               // Giới hạn giá trị tua không vượt quá duration (trừ 1ms để an toàn)
               targetMillis = Math.min(seekMillis, duration - 1);
               targetMillis = Math.max(0, targetMillis); // Đảm bảo không âm
           } else {
               // Nếu không có duration, vẫn thử tua nhưng cảnh báo
               console.warn("seekTo: Duration is unknown, seeking might be inaccurate.");
               targetMillis = Math.max(0, seekMillis); // Đảm bảo không âm
           }


           console.log(`Seeking sound object to actual value: ${targetMillis}ms`);
           // 6. Thực hiện tua nhạc
           await sound.setPositionAsync(targetMillis);
           console.log("Seek successful (setPositionAsync called). Status update will follow.");
           // KHÔNG cập nhật positionMillis thủ công ở đây. Hãy để onPlaybackStatusUpdate làm việc đó.

      } catch (error) {
          console.error("!!!!!!!!!! LỖI KHI TUA NHẠC (seekTo) !!!!!!!!!!", error);
          // Log lỗi chi tiết hơn
          if (error.code) console.error("Seek Error Code:", error.code);
          if (error.message) console.error("Seek Error Message:", error.message);
          // Cân nhắc hiển thị thông báo lỗi
          // Alert.alert("Lỗi", "Không thể tua nhạc.");
      }
  };
  // --- KẾT THÚC seekTo ---

  const playNext = async () => {
      if (currentSongIndex === null) { console.log("playNext: No current song index"); return; }
      if (playbackOrder.length === 0) { console.log("playNext: playbackOrder is empty"); return; }
      // Không cần kiểm tra sound ở đây vì playTrack sẽ tạo mới
      console.log("playNext called");

      const currentOrderIndex = playbackOrder.indexOf(currentSongIndex);
      let nextOrderIndex = currentOrderIndex + 1;
      if (nextOrderIndex >= playbackOrder.length) {
          if (repeatMode === 'all') nextOrderIndex = 0;
          else {
              console.log("playNext: End of list, stopping.");
              setIsPlaying(false);
              // Chỉ dừng sound nếu nó đang tồn tại và đã load
              if (sound) {
                   try {
                       const status = await sound.getStatusAsync();
                       if(status.isLoaded){ await sound.pauseAsync(); await sound.setPositionAsync(0); }
                   } catch (error) { console.error("Error stopping at end:", error); }
              }
              return;
          }
      }
       if (nextOrderIndex < 0 || nextOrderIndex >= playbackOrder.length) { console.error("playNext: Invalid nextOrderIndex", nextOrderIndex); return; }
      const nextSongIndex = playbackOrder[nextOrderIndex];
      console.log(`playNext: Playing index ${nextSongIndex}`);
      await playTrack(nextSongIndex);
  };

  const playPrevious = async () => {
      if (currentSongIndex === null) { console.log("playPrevious: No current song index"); return; }
       if (playbackOrder.length === 0) { console.log("playPrevious: playbackOrder is empty"); return; }
      // Không cần kiểm tra sound ở đây
      console.log("playPrevious called");

      // Kiểm tra sound trước khi dùng positionMillis
      if (sound && positionMillis > 3000) {
          console.log("playPrevious: Seeking to 0");
          await seekTo(0);
          return;
      }

      const currentOrderIndex = playbackOrder.indexOf(currentSongIndex);
      let prevOrderIndex = currentOrderIndex - 1;
      if (prevOrderIndex < 0) {
          if (repeatMode === 'all') prevOrderIndex = playbackOrder.length - 1;
          else {
              console.log("playPrevious: At start, seeking to 0");
              if (sound) await seekTo(0); // Chỉ seek nếu có sound
              return;
          }
      }
       if (prevOrderIndex < 0 || prevOrderIndex >= playbackOrder.length) { console.error("playPrevious: Invalid prevOrderIndex", prevOrderIndex); return; }
      const prevSongIndex = playbackOrder[prevOrderIndex];
      console.log(`playPrevious: Playing index ${prevSongIndex}`);
      await playTrack(prevSongIndex);
  };

  const toggleShuffle = () => { setIsShuffle(prev => !prev); console.log("Shuffle toggled:", !isShuffle); };

  const toggleRepeatMode = async () => {
     const nextMode = ((prev) => {
        if (prev === 'off') return 'all';
        if (prev === 'all') return 'one';
        return 'off';
     })(repeatMode);
     console.log("Repeat mode toggled to:", nextMode);
     if (sound) {
        try {
            const status = await sound.getStatusAsync();
            if(status.isLoaded){ await sound.setIsLoopingAsync(nextMode === 'one'); }
        }
        catch (error) { console.error("Error setting looping:", error); }
     }
     setRepeatMode(nextMode);
  };

  // --- Sleep Timer Functions ---
  const clearSleepTimer = () => { if (sleepTimerId) { clearTimeout(sleepTimerId); setSleepTimerId(null); console.log('Đã hủy Hẹn giờ ngủ'); } };
  const setSleepTimer = (minutes) => {
    clearSleepTimer();
    const milliseconds = minutes * 60 * 1000;
    console.log(`Đặt Hẹn giờ ngủ trong ${minutes} phút.`);
    const timerId = setTimeout(() => {
      console.log('Sleep timer expired. Checking playback status...');
      if (isPlaying) { // Dùng state isPlaying đã được cập nhật
         console.log('Pausing due to sleep timer.');
         handlePlayPause();
      } else {
          console.log('Sleep timer expired, but already paused.');
      }
      setSleepTimerId(null);
    }, milliseconds);
    setSleepTimerId(timerId);
  };

  // --- Context Value ---
  const value = {
    sound, isPlaying, positionMillis, durationMillis,
    currentSong, // <-- Dùng state currentSong
    formatTime,
    playTrack,
    handlePlayPause, seekTo, playNext, playPrevious,
    repeatMode, isShuffle, toggleRepeatMode, toggleShuffle,
    sleepTimerId, setSleepTimer, clearSleepTimer,
    isLoading,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};