// frontend/src/context/AudioContext.js

import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { Audio } from 'expo-av';
import { getMockSongs } from '../data/songs'; // Đảm bảo import từ data
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AudioContext = createContext();

const SONG_LIST = getMockSongs(); // Lấy danh sách bài hát tĩnh

export const AudioProvider = ({ children }) => {
    const [sound, setSound] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackStatus, setPlaybackStatus] = useState(null);
    const [currentQueue, setCurrentQueue] = useState(SONG_LIST);
    const [originalQueue, setOriginalQueue] = useState(SONG_LIST); // Để dành cho shuffle
    const [isLoading, setIsLoading] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'one', 'all'
    const [sleepTimerId, setSleepTimerId] = useState(null);

    const isPlayerLoading = useRef(false); // Ref để tránh load chồng chéo
    
    // Hàm tải trạng thái (ví dụ)
    useEffect(() => {
        const loadInitialState = async () => {
            try {
                const savedSong = await AsyncStorage.getItem('lastPlayedSong');
                if (savedSong) {
                    setCurrentSong(JSON.parse(savedSong));
                }
                const savedShuffle = await AsyncStorage.getItem('shuffleState');
                if (savedShuffle) {
                    setIsShuffle(JSON.parse(savedShuffle));
                }
                 const savedRepeat = await AsyncStorage.getItem('repeatMode');
                if (savedRepeat) {
                    setRepeatMode(savedRepeat);
                }
            } catch (e) {
                console.error("Lỗi tải trạng thái:", e);
            }
        };
        loadInitialState();
        
        // Cấu hình Audio session
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            interruptionModeIOS: 1, // DO_NOT_MIX
            interruptionModeAndroid: 1, // DO_NOT_MIX
        });

        return () => {
            sound?.unloadAsync();
        };
    }, []);

    // Hàm lưu trạng thái
    useEffect(() => {
        if (currentSong) {
            AsyncStorage.setItem('lastPlayedSong', JSON.stringify(currentSong));
        }
    }, [currentSong]);

    useEffect(() => {
        AsyncStorage.setItem('shuffleState', JSON.stringify(isShuffle));
    }, [isShuffle]);

     useEffect(() => {
        AsyncStorage.setItem('repeatMode', repeatMode);
    }, [repeatMode]);


    // --- Cập nhật hàm playSong ---
    const playSong = async (song, queue = null) => {
        if (isPlayerLoading.current) return; // Không làm gì nếu đang load
        if (song?.id === currentSong?.id && sound) {
             // Nếu cùng bài hát, chỉ Play/Pause
            handlePlayPause();
            return;
        }

        isPlayerLoading.current = true;
        setIsLoading(true);
        console.log("Đang tải bài hát:", song.title);

        try {
            if (sound) {
                await sound.unloadAsync();
            }

            // *** SỬA ĐỔI QUAN TRỌNG ***
            // Thay song.url thành song.trackUrl
            const { sound: newSound, status } = await Audio.Sound.createAsync(
                song.trackUrl, // <-- SỬA Ở ĐÂY
                { shouldPlay: true, progressUpdateIntervalMillis: 500 }
            );
            // *** KẾT THÚC SỬA ĐỔI ***

            setSound(newSound);
            setCurrentSong(song);
            setIsPlaying(true);
            setPlaybackStatus(status); // Cập nhật status ban đầu
            newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

            if (queue) {
                setCurrentQueue(queue);
                setOriginalQueue(queue);
                 if (isShuffle) {
                    // Nếu shuffle đang bật, xáo trộn queue mới
                    const shuffled = [...queue].sort(() => Math.random() - 0.5);
                    const currentSongIndex = shuffled.findIndex(s => s.id === song.id);
                    if (currentSongIndex > -1) {
                        const [current] = shuffled.splice(currentSongIndex, 1);
                        shuffled.unshift(current);
                    }
                    setCurrentQueue(shuffled);
                 } else {
                     setCurrentQueue(queue);
                 }
            }

        } catch (error) {
            console.error("Lỗi khi tải bài hát:", error);
            setIsPlaying(false);
            setCurrentSong(null);
        } finally {
            setIsLoading(false);
            isPlayerLoading.current = false;
        }
    };
    
    const onPlaybackStatusUpdate = (status) => {
        setPlaybackStatus(status);
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish && !status.isLooping) {
                handleSongEnd();
            }
        } else {
            if (status.error) {
                console.error(`Lỗi phát nhạc: ${status.error}`);
                setIsPlaying(false);
            }
        }
    };

    const handleSongEnd = () => {
        console.log("Bài hát kết thúc, repeatMode:", repeatMode);
        if (repeatMode === 'one') {
            sound.replayAsync();
        } else if (repeatMode === 'all') {
            playNext(true); // true = forceNext (luôn phát bài tiếp theo, kể cả shuffle)
        } else if (isShuffle) {
             playNext(false); // Phát ngẫu nhiên
        } else {
            // Chế độ 'off' và không shuffle
            const currentIndex = currentQueue.findIndex(s => s.id === currentSong.id);
            if (currentIndex < currentQueue.length - 1) {
                playNext(false);
            } else {
                // Đã hết queue, dừng nhạc
                setIsPlaying(false);
                sound.setPositionAsync(0);
                sound.pauseAsync();
            }
        }
    };

     const handlePlayPause = async () => {
        if (isLoading) return;
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
            setIsPlaying(!isPlaying);
        } else if (currentSong) {
             // Nếu chưa có sound nhưng có currentSong (ví dụ: mở lại app)
            playSong(currentSong);
        }
    };

     const seekTo = async (position) => {
        if (sound) {
            try {
                await sound.setPositionAsync(position);
            } catch (e) {
                console.error("Lỗi khi tua:", e);
            }
        }
    };

    const formatTime = (millis) => {
        if (!millis || millis < 0) return '0:00';
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

     const playNext = (forceNext = false) => {
         if (!currentSong || (currentQueue.length <= 1 && !forceNext)) return;

        let currentIndex = currentQueue.findIndex(s => s.id === currentSong.id);
        let nextIndex;

        if (isShuffle && !forceNext) {
            nextIndex = Math.floor(Math.random() * currentQueue.length);
             // Đảm bảo không lặp lại bài cũ
            if (nextIndex === currentIndex && currentQueue.length > 1) {
                 nextIndex = (currentIndex + 1) % currentQueue.length;
            }
        } else {
            nextIndex = (currentIndex + 1) % currentQueue.length;
        }
        
        if (currentQueue[nextIndex]) {
            playSong(currentQueue[nextIndex]);
        }
    };

    const playPrevious = () => {
         if (!currentSong || currentQueue.length <= 1) return;

        let currentIndex = currentQueue.findIndex(s => s.id === currentSong.id);
        let prevIndex;

        if (isShuffle) {
            prevIndex = Math.floor(Math.random() * currentQueue.length);
            if (prevIndex === currentIndex && currentQueue.length > 1) {
                 prevIndex = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
            }
        } else {
            prevIndex = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
        }
        
        if (currentQueue[prevIndex]) {
            playSong(currentQueue[prevIndex]);
        }
    };

    const toggleShuffle = () => {
        const newShuffleState = !isShuffle;
        setIsShuffle(newShuffleState);
        if (newShuffleState) {
            // Xáo trộn queue
            const shuffled = [...originalQueue].sort(() => Math.random() - 0.5);
            // Đảm bảo bài hát hiện tại vẫn ở đầu
            const currentSongIndex = shuffled.findIndex(s => s.id === currentSong?.id);
            if (currentSongIndex > -1) {
                const [current] = shuffled.splice(currentSongIndex, 1);
                shuffled.unshift(current);
            }
            setCurrentQueue(shuffled);
        } else {
            // Quay lại queue gốc (giữ nguyên thứ tự bài hát hiện tại)
            const currentIndexInOriginal = originalQueue.findIndex(s => s.id === currentSong?.id);
            if (currentIndexInOriginal > -1) {
                 // Đặt bài hát hiện tại làm mốc
                 const reordered = [
                     ...originalQueue.slice(currentIndexInOriginal),
                     ...originalQueue.slice(0, currentIndexInOriginal)
                 ];
                 // Cập nhật lại originalQueue để giữ đúng thứ tự khi play next
                 setOriginalQueue(reordered);
                 setCurrentQueue(reordered);
            } else {
                 setCurrentQueue(originalQueue);
            }
        }
    };

    const toggleRepeatMode = () => {
        if (repeatMode === 'off') setRepeatMode('all');
        else if (repeatMode === 'all') setRepeatMode('one');
        else setRepeatMode('off');
    };

    const setSleepTimer = (duration) => {
        clearSleepTimer(); // Xóa timer cũ nếu có
        console.log(`Hẹn giờ tắt nhạc trong ${duration} ms`);
        const timerId = setTimeout(() => {
            if (sound && isPlaying) {
                sound.pauseAsync();
                setIsPlaying(false);
            }
            setSleepTimerId(null);
             console.log("Đã tắt nhạc theo hẹn giờ.");
        }, duration);
        setSleepTimerId(timerId);
    };

    const clearSleepTimer = () => {
        if (sleepTimerId) {
            clearTimeout(sleepTimerId);
            setSleepTimerId(null);
            console.log("Đã hủy hẹn giờ.");
        }
    };

    const value = {
        sound,
        currentSong,
        isPlaying,
        playbackStatus,
        currentQueue,
        isLoading,
        isShuffle,
        repeatMode,
        sleepTimerId,
        positionMillis: playbackStatus?.positionMillis || 0,
        durationMillis: playbackStatus?.durationMillis || 0,
        playSong,
        handlePlayPause,
        seekTo,
        playNext,
        playPrevious,
        formatTime,
        toggleShuffle,
        toggleRepeatMode,
        setSleepTimer,
        clearSleepTimer,
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudioPlayer = () => {
    return useContext(AudioContext);
};