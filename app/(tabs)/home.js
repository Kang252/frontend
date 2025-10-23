// frontend/app/(tabs)/home.js
import React from 'react'; // Bỏ useState, useEffect nếu không dùng nữa
import { Text, StyleSheet, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SongItem from '../../src/components/SongItem';
// Import lại getMockSongs
import { getMockSongs } from '../../src/data/songs';
// Bỏ import AudioContext nếu không dùng trực tiếp ở đây
// import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';

export default function HomeScreen() {
  // Lấy dữ liệu tĩnh
  const songs = getMockSongs();
  // const [loading, setLoading] = useState(false); // Bỏ loading state
  // const { setCurrentPlaybackList } = useAudioPlayer(); // Bỏ nếu AudioContext không cần set list từ đây

  // Bỏ useEffect gọi API

  return (
    <SafeAreaView style={styles.container}>
      {/* Đặt lại tiêu đề ví dụ */}
      <Text style={styles.header}>Danh sách nhạc</Text>

      <FlatList
        data={songs}
        renderItem={({ item, index }) => ( // Thêm lại index
          <SongItem
            track={item}
            index={index} // <-- Truyền lại index
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
             <View style={styles.centerContent}>
                  <Text style={styles.emptyText}>Không có bài hát nào.</Text>
             </View>
        )}
      />
    </SafeAreaView>
  );
}

// Giữ lại style cơ bản
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centerContent: {
    flex: 1, // Để căn giữa khi danh sách rỗng
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingTop: 40,
  },
  emptyText: {
    color: 'gray',
    fontSize: 16,
    marginTop: 50,
  }
});