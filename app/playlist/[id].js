// frontend/app/playlist/[id].js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlaylists } from '../../src/context/PlaylistsContext';
import { getMockSongs } from '../../src/data/songs';
import SongItem from '../../src/components/SongItem';
import { Ionicons } from '@expo/vector-icons';

export default function PlaylistDetailScreen() {
  const router = useRouter(); 
  const { id: playlistId } = useLocalSearchParams(); // Đổi tên 'id' thành 'playlistId'

  // 1. Lấy hàm 'removeSongFromPlaylist' từ context
  const { playlists, removeSongFromPlaylist } = usePlaylists();
  const allSongs = getMockSongs();

  const currentPlaylist = useMemo(() => {
    return playlists.find(p => p.id === playlistId);
  }, [playlistId, playlists]);

  const playlistSongs = useMemo(() => {
    if (!currentPlaylist) return [];
    const songIDs = new Set(currentPlaylist.songIDs || []);
    return allSongs.filter(song => songIDs.has(song.id));
  }, [currentPlaylist, allSongs]);

  // 2. Hàm xử lý khi nhấn nút Xóa (FR-3.3)
  const handleRemoveSong = (songId, songTitle) => {
    Alert.alert(
      "Xóa bài hát",
      `Bạn có chắc muốn xóa "${songTitle}" khỏi playlist này?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: () => {
            // Gọi hàm từ context
            removeSongFromPlaylist(playlistId, songId);
          }
        }
      ]
    );
  };

  // (if (!currentPlaylist) ... giữ nguyên)
  if (!currentPlaylist) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Không tìm thấy playlist.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.header}>{currentPlaylist.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 3. Cập nhật FlatList */}
      <FlatList
        data={playlistSongs}
        renderItem={({ item }) => (
          <SongItem
            track={item}
            index={allSongs.findIndex(song => song.id === item.id)}
            
            // 4. Truyền hàm onRemovePress vào
            onRemovePress={() => handleRemoveSong(item.id, item.title)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Playlist này chưa có bài hát nào.</Text>
        }
      />
    </SafeAreaView>
  );
}

// (Styles... giữ nguyên)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    paddingTop: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    padding: 5,
  },
  emptyText: {
    color: 'gray',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});