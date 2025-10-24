// frontend/src/components/SongItem.js
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, ActivityIndicator } from 'react-native'; // Thêm ActivityIndicator
import { useRouter } from 'expo-router';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Ionicons } from '@expo/vector-icons';
// 1. Import hook và trạng thái Download
import { useDownloads } from '../context/DownloadContext'; // Đảm bảo đường dẫn đúng

// Truy cập hằng số trạng thái từ hook (nếu bạn export chúng từ context)
// Hoặc định nghĩa lại ở đây nếu cần:
const DOWNLOAD_STATUS = {
  NOT_DOWNLOADED: 'not_downloaded',
  DOWNLOADING: 'downloading',
  DOWNLOADED: 'downloaded',
  ERROR: 'error',
};


export default function SongItem({ track, index, onRemovePress }) {
  const router = useRouter();
  const { playTrack } = useAudioPlayer();
  // 2. Lấy thông tin và hàm từ DownloadContext
  const { startDownload, getDownloadStatus, cancelDownload, deleteDownload } = useDownloads();

  const handlePress = () => {
    if (!track || typeof index !== 'number' || index < 0) {
        console.error("SongItem: Dữ liệu track hoặc index không hợp lệ.", { track, index });
        return;
    }
    console.log(`Đã nhấn vào bài hát index: ${index}, Title: ${track.title}`);
    playTrack(index); // Gọi playTrack với index (phiên bản expo-av)
    router.push('/player');
  };

  // 3. Lấy trạng thái tải hiện tại của bài hát
  // Sử dụng optional chaining và cung cấp giá trị mặc định an toàn
  const downloadState = getDownloadStatus(track?.id) || { status: DOWNLOAD_STATUS.NOT_DOWNLOADED, progress: 0, localUri: null };

  // 4. Hàm xử lý nhấn nút tải/xóa/hủy
  const handleDownloadAction = (e) => {
    e.stopPropagation(); // Ngăn sự kiện nhấn vào cả dòng item
    if (!track || !track.id) { // Kiểm tra track và id
        console.error("handleDownloadAction: Track hoặc track.id không hợp lệ.");
        return;
    }


    switch (downloadState.status) {
      case DOWNLOAD_STATUS.NOT_DOWNLOADED:
      case DOWNLOAD_STATUS.ERROR: // Cho phép thử tải lại nếu lỗi
        console.log(`Bắt đầu tải: ${track.title}`);
        startDownload(track);
        break;
      case DOWNLOAD_STATUS.DOWNLOADING:
        // Tùy chọn: Hủy tải
        console.log(`Hủy tải: ${track.title}`);
        cancelDownload(track.id);
        break;
      case DOWNLOAD_STATUS.DOWNLOADED:
        // Tùy chọn: Xóa file đã tải
        console.log(`Xóa file đã tải: ${track.title}`);
        // Thêm Alert xác nhận trước khi xóa
        // Alert.alert("Xóa Tải về?", `Bạn có muốn xóa "${track.title}" khỏi thiết bị?`, [
        //     { text: "Hủy", style: "cancel" },
        //     { text: "Xóa", style: "destructive", onPress: () => deleteDownload(track.id) }
        // ]);
        deleteDownload(track.id); // Tạm thời xóa trực tiếp để test
        break;
      default:
        console.log("Trạng thái tải không xác định:", downloadState.status);
        break;
    }
  };

  // 5. Component hiển thị trạng thái tải (Icon hoặc Tiến trình)
  const renderDownloadStatus = () => {
    // Luôn render Pressable để bắt sự kiện, thay đổi Icon bên trong
    return (
      <Pressable style={styles.downloadButton} onPress={handleDownloadAction}>
        {downloadState.status === DOWNLOAD_STATUS.DOWNLOADING && (
          <ActivityIndicator size="small" color="#1DB954" />
        )}
        {downloadState.status === DOWNLOAD_STATUS.DOWNLOADED && (
          <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
        )}
         {downloadState.status === DOWNLOAD_STATUS.ERROR && (
           <Ionicons name="alert-circle-outline" size={24} color="orange" />
         )}
         {downloadState.status === DOWNLOAD_STATUS.NOT_DOWNLOADED && (
           <Ionicons name="download-outline" size={24} color="gray" />
         )}
      </Pressable>
    );
  };


  // Kiểm tra track trước khi render
  if (!track || !track.id) {
    console.warn("SongItem: Attempting to render with invalid track data.");
    return null;
  }

  return (
    // Bọc trong View để chứa nội dung và nút tải
    <View style={styles.outerContainer}>
        {/* Phần nội dung chính có thể nhấn để play */}
        <Pressable style={styles.mainContent} onPress={handlePress}>
          <Image
            source={{ uri: track.imageUrl }}
            style={styles.image}
            defaultSource={require('../../assets/images/default-album-art.png')}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>{track.title || 'Unknown Title'}</Text>
            <Text style={styles.artist} numberOfLines={1}>{track.artist || 'Unknown Artist'}</Text>
          </View>
          {/* Nút Xóa (nếu có từ playlist detail) */}
          {onRemovePress && (
            <Pressable
              style={styles.actionButton}
              onPress={(e) => { e.stopPropagation(); onRemovePress(); }}
            >
              <Ionicons name="remove-circle-outline" size={24} color="gray" />
            </Pressable>
          )}
        </Pressable>

        {/* 6. Hiển thị nút/trạng thái Tải về */}
        {renderDownloadStatus()}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
    outerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20, // Padding ngoài cùng
    },
    mainContent: { // Phần nhấn được để play
        flex: 1, // Chiếm không gian còn lại trừ nút tải
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    image: { width: 50, height: 50, borderRadius: 4, marginRight: 15, backgroundColor: '#333' },
    infoContainer: { flex: 1, marginRight: 10 }, // Margin để tách khỏi các nút bên phải
    title: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    artist: { color: 'gray', fontSize: 14 },
    actionButton: { // Style chung cho nút Xóa
        paddingHorizontal: 5, // Giảm padding ngang chút
        paddingVertical: 10,
    },
    downloadButton: { // Style cho nút/trạng thái tải
        paddingHorizontal: 10, // Padding ngang
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 44, // Đảm bảo vùng nhấn đủ rộng
        minHeight: 44,
    }
});