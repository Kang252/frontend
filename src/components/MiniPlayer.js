// frontend/src/components/MiniPlayer.js
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MiniPlayer() {
  const router = useRouter();
  
  // Lấy toàn bộ dữ liệu từ "bộ não"
  const {
    currentSong,
    isPlaying,
    handlePlayPause,
    positionMillis,
    durationMillis,
  } = useAudioPlayer();

  // 1. Nếu không có bài hát nào đang phát, không hiển thị gì cả
  if (!currentSong) {
    return null;
  }

  // 2. Tính toán % tiến trình (cho thanh progress)
  const getProgress = () => {
    if (!durationMillis || durationMillis === 0) return 0;
    return (positionMillis / durationMillis) * 100;
  };

  // 3. Hàm xử lý nhấn vào Play/Pause (ngăn router.push)
  const onPlayPausePress = (e) => {
    e.stopPropagation(); // Ngăn sự kiện nhấn của cha (mở PlayerScreen)
    handlePlayPause();
  };

  // 4. Hàm xử lý nhấn vào MiniPlayer -> Mở màn hình Player đầy đủ
  const openPlayerScreen = () => {
    router.push('/player');
  };

  return (
    // 'Pressable' bao bọc toàn bộ MiniPlayer
    <Pressable style={styles.container} onPress={openPlayerScreen}>
      {/* 5. Thanh tiến trình (ProgressBar) mini */}
      <View style={styles.progressBarBackground}>
        <View 
          style={[styles.progressBarFill, { width: `${getProgress()}%` }]} 
        />
      </View>

      {/* 6. Nội dung (Ảnh, Chữ, Nút Play) */}
      <View style={styles.content}>
        <Image source={{ uri: currentSong.imageUrl }} style={styles.image} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        {/* 7. Nút Play/Pause */}
        <Pressable style={styles.iconButton} onPress={onPlayPausePress}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={28} 
            color="white" 
          />
        </Pressable>
        
        {/* (Nút Yêu thích mini - tùy chọn, có thể thêm sau) */}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a', // Màu nền (hơi xám)
    width: '100%',
    // Chúng ta không đặt 'bottom' ở đây, 
    // mà file layout (bước 3) sẽ đặt nó
  },
  // --- Thanh tiến trình ---
  progressBarBackground: {
    height: 3,
    backgroundColor: '#535353',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1DB954', // Màu xanh
  },
  // --- Nội dung ---
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    height: 60, // Chiều cao cố định cho MiniPlayer
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 4,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1, // Chiếm hết phần còn lại
    marginRight: 10,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artist: {
    color: 'gray',
    fontSize: 12,
  },
  iconButton: {
    padding: 5,
  },
});