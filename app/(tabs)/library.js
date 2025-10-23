// frontend/app/(tabs)/library.js
import React, { useMemo } from 'react';
import { 
  View, Text, StyleSheet, 
  FlatList, 
  Pressable, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../../src/context/FavoritesContext';
import { getMockSongs } from '../../src/data/songs';
import SongItem from '../../src/components/SongItem';
import { usePlaylists } from '../../src/context/PlaylistsContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LibraryScreen() {
  const { favoriteIDs } = useFavorites();
  const { playlists, createPlaylist } = usePlaylists();
  const allSongs = getMockSongs();
  const router = useRouter();

  const favoriteSongs = useMemo(() => {
    return allSongs.filter(song => favoriteIDs.has(song.id));
  }, [allSongs, favoriteIDs]);

  const handleCreatePlaylist = () => {
    Alert.prompt(
      "Tạo Playlist Mới", "Nhập tên cho playlist của bạn:",
      [{ text: "Hủy", style: "cancel" }, { text: "Tạo", onPress: (name) => createPlaylist(name) }],
      "plain-text"
    );
  };

  const openPlaylistDetails = (playlistId) => {
    if (!playlistId) return; // Kiểm tra an toàn
    router.push(`/playlist/${playlistId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Thư viện</Text>
        <Pressable onPress={handleCreatePlaylist} style={styles.iconButton}>
          <Ionicons name="add" size={30} color="#1DB954" />
        </Pressable>
      </View>
      
      <Text style={styles.subHeader}>Bài hát Yêu thích ({favoriteSongs.length})</Text>
      {favoriteSongs.length > 0 ? (
        <FlatList
          data={favoriteSongs}
          renderItem={({ item }) => (
            <SongItem
              track={item}
              index={allSongs.findIndex(song => song.id === item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          style={styles.listStyle} 
        />
      ) : (
        <Text style={styles.emptyText}>Chưa có bài hát yêu thích.</Text>
      )}

      <Text style={styles.subHeader}>Playlists ({playlists.length})</Text>
      {playlists.length > 0 ? (
        <FlatList
          data={playlists}
          renderItem={({ item }) => {
            // Nếu item bị null, không render gì cả
            if (!item) return null; 
            
            return (
              <Pressable 
                style={styles.playlistItem}
                onPress={() => openPlaylistDetails(item.id)}
              >
                <Ionicons name="musical-notes" size={24} color="gray" />
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>{item.name}</Text>
                  <Text style={styles.playlistCount}>{(item.songIDs || []).length} bài hát</Text>
                </View>
              </Pressable>
            );
          }}
          // SỬA LỖI: keyExtractor an toàn (safe)
          keyExtractor={(item, index) => item?.id || `playlist-fallback-${index}`}
          style={styles.listStyle}
        />
      ) : (
        <Text style={styles.emptyText}>Chưa có playlist nào.</Text>
      )}

    </SafeAreaView>
  );
}

// (Styles không đổi)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  iconButton: {
    padding: 5,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  listStyle: {
    maxHeight: '40%',
    flexGrow: 0,
  },
  emptyText: {
    color: 'gray',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  playlistInfo: {
    marginLeft: 15,
  },
  playlistName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playlistCount: {
    color: 'gray',
    fontSize: 14,
    marginTop: 3,
  },
});