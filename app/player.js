// frontend/app/player.js
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Alert, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import Slider from '@react-native-community/slider';
import { useAudioPlayer } from '../src/hooks/useAudioPlayer'; // Sửa nếu hook của bạn nằm ở context
import { useFavorites } from '../src/context/FavoritesContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AddToPlaylistModal from '../src/components/AddToPlaylistModal';

// --- Logic phân tích Lời bài hát ---
const parseLRC = (lrcString) => {
  if (!lrcString) return [];
  const lines = lrcString.split('\n');
  const parsed = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
      const time = (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        parsed.push({ time, text });
      }
    }
  }
  return parsed;
};
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// --- Kết thúc Logic Lời bài hát ---


export default function PlayerScreen() {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    currentSong, isPlaying, positionMillis, durationMillis,
    handlePlayPause, seekTo, playNext, playPrevious, formatTime,
    repeatMode, isShuffle, toggleRepeatMode, toggleShuffle,
    sleepTimerId, setSleepTimer, clearSleepTimer,
    isLoading,
  } = useAudioPlayer();

  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // --- States cho Slider (FR-2.3) ---
  const [isSeeking, setIsSeeking] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0); 

  // --- Logic Lời bài hát ---
  const flatListRef = useRef(null);
  const lyricsLines = useMemo(() => {
    return parseLRC(currentSong?.lyrics);
  }, [currentSong?.lyrics]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  // --- Cập nhật vị trí slider và lời bài hát ---
  useEffect(() => {
    // 1. Chỉ cập nhật sliderPosition TỪ positionMillis nếu KHÔNG đang kéo
    if (!isSeeking) {
      setSliderPosition(positionMillis);
    }

    // 2. Logic tìm dòng lyric hiện tại
    if (lyricsLines.length === 0) return;
    let newIndex = -1;
    // Sử dụng positionMillis (thời gian thực tế) để tìm dòng lyric
    for (let i = lyricsLines.length - 1; i >= 0; i--) {
      if (positionMillis >= lyricsLines[i].time) {
        newIndex = i;
        break;
      }
    }
    if (newIndex !== currentLineIndex) {
        setCurrentLineIndex(newIndex);
    }
  }, [positionMillis, lyricsLines, currentLineIndex, isSeeking]); // Thêm isSeeking

  // --- Logic cuộn lời bài hát ---
  useEffect(() => {
    // Chỉ cuộn khi không kéo slider thời lượng
    if (flatListRef.current && currentLineIndex !== -1 && lyricsLines.length > 0 && !isSeeking) {
      flatListRef.current.scrollToIndex({
        index: currentLineIndex, animated: true, viewPosition: 0.5, viewOffset: -SCREEN_HEIGHT * 0.1
      });
    }
  }, [currentLineIndex, lyricsLines, isSeeking]);


  // --- Render logic (Loading / Chưa có bài hát) ---
  if (isLoading && !currentSong) { // Chỉ hiển thị loading toàn màn hình khi mới tải
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
             <Ionicons name="chevron-down" size={28} color="white" />
          </Pressable>
        </View>
        <View style={[styles.content, styles.centerContent]}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      </SafeAreaView>
    );
  }
  if (!currentSong) {
      return (
          <SafeAreaView style={styles.container}>
              <View style={styles.header}>
                  <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                      <Ionicons name="chevron-down" size={28} color="white" />
                  </Pressable>
              </View>
              <View style={[styles.content, styles.centerContent]}>
                  <Text style={styles.title}>Chưa chọn bài hát</Text>
              </View>
          </SafeAreaView>
      );
  }

  // --- **SỬA LỖI HIỂN THỊ ẢNH** ---
  // Thêm logic để xử lý nguồn ảnh
  const imageSource = (typeof currentSong.imageUrl === 'string')
    ? { uri: currentSong.imageUrl } // Nếu là link string
    : currentSong.imageUrl;         // Nếu là local require
  // --- **KẾT THÚC SỬA LỖI** ---


  // --- Event Handlers (Favorite, Sleep Timer) ---
  const songIsFavorited = currentSong ? isFavorite(currentSong.id) : false;

  const handleToggleFavorite = () => {
    if (!currentSong) return;
    if (songIsFavorited) {
      removeFavorite(currentSong.id);
    } else {
      addFavorite(currentSong);
    }
  };

  const showSleepTimerOptions = () => {
    Alert.alert(
      "Hẹn giờ tắt nhạc",
      sleepTimerId ? `Đang hẹn giờ. Bạn muốn tắt?` : "Chọn thời gian hẹn giờ:",
      sleepTimerId 
      ? [
          { text: "Hủy", style: "cancel" },
          { text: "Tắt hẹn giờ", onPress: clearSleepTimer, style: "destructive" },
        ]
      : [
          { text: "15 phút", onPress: () => setSleepTimer(15 * 60 * 1000) },
          { text: "30 phút", onPress: () => setSleepTimer(30 * 60 * 1000) },
          { text: "1 giờ", onPress: () => setSleepTimer(60 * 60 * 1000) },
          { text: "Hủy", style: "cancel" },
        ]
    );
  };

  // --- Xử lý sự kiện Slider (FR-2.3) ---
  const onSeekStart = () => {
    setIsSeeking(true);
  };

  const onSeekChange = (value) => {
    // Cập nhật vị trí slider ngay lập tức khi kéo
    setSliderPosition(value);
  };

  const onSeekComplete = (value) => {
    // Chỉ gọi seekTo khi thả tay
    seekTo(value);
    setIsSeeking(false);
  };
  // --- Kết thúc FR-2.3 ---


  // Hàm handleScrollToIndexFailed
  const handleScrollToIndexFailed = (info) => {
    console.warn('Scroll to index failed:', info);
    setTimeout(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
                index: info.index,
                animated: false,
                viewPosition: 0.5,
                viewOffset: -SCREEN_HEIGHT * 0.1
            });
        }
    }, 100);
  };


  // --- List Header Component ---
  const renderListHeader = () => (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
         <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}><Ionicons name="chevron-down" size={28} color="white" /></Pressable>
         <View style={{ flex: 1 }} />
         <Pressable onPress={showSleepTimerOptions} style={styles.iconButton}><Ionicons name="moon-outline" size={24} color={sleepTimerId ? "#1DB954" : "white"} /></Pressable>
      </View>
      
      {/* **SỬA ẢNH** */}
      <Image 
        source={imageSource} // <-- Dùng biến imageSource đã xử lý
        style={styles.image} 
        defaultSource={require('../assets/images/default-album-art.png')} 
      />
      
      {/* Info Container */}
      <View style={styles.infoContainer}>
         <Pressable onPress={() => setIsModalVisible(true)} style={styles.iconButton}><Ionicons name="add-circle-outline" size={28} color={"gray"} /></Pressable>
         <View style={styles.infoText}><Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text><Text style={styles.artist} numberOfLines={1}>{currentSong.artist}</Text></View>
         <Pressable onPress={handleToggleFavorite} style={styles.iconButton}><Ionicons name={songIsFavorited ? "heart" : "heart-outline"} size={28} color={songIsFavorited ? "#1DB954" : "gray"} /></Pressable>
      </View>

      {/* Progress Slider (FR-2.3) */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={durationMillis || 1}
          value={sliderPosition} // <-- Luôn dùng sliderPosition để hiển thị
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#535353"
          thumbTintColor="#FFFFFF"
          onSlidingStart={onSeekStart} // <-- Bắt đầu kéo
          onValueChange={onSeekChange} // <-- Đang kéo
          onSlidingComplete={onSeekComplete} // <-- Thả tay (hoàn tất tua)
          disabled={durationMillis === 0 || isLoading} 
        />
        <View style={styles.timeContainer}>
            {/* Hiển thị thời gian dựa trên sliderPosition khi đang kéo, ngược lại dùng positionMillis */}
            <Text style={styles.timeText}>{formatTime(isSeeking ? sliderPosition : positionMillis)}</Text>
            <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
         <Pressable onPress={toggleShuffle} style={styles.iconButton}><Ionicons name="shuffle" size={28} color={isShuffle ? "#1DB954" : "gray"} /></Pressable>
         <Pressable onPress={playPrevious} style={styles.iconButton}><Ionicons name="play-skip-back" size={32} color="white" /></Pressable>
         <Pressable onPress={handlePlayPause} style={styles.playButton}>
            {isLoading ? (
                <ActivityIndicator size={70} color="#FFFFFF" />
            ) : (
                <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={70} color="white" />
            )}
         </Pressable>
         <Pressable onPress={playNext} style={styles.iconButton}><Ionicons name="play-skip-forward" size={32} color="white" /></Pressable>
         <Pressable onPress={toggleRepeatMode} style={styles.iconButton}><MaterialIcons name={repeatMode === 'one' ? 'repeat-one' : 'repeat'} size={28} color={repeatMode !== 'off' ? "#1DB954" : "gray"} /></Pressable>
      </View>
    </View>
  );

  // --- Main Render (FlatList - Lyrics) ---
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        ref={flatListRef}
        style={styles.container}
        data={lyricsLines}
        ListHeaderComponent={renderListHeader}
        renderItem={({ item, index }) => {
          const isActive = (index === currentLineIndex);
          return ( <Text style={[ styles.line, isActive ? styles.activeLine : styles.inactiveLine ]}>{item.text}</Text> );
        }}
        keyExtractor={(item, index) => `${item.time}-${index}`}
        ListFooterComponent={<View style={{ height: SCREEN_HEIGHT * 0.3 }} />}
        ListEmptyComponent={() => {
          if (!isLoading && currentSong) { return <Text style={styles.line}>Không có lời bài hát cho bài này.</Text>; }
          return null;
        }}
        scrollEnabled={!isSeeking}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        removeClippedSubviews={true}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={11}
        getItemLayout={(data, index) => ( {length: 50, offset: 50 * index, index} )}
      />

      {/* Modal */}
      <AddToPlaylistModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} currentSongId={currentSong ? currentSong.id : null} />
    </SafeAreaView>
  );
}


// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { alignItems: 'center', paddingHorizontal: 20 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, width: '100%' },
  image: { width: '100%', aspectRatio: 1, borderRadius: 8, marginBottom: 20, backgroundColor: '#333' },
  infoContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 10 },
  infoText: { flex: 1, marginHorizontal: 10 },
  iconButton: { padding: 10, justifyContent: 'center', alignItems: 'center' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  artist: { color: 'gray', fontSize: 18, marginTop: 5, textAlign: 'center' },
  progressContainer: { width: '100%', marginTop: 20 },
  slider: { width: '100%', height: 40 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 5 },
  timeText: { color: 'gray', fontSize: 12 },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 40, paddingHorizontal: 20, marginBottom: 30 },
  playButton: { justifyContent: 'center', alignItems: 'center', width: 70, height: 70 },
  line: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', paddingVertical: 15, marginHorizontal: 20, height: 50 },
  inactiveLine: { color: 'gray', opacity: 0.7 },
  activeLine: { color: 'white', opacity: 1, transform: [{ scale: 1.05 }] },
});