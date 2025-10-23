// frontend/src/context/FavoritesContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Tạo Context
export const FavoritesContext = createContext();

// 2. Tạo Provider
export const FavoritesProvider = ({ children }) => {
  const STORAGE_KEY = '@my_music_app_favorites'; // Khóa để lưu trữ
  const [favoriteIDs, setFavoriteIDs] = useState(new Set()); // Dùng Set để tránh trùng lặp

  // --- Logic chính ---

  // 1. Tải danh sách yêu thích từ AsyncStorage khi ứng dụng khởi động
  useEffect(() => {
    async function loadFavorites() {
      try {
        const storedFavorites = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedFavorites !== null) {
          // Chuyển chuỗi JSON đã lưu thành mảng, rồi thành Set
          setFavoriteIDs(new Set(JSON.parse(storedFavorites)));
          console.log('Đã tải danh sách Yêu thích từ AsyncStorage');
        }
      } catch (error) {
        console.error('Lỗi khi tải Yêu thích:', error);
      }
    }
    loadFavorites();
  }, []);

  // 2. Hàm trợ giúp để lưu thay đổi vào AsyncStorage
  const saveFavorites = async (ids) => {
    try {
      // Chuyển Set thành mảng, rồi thành chuỗi JSON để lưu
      const jsonValue = JSON.stringify(Array.from(ids));
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Lỗi khi lưu Yêu thích:', error);
    }
  };

  // 3. (FR-3.1) Thêm một bài hát vào Yêu thích
  const addFavorite = (songId) => {
    const newFavoriteIDs = new Set(favoriteIDs); // Sao chép Set
    newFavoriteIDs.add(songId); // Thêm ID mới
    setFavoriteIDs(newFavoriteIDs); // Cập nhật state
    saveFavorites(newFavoriteIDs); // Lưu vào AsyncStorage
    console.log('Đã thêm Yêu thích:', songId);
  };

  // 4. (FR-3.1) Xóa một bài hát khỏi Yêu thích
  const removeFavorite = (songId) => {
    const newFavoriteIDs = new Set(favoriteIDs);
    newFavoriteIDs.delete(songId); // Xóa ID
    setFavoriteIDs(newFavoriteIDs);
    saveFavorites(newFavoriteIDs);
    console.log('Đã xóa Yêu thích:', songId);
  };

  // 5. Hàm kiểm tra xem một bài hát có đang được Yêu thích không
  const isFavorite = (songId) => {
    return favoriteIDs.has(songId);
  };

  // Cung cấp các hàm và state cho toàn ứng dụng
  const value = {
    favoriteIDs,
    addFavorite,
    removeFavorite,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// 6. Tạo Hook tiện ích
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites phải được dùng bên trong FavoritesProvider');
  }
  return context;
};