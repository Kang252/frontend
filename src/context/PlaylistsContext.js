// frontend/src/context/PlaylistsContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Thư viện để tạo ID ngẫu nhiên
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export const PlaylistsContext = createContext();

const STORAGE_KEY = '@my_music_app_playlists';

export const PlaylistsProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);

  // 1. Tải Playlists (CẬP NHẬT LOGIC LỌC VÀ DỌN DẸP NÂNG CAO)
  useEffect(() => {
    async function loadPlaylists() {
      try {
        const storedPlaylists = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedPlaylists !== null) {
          let parsedPlaylists = JSON.parse(storedPlaylists);

          // --- PHẦN SỬA LỖI ---
          
          // 1. Đảm bảo dữ liệu tải lên LÀ MỘT MẢNG
          if (!Array.isArray(parsedPlaylists)) {
            parsedPlaylists = []; // Nếu hỏng, reset về mảng rỗng
          }

          // 2. Lọc (filter) ra bất kỳ mục nào là null hoặc không có ID
          const cleanedPlaylists = parsedPlaylists
            .filter(playlist => playlist !== null && playlist && playlist.id) 
            .map(playlist => ({ // 3. Ánh xạ (map) phần còn lại
              ...playlist,
              songIDs: playlist.songIDs || [], // Đảm bảo songIDs là mảng
            }));
          // --- KẾT THÚC SỬA LỖI ---

          setPlaylists(cleanedPlaylists);
          console.log('Đã tải và dọn dẹp Playlists từ AsyncStorage');
        }
      } catch (error) {
        console.error('Lỗi khi tải Playlists:', error);
      }
    }
    loadPlaylists();
  }, []);

  // 2. Hàm trợ giúp để lưu thay đổi
  const savePlaylists = async (newPlaylists) => {
    try {
      const jsonValue = JSON.stringify(newPlaylists);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      setPlaylists(newPlaylists);
    } catch (error) {
      console.error('Lỗi khi lưu Playlists:', error);
    }
  };

  // 3. (FR-3.2) Tạo Playlist
  const createPlaylist = (name) => {
    if (!name || name.trim() === '') {
      alert('Vui lòng nhập tên cho playlist');
      return;
    }
    const newPlaylist = {
      id: uuidv4(),
      name: name.trim(),
      songIDs: [],
    };
    
    const newPlaylists = [...playlists, newPlaylist];
    savePlaylists(newPlaylists);
  };

  // 4. (FR-3.3) Thêm bài hát
  const addSongToPlaylist = (playlistId, songId) => {
    const newPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        const currentSongIDs = playlist.songIDs || [];
        if (!currentSongIDs.includes(songId)) {
          return {
            ...playlist,
            songIDs: [...currentSongIDs, songId],
          };
        }
      }
      return playlist;
    });
    savePlaylists(newPlaylists);
  };

  // 5. (FR-3.3) Xóa bài hát
  const removeSongFromPlaylist = (playlistId, songId) => {
    const newPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        const currentSongIDs = playlist.songIDs || [];
        return {
          ...playlist,
          songIDs: currentSongIDs.filter(id => id !== songId),
        };
      }
      return playlist;
    });
    savePlaylists(newPlaylists);
  };
  
  // 6. (Bonus) Xóa toàn bộ playlist
  const deletePlaylist = (playlistId) => {
    const newPlaylists = playlists.filter(p => p.id !== playlistId);
    savePlaylists(newPlaylists);
  };

  // 7. Cung cấp giá trị (Value)
  const value = {
    playlists,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
  };

  return (
    <PlaylistsContext.Provider value={value}>
      {children}
    </PlaylistsContext.Provider>
  );
};

// 8. Hook tiện ích
export const usePlaylists = () => {
  const context = useContext(PlaylistsContext);
  if (context === undefined) {
    throw new Error('usePlaylists phải được dùng bên trong PlaylistsProvider');
  }
  return context;
};