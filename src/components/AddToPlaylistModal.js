// frontend/src/components/AddToPlaylistModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlaylists } from '../context/PlaylistsContext';
import { Ionicons } from '@expo/vector-icons';

export default function AddToPlaylistModal({ isVisible, onClose, currentSongId }) {
  
  const { playlists, addSongToPlaylist } = usePlaylists();

  const handleSelectPlaylist = (playlist) => {
    if (!currentSongId) {
      Alert.alert('Lỗi', 'Không tìm thấy bài hát hiện tại');
      return;
    }
    
    // Kiểm tra an toàn phòng trường hợp item là null (mặc dù context đã lọc)
    if (!playlist || !playlist.id) return; 

    addSongToPlaylist(playlist.id, currentSongId);
    Alert.alert('Thành công', `Đã thêm vào playlist "${playlist.name}"`);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Thêm vào Playlist</Text>
          
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={30} color="gray" />
          </Pressable>

          <FlatList
            data={playlists}
            // SỬA LỖI: keyExtractor an toàn (safe)
            keyExtractor={(item, index) => item?.id || `playlist-fallback-${index}`}
            renderItem={({ item }) => {
              // Nếu item bị null (do lỗi nào đó), không render gì cả
              if (!item) return null; 
              
              return (
                <Pressable 
                  style={styles.playlistItem} 
                  onPress={() => handleSelectPlaylist(item)}
                >
                  <Ionicons name="musical-notes-outline" size={24} color="gray" />
                  <View style={styles.playlistInfo}>
                    <Text style={styles.playlistName}>{item.name}</Text>
                    <Text style={styles.playlistCount}>{(item.songIDs || []).length} bài hát</Text>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Bạn chưa tạo playlist nào.</Text>
            }
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// (Styles không đổi)
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#212121',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    paddingTop: 20,
  },
  modalHeader: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  playlistInfo: { marginLeft: 15 },
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
  emptyText: {
    color: 'gray',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});