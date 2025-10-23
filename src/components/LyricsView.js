// frontend/src/components/LyricsView.js
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';

// 1. Hàm phân tích (parse) chuỗi LRC
const parseLRC = (lrcString) => {
  if (!lrcString) return [];
  
  const lines = lrcString.split('\n');
  const parsed = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/; // [mm:ss.SS]

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10); // Đảm bảo 3 chữ số
      
      const time = (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
      const text = line.replace(timeRegex, '').trim();
      
      if (text) {
        parsed.push({ time, text });
      }
    }
  }
  return parsed;
};

// Lấy chiều cao màn hình
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Component chính
export default function LyricsView({ lyricsString, currentTime }) {
  const flatListRef = useRef(null);
  
  // 2. Phân tích lời bài hát (chỉ 1 lần)
  const lyricsLines = useMemo(() => parseLRC(lyricsString), [lyricsString]);
  
  // 3. Tìm dòng hiện tại
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  useEffect(() => {
    if (lyricsLines.length === 0) return;

    // Tìm index của dòng cuối cùng mà 'currentTime' đã vượt qua
    let newIndex = -1;
    for (let i = lyricsLines.length - 1; i >= 0; i--) {
      if (currentTime >= lyricsLines[i].time) {
        newIndex = i;
        break;
      }
    }
    
    // Chỉ cập nhật state nếu index thay đổi
    if (newIndex !== currentLineIndex) {
      setCurrentLineIndex(newIndex);
    }

  }, [currentTime, lyricsLines, currentLineIndex]); // Chạy lại khi thời gian thay đổi

  // 4. Tự động cuộn FlatList
  useEffect(() => {
    if (flatListRef.current && currentLineIndex !== -1 && lyricsLines.length > 0) {
      flatListRef.current.scrollToIndex({
        index: currentLineIndex,
        animated: true,
        viewPosition: 0.5, // 0.5 = Căn giữa màn hình
        viewOffset: -SCREEN_HEIGHT * 0.1 // Điều chỉnh offset (10% chiều cao)
      });
    }
  }, [currentLineIndex, lyricsLines]); // Chạy lại khi dòng hiện tại thay đổi

  // 5. Nếu không có lời bài hát
  if (lyricsLines.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.line}>Không có lời bài hát cho bài này.</Text>
      </View>
    );
  }

  // 6. Render
  return (
    <FlatList
      ref={flatListRef}
      data={lyricsLines}
      keyExtractor={(item, index) => `${item.time}-${index}`}
      style={styles.container}
      // Thêm đệm ảo ở trên và dưới để dòng đầu tiên/cuối cùng
      // có thể cuộn ra giữa
      ListHeaderComponent={<View style={{ height: SCREEN_HEIGHT * 0.2 }} />}
      ListFooterComponent={<View style={{ height: SCREEN_HEIGHT * 0.3 }} />}
      renderItem={({ item, index }) => {
        const isActive = (index === currentLineIndex);
        return (
          <Text 
            style={[
              styles.line, // Style chung
              isActive ? styles.activeLine : styles.inactiveLine // Style riêng
            ]}
          >
            {item.text}
          </Text>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  line: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 15, // Khoảng cách giữa các dòng
  },
  inactiveLine: {
    color: 'gray',
    opacity: 0.7,
  },
  activeLine: {
    color: 'white', // Màu dòng hiện tại
    opacity: 1,
    transform: [{ scale: 1.05 }], // Phóng to nhẹ
  },
});