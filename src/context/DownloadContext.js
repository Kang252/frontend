
// frontend/src/context/DownloadContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa các trạng thái tải
const DOWNLOAD_STATUS = {
  NOT_DOWNLOADED: 'not_downloaded',
  DOWNLOADING: 'downloading',
  DOWNLOADED: 'downloaded',
  ERROR: 'error',
};

// Tạo Context
export const DownloadContext = createContext();

// Key để lưu trữ trong AsyncStorage
const STORAGE_KEY = '@my_music_app_downloads';

// Tạo Provider
export const DownloadProvider = ({ children }) => {
  // State lưu trữ thông tin tải: { songId: { status, localUri, progress } }
  const [downloadInfo, setDownloadInfo] = useState({});
  // State theo dõi các tiến trình tải đang diễn ra { songId: downloadResumable }
  const [activeDownloads, setActiveDownloads] = useState({});

  // 1. Tải thông tin download đã lưu từ AsyncStorage khi khởi động
  useEffect(() => {
    async function loadDownloads() {
      try {
        const storedDownloads = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedDownloads !== null) {
          const loadedInfo = JSON.parse(storedDownloads);
          // Đảm bảo progress không bị lưu là đang tải dở dang khi mở lại app
          Object.keys(loadedInfo).forEach(songId => {
              if (loadedInfo[songId]?.status === DOWNLOAD_STATUS.DOWNLOADING) {
                  loadedInfo[songId].status = DOWNLOAD_STATUS.NOT_DOWNLOADED;
                  loadedInfo[songId].progress = 0;
              }
          });
          setDownloadInfo(loadedInfo);
          console.log('Đã tải thông tin Download từ AsyncStorage');
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin Download:', error);
      }
    }
    loadDownloads();
  }, []);

  // 2. Hàm trợ giúp để lưu thay đổi vào AsyncStorage
  const saveDownloadInfo = async (newInfo) => {
    try {
      // Chỉ lưu status và localUri, không lưu progress
      const infoToSave = {};
      Object.keys(newInfo).forEach(songId => {
         if(newInfo[songId]?.status === DOWNLOAD_STATUS.DOWNLOADED && newInfo[songId]?.localUri) {
             infoToSave[songId] = {
                 status: DOWNLOAD_STATUS.DOWNLOADED,
                 localUri: newInfo[songId].localUri,
             };
         }
      });
      const jsonValue = JSON.stringify(infoToSave);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Lỗi khi lưu thông tin Download:', error);
    }
  };

  // 3. Hàm bắt đầu tải (FR-6.2)
  const startDownload = async (track) => {
    if (!track || !track.id || !track.trackUrl) {
      console.error('startDownload: Thiếu thông tin track.');
      return;
    }
    const songId = track.id;

    // Kiểm tra nếu đã tải hoặc đang tải
    if (downloadInfo[songId]?.status === DOWNLOAD_STATUS.DOWNLOADED || downloadInfo[songId]?.status === DOWNLOAD_STATUS.DOWNLOADING) {
      console.log(`Bài hát ${songId} đã/đang được tải.`);
      return;
    }

    // Tạo đường dẫn file cục bộ (ví dụ: trong thư mục documents)
    // Đảm bảo tên file hợp lệ (thay thế ký tự đặc biệt nếu cần)
    const filename = `${songId}_${track.title.replace(/[^a-zA-Z0-9.-]/g, '_')}.mp3`;
    const localUri = FileSystem.documentDirectory + filename;
    console.log(`Bắt đầu tải ${songId} về ${localUri}`);

    // Cập nhật trạng thái sang 'đang tải'
    setDownloadInfo(prev => ({
      ...prev,
      [songId]: { status: DOWNLOAD_STATUS.DOWNLOADING, progress: 0, localUri: null },
    }));

    // Tạo callback để cập nhật tiến trình
    const progressCallback = downloadProgress => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      setDownloadInfo(prev => ({
        ...prev,
        [songId]: { ...(prev[songId] || {}), status: DOWNLOAD_STATUS.DOWNLOADING, progress: progress },
      }));
    };

    // Tạo đối tượng tải
    const downloadResumable = FileSystem.createDownloadResumable(
      track.trackUrl,
      localUri,
      {}, // options (có thể dùng sau)
      progressCallback
    );

    // Lưu đối tượng tải vào state để có thể hủy nếu cần
    setActiveDownloads(prev => ({ ...prev, [songId]: downloadResumable }));

    try {
      // Bắt đầu tải
      const { uri: finalUri } = await downloadResumable.downloadAsync();
      console.log(`Tải thành công bài hát ${songId}, URI: ${finalUri}`);

      // Cập nhật state và lưu vào AsyncStorage khi tải xong
      const newInfo = {
          ...downloadInfo, // Lấy state hiện tại (có thể đã thay đổi)
          [songId]: { status: DOWNLOAD_STATUS.DOWNLOADED, localUri: finalUri, progress: 1 },
      };
      setDownloadInfo(newInfo);
      await saveDownloadInfo(newInfo); // Chỉ lưu khi thành công

    } catch (error) {
      console.error(`Lỗi khi tải bài hát ${songId}:`, error);
      // Cập nhật trạng thái lỗi
       setDownloadInfo(prev => ({
         ...prev,
         [songId]: { status: DOWNLOAD_STATUS.ERROR, progress: 0, localUri: null },
       }));
       // Có thể xóa file tạm nếu tải lỗi
       FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
    } finally {
       // Xóa khỏi danh sách tải đang hoạt động
       setActiveDownloads(prev => {
           const { [songId]: _, ...rest } = prev; // Xóa key songId
           return rest;
       });
    }
  };

  // 4. Hàm lấy trạng thái tải của một bài hát
  const getDownloadStatus = (songId) => {
    return downloadInfo[songId] || { status: DOWNLOAD_STATUS.NOT_DOWNLOADED, progress: 0, localUri: null };
  };

  // 5. (Bonus) Hủy tải
  const cancelDownload = async (songId) => {
      const downloadResumable = activeDownloads[songId];
      if (downloadResumable) {
          console.log(`Hủy tải bài hát ${songId}`);
          try {
              await downloadResumable.pauseAsync(); // Tạm dừng trước khi xóa
              // Xóa file tạm
              const tempUri = downloadResumable.fileUri;
              await FileSystem.deleteAsync(tempUri, { idempotent: true });
          } catch (error) {
              console.error(`Lỗi khi hủy tải ${songId}:`, error);
          } finally {
              // Cập nhật trạng thái và xóa khỏi active downloads
              setDownloadInfo(prev => ({
                ...prev,
                [songId]: { status: DOWNLOAD_STATUS.NOT_DOWNLOADED, progress: 0, localUri: null },
              }));
              setActiveDownloads(prev => {
                  const { [songId]: _, ...rest } = prev;
                  return rest;
              });
          }
      }
  };

   // 6. (Bonus) Xóa file đã tải
   const deleteDownload = async (songId) => {
       const info = downloadInfo[songId];
       if (info?.status === DOWNLOAD_STATUS.DOWNLOADED && info.localUri) {
           console.log(`Xóa file đã tải của bài hát ${songId}`);
           try {
               await FileSystem.deleteAsync(info.localUri, { idempotent: true });
               const newInfo = { ...downloadInfo };
               delete newInfo[songId]; // Xóa thông tin khỏi state
               setDownloadInfo(newInfo);
               await saveDownloadInfo(newInfo); // Cập nhật AsyncStorage
           } catch (error) {
               console.error(`Lỗi khi xóa file ${songId}:`, error);
                // Có thể cập nhật trạng thái lỗi thay vì xóa thông tin
               // setDownloadInfo(prev => ({...prev, [songId]: {...info, status: DOWNLOAD_STATUS.ERROR}}));
           }
       }
   };


  // Cung cấp state và hàm
  const value = {
    downloadInfo,
    startDownload,
    getDownloadStatus,
    cancelDownload, // Thêm hàm hủy
    deleteDownload, // Thêm hàm xóa
    DOWNLOAD_STATUS, // Xuất các hằng số trạng thái
  };

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  );
};

// Hook tiện ích
export const useDownloads = () => {
  const context = useContext(DownloadContext);
  if (context === undefined) {
    throw new Error('useDownloads phải được dùng bên trong DownloadProvider');
  }
  return context;
};