// frontend/app/(tabs)/home.js
import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SongItem from '../../src/components/SongItem';
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';
import { getMockSongs } from '../../src/data/songs';
// import MiniPlayer from '../../src/components/MiniPlayer'; // <-- KHÔNG CẦN IMPORT NỮA
import { useFavorites } from '../../src/context/FavoritesContext';
import { usePlaylists } from '../../src/context/PlaylistsContext';

export default function HomeScreen() {
    
    const { playSong } = useAudioPlayer();
    const songs = getMockSongs();
    
    const { favorites } = useFavorites();
    const { playlists } = usePlaylists();

    const handlePlaySong = (track, queue) => {
        playSong(track, queue);
    };

    const favoriteList = favorites || [];
    const sections = [
        {
            title: 'Mới phát hành',
            data: songs.slice(0, 5), 
            horizontal: true,
            queue: songs,
        },
        {
            title: 'Bài hát yêu thích',
            data: favoriteList.slice(0, 5), 
            horizontal: true,
            queue: favoriteList,
        },
        {
            title: 'Tất cả bài hát',
            data: songs,
            horizontal: false,
            queue: songs,
        },
    ];

    const renderSongItem = ({ item, queue }) => (
        <SongItem 
            item={item}
            onPlayPress={() => handlePlaySong(item, queue)}
            queue={queue}
        />
    );

    const renderHorizontalList = ({ item, queue }) => (
        <View style={styles.horizontalItemContainer}>
            <SongItem 
                item={item}
                onPlayPress={() => handlePlaySong(item, queue)}
                queue={queue}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={sections}
                keyExtractor={(item, index) => item.title + index}
                renderItem={({ item }) => (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>{item.title}</Text>
                        {item.horizontal ? (
                            <FlatList
                                data={item.data}
                                renderItem={({ item: songItem }) => renderHorizontalList({ item: songItem, queue: item.queue })}
                                keyExtractor={(song) => song.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            />
                        ) : (
                            <FlatList
                                data={item.data}
                                renderItem={({ item: songItem }) => renderSongItem({ item: songItem, queue: item.queue })}
                                keyExtractor={(song) => song.id}
                            />
                        )}
                    </View>
                )}
                // Giữ lại ListFooterComponent để nội dung cuối không bị che
                ListFooterComponent={<View style={{ height: 60 }} />} 
            />
            {/* <MiniPlayer /> */} {/* <-- XÓA DÒNG NÀY */}
        </SafeAreaView>
    );
}

// (Giữ nguyên styles)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 10,
        marginBottom: 10,
    },
    horizontalItemContainer: {
        width: 150,
        marginHorizontal: 5,
    },
});