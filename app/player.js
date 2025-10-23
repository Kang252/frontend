// frontend/app/player.js
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Alert, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import Slider from '@react-native-community/slider';
import { useAudioPlayer } from '../src/hooks/useAudioPlayer';
import { useFavorites } from '../src/context/FavoritesContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AddToPlaylistModal from '../src/components/AddToPlaylistModal';

// --- (Lyrics Parsing Logic - Unchanged) ---
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
// --- (End Lyrics Logic) ---


export default function PlayerScreen() {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Get isLoading from context
  const {
    currentSong, isPlaying, positionMillis, durationMillis,
    handlePlayPause, seekTo, playNext, playPrevious, formatTime,
    repeatMode, isShuffle, toggleRepeatMode, toggleShuffle,
    volume, setAudioVolume,
    sleepTimerId, setSleepTimer, clearSleepTimer,
    isLoading, // Get isLoading
  } = useAudioPlayer();

  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Slider States
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [localVolume, setLocalVolume] = useState(volume);
  const [isAdjustingVolume, setIsAdjustingVolume] = useState(false);

  useEffect(() => {
    if (!isAdjustingVolume) {
      setLocalVolume(volume);
    }
  }, [volume, isAdjustingVolume]);

  // Lyrics Logic
  const flatListRef = useRef(null);
  const lyricsLines = useMemo(() => {
    return parseLRC(currentSong?.lyrics);
  }, [currentSong?.lyrics]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  useEffect(() => {
    if (lyricsLines.length === 0) return;
    let newIndex = -1;
    for (let i = lyricsLines.length - 1; i >= 0; i--) {
      if (positionMillis >= lyricsLines[i].time) {
        newIndex = i;
        break;
      }
    }
    if (newIndex !== currentLineIndex) {
      setCurrentLineIndex(newIndex);
    }
  }, [positionMillis, lyricsLines, currentLineIndex]);

  useEffect(() => {
    if (flatListRef.current && currentLineIndex !== -1 && lyricsLines.length > 0 && !isSeeking && !isAdjustingVolume) {
      flatListRef.current.scrollToIndex({
        index: currentLineIndex,
        animated: true,
        viewPosition: 0.5,
        viewOffset: -SCREEN_HEIGHT * 0.1
      });
    }
  }, [currentLineIndex, lyricsLines, isSeeking, isAdjustingVolume]);

  // --- Render logic ---

  // Check for loading or no song
  if (isLoading || !currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
             <Ionicons name="chevron-down" size={28} color="white" />
          </Pressable>
        </View>
        <View style={[styles.content, styles.centerContent]}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#1DB954" />
          ) : (
            <Text style={styles.title}>Chưa chọn bài hát</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // --- Event Handlers ---
  const songIsFavorited = isFavorite(currentSong.id);
  const handleToggleFavorite = () => { if (songIsFavorited) removeFavorite(currentSong.id); else addFavorite(currentSong.id); };
  const showSleepTimerOptions = () => {
    Alert.alert(
      "Hẹn giờ tắt nhạc", "Tự động tắt nhạc sau:",
      [
        { text: "15 phút", onPress: () => setSleepTimer(15) },
        { text: "30 phút", onPress: () => setSleepTimer(30) },
        { text: "1 giờ", onPress: () => setSleepTimer(60) },
        sleepTimerId && { text: "Tắt hẹn giờ", onPress: clearSleepTimer, style: "destructive" },
        { text: "Hủy", style: "cancel" }
      ].filter(Boolean), // Filter out null/undefined options
      { cancelable: true }
    );
  };
  const onSeekStart = () => { setIsSeeking(true); };
  const onSeekChange = (value) => { setSeekPosition(value); };
  const onSeekComplete = (value) => { setIsSeeking(false); seekTo(value); };
  const onVolumeStart = () => { setIsAdjustingVolume(true); };
  const onVolumeChange = (value) => { setLocalVolume(value); };
  const onVolumeComplete = (value) => { setIsAdjustingVolume(false); setAudioVolume(value); };
  const handleScrollToIndexFailed = (info) => {
    console.warn(`Cannot scroll to index ${info.index}.`);
    const listRef = flatListRef.current;
    if (listRef) {
      const offset = info.averageItemLength * info.index;
      listRef.scrollToOffset({ offset, animated: true });
      setTimeout(() => {
        if (flatListRef.current) { // Check ref again
          flatListRef.current.scrollToIndex({
            index: info.index, animated: true, viewPosition: 0.5, viewOffset: -SCREEN_HEIGHT * 0.1
          });
        }
      }, 100);
    }
  };


  // --- List Header Component ---
  const renderListHeader = () => (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
           <Ionicons name="chevron-down" size={28} color="white" />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={showSleepTimerOptions} style={styles.iconButton}>
          <Ionicons name="moon-outline" size={24} color={sleepTimerId ? "#1DB954" : "white"} />
        </Pressable>
      </View>
      {/* Image */}
      <Image source={{ uri: currentSong.imageUrl }} style={styles.image} />
      {/* Info Container */}
      <View style={styles.infoContainer}>
         <Pressable onPress={() => setIsModalVisible(true)} style={styles.iconButton}><Ionicons name="add-circle-outline" size={28} color={"gray"} /></Pressable>
         <View style={styles.infoText}><Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text><Text style={styles.artist} numberOfLines={1}>{currentSong.artist}</Text></View>
         <Pressable onPress={handleToggleFavorite} style={styles.iconButton}><Ionicons name={songIsFavorited ? "heart" : "heart-outline"} size={28} color={songIsFavorited ? "#1DB954" : "gray"} /></Pressable>
      </View>
      {/* Progress Slider */}
      <View style={styles.progressContainer}>
        <Slider style={styles.slider} minimumValue={0} maximumValue={durationMillis || 1} value={isSeeking ? seekPosition : positionMillis} minimumTrackTintColor="#1DB954" maximumTrackTintColor="#535353" thumbTintColor="#FFFFFF" onSlidingStart={onSeekStart} onValueChange={onSeekChange} onSlidingComplete={onSeekComplete} disabled={durationMillis === 0} />
        <View style={styles.timeContainer}><Text style={styles.timeText}>{formatTime(isSeeking ? seekPosition : positionMillis)}</Text><Text style={styles.timeText}>{formatTime(durationMillis)}</Text></View>
      </View>
      {/* Controls */}
      <View style={styles.controlsContainer}>
         <Pressable onPress={toggleShuffle} style={styles.iconButton}><Ionicons name="shuffle" size={28} color={isShuffle ? "#1DB954" : "gray"} /></Pressable>
         <Pressable onPress={playPrevious} style={styles.iconButton}><Ionicons name="play-skip-back" size={32} color="white" /></Pressable>
         <Pressable onPress={handlePlayPause} style={styles.playButton}><Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={70} color="white" /></Pressable>
         <Pressable onPress={playNext} style={styles.iconButton}><Ionicons name="play-skip-forward" size={32} color="white" /></Pressable>
         <Pressable onPress={toggleRepeatMode} style={styles.iconButton}><MaterialIcons name={repeatMode === 'one' ? 'repeat-one' : 'repeat'} size={28} color={repeatMode !== 'off' ? "#1DB954" : "gray"} /></Pressable>
      </View>
      {/* Volume Slider */}
      <View style={styles.volumeContainer}>
        <Ionicons name="volume-mute" size={24} color="gray" />
        <Slider style={styles.volumeSlider} minimumValue={0} maximumValue={1} value={localVolume} minimumTrackTintColor="#1DB954" maximumTrackTintColor="#535353" thumbTintColor="#FFFFFF" onSlidingStart={onVolumeStart} onValueChange={onVolumeChange} onSlidingComplete={onVolumeComplete} />
        <Ionicons name="volume-high" size={24} color="gray" />
      </View>
    </View>
  );

  // --- Main Render (FlatList) ---
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        ref={flatListRef}
        style={styles.container}
        data={lyricsLines}
        ListHeaderComponent={renderListHeader}
        renderItem={({ item, index }) => {
          const isActive = (index === currentLineIndex);
          return (
            <Text
              style={[ styles.line, isActive ? styles.activeLine : styles.inactiveLine ]}
            >
              {item.text}
            </Text>
          );
        }}
        keyExtractor={(item, index) => `${item.time}-${index}`}
        ListFooterComponent={<View style={{ height: SCREEN_HEIGHT * 0.3 }} />}
        ListEmptyComponent={() => {
          // Only show "No lyrics" if a song is actually loaded
          if (!isLoading && currentSong) {
            return <Text style={styles.line}>Không có lời bài hát cho bài này.</Text>;
          }
          return null;
        }}
        scrollEnabled={!isSeeking && !isAdjustingVolume}
        onScrollToIndexFailed={handleScrollToIndexFailed}
      />

      {/* Modal */}
      <AddToPlaylistModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        currentSongId={currentSong ? currentSong.id : null}
      />
    </SafeAreaView>
  );
}


// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { alignItems: 'center', paddingHorizontal: 20 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' }, // Added for loading/no song
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, width: '100%' },
  image: { width: '100%', aspectRatio: 1, borderRadius: 8, marginBottom: 20 },
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
  playButton: { justifyContent: 'center', alignItems: 'center' },
  volumeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, marginTop: 10, marginBottom: 20 },
  volumeSlider: { flex: 1, height: 40, marginHorizontal: 10 },
  line: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', paddingVertical: 15, marginHorizontal: 20 },
  inactiveLine: { color: 'gray', opacity: 0.7 },
  activeLine: { color: 'white', opacity: 1, transform: [{ scale: 1.05 }] },
});