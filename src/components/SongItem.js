// frontend/src/components/SongItem.js
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Ionicons } from '@expo/vector-icons';
// --- ĐẢM BẢO KHÔNG CÓ DÒNG NÀO IMPORT TỪ './SongItem' ---

// Prop 'index' dùng cho AudioContext (expo-av)
// Prop 'onRemovePress' dùng cho màn hình Playlist Detail
export default function SongItem({ track, index, onRemovePress }) {
  const router = useRouter();
  const { playTrack } = useAudioPlayer();

  const handlePress = () => {
    // Kiểm tra track và index hợp lệ
    if (!track || typeof index !== 'number' || index < 0) {
        console.error("SongItem: Dữ liệu track hoặc index không hợp lệ.", { track, index });
        return;
    }
    console.log(`Đã nhấn vào bài hát index: ${index}, Title: ${track.title}`);

    // Gọi playTrack với index (cho phiên bản expo-av)
    playTrack(index);

    router.push('/player');
  };

  // Kiểm tra track trước khi render để tránh lỗi null/undefined
  if (!track || !track.id) {
    console.warn("SongItem: Attempting to render with invalid track data.");
    return null; // Không render nếu track không hợp lệ
  }

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {/* Ảnh bìa */}
      <Image
        source={{ uri: track.imageUrl }}
        style={styles.image}
        // Cung cấp ảnh placeholder thực tế trong assets
        defaultSource={require('../../assets/images/default-album-art.png')} // Đảm bảo bạn có file này
      />
      {/* Thông tin */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{track.title || 'Unknown Title'}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist || 'Unknown Artist'}</Text>
      </View>
      {/* Nút Xóa */}
      {onRemovePress && (
        <Pressable
          style={styles.removeButton}
          onPress={(e) => {
            e.stopPropagation(); // Ngăn sự kiện onPress của cha
            onRemovePress();
          }}
        >
          <Ionicons name="remove-circle-outline" size={24} color="gray" />
        </Pressable>
      )}
    </Pressable>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  image: { width: 50, height: 50, borderRadius: 4, marginRight: 15, backgroundColor: '#333' }, // Màu nền tạm thời
  infoContainer: { flex: 1 },
  title: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  artist: { color: 'gray', fontSize: 14 },
  removeButton: { padding: 10, marginLeft: 10 },
});

// Nhớ tạo file ảnh placeholder tại: frontend/assets/images/default-album-art.png