// frontend/src/components/SongItem.js
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

export default function SongItem({ item, onPlayPress, queue }) {
    
    // Lấy state trực tiếp từ context để biết bài hát nào đang active
    const { isPlaying, currentSong } = useAudioPlayer();

    const handlePress = () => {
        // Gọi hàm onPlayPress được truyền từ cha (home.js, library.js, ...)
        if (onPlayPress) {
            onPlayPress(item, queue);
        }
    };

    const isActive = item.id === currentSong?.id;

    // --- SỬA LỖI ẢNH ---
    // Xử lý nguồn ảnh (giống như trong player.js)
    const imageSource = (typeof item.imageUrl === 'string')
        ? { uri: item.imageUrl } // Nếu là link string
        : item.imageUrl;         // Nếu là local require
    // --- KẾT THÚC SỬA LỖI ẢNH ---

    return (
        <Pressable onPress={handlePress} style={styles.container}>
            
            {/* Áp dụng imageSource đã sửa */}
            <Image 
                source={imageSource} 
                style={styles.image} 
                defaultSource={require('../../assets/images/default-album-art.png')}
            />
            
            <View style={styles.infoContainer}>
                <Text style={[styles.title, isActive && styles.activeText]} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={[styles.artist, isActive && styles.activeText]} numberOfLines={1}>
                    {item.artist}
                </Text>
            </View>
            
            {/* Hiển thị icon play/pause nếu bài này đang active */}
            {isActive && (
                <Ionicons 
                    name={isPlaying ? "pause-circle" : "play-circle"} 
                    size={24} 
                    color="#1DB954" 
                    style={styles.icon}
                />
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        width: '100%',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 10,
        backgroundColor: '#333',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
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
    activeText: {
        color: '#1DB954', // Màu xanh khi active
    },
    icon: {
        marginLeft: 10,
    },
});