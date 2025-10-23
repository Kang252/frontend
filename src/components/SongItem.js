// frontend/src/components/SongItem.js
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
// 1. Import Icon
import { Ionicons } from '@expo/vector-icons';

// 2. Nhận prop 'onRemovePress' mới
export default function SongItem({ track, index, onRemovePress }) {
  const router = useRouter();
  const { playTrack } = useAudioPlayer();

  const handlePress = () => {
    // Không làm gì nếu người dùng nhấn vào nút Xóa
    // (Kiểm tra này giúp ngăn cả 2 sự kiện chạy cùng lúc,
    // nhưng trong trường hợp này, 'onPress' nằm trên 'Pressable' cha
    // nên chúng ta sẽ xử lý logic 'play' ở đây)
    
    // 3. Ra lệnh phát nhạc
    playTrack(index); 
    router.push('/player');
  };

  return (
    // 4. Bọc mọi thứ trong một View để 'onPress' không xung đột
    <Pressable style={styles.container} onPress={handlePress}>
      {/* Ảnh bìa */}
      <Image source={{ uri: track.imageUrl }} style={styles.image} />
      
      {/* Thông tin (Tên, Ca sĩ) */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{track.title}</Text>
        <Text style={styles.artist}>{track.artist}</Text>
      </View>

      {/* 5. Nút Xóa (CHỈ hiển thị nếu có 'onRemovePress') */}
      {onRemovePress && (
        <Pressable 
          style={styles.removeButton} 
          onPress={(e) => {
            // Ngăn sự kiện 'handlePress' của cha bị kích hoạt
            e.stopPropagation(); 
            onRemovePress(); // Chỉ gọi hàm xóa
          }}
        >
          <Ionicons name="remove-circle-outline" size={24} color="gray" />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1, // Để chữ chiếm hết không gian
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    color: 'gray',
    fontSize: 14,
  },
  // 6. Style cho nút Xóa
  removeButton: {
    padding: 10, // Tăng vùng nhấn
    marginLeft: 10, // Khoảng cách với chữ
  },
});