// frontend/app/(tabs)/library.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../../src/context/FavoritesContext';
import { usePlaylists } from '../../src/context/PlaylistsContext';
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';
import SongItem from '../../src/components/SongItem';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// import MiniPlayer from '../../src/components/MiniPlayer'; // <-- KHÔNG CẦN IMPORT NỮA

export default function LibraryScreen() {
    const { favorites } = useFavorites();
    const { playlists } = usePlaylists();
    const { playSong } = useAudioPlayer();

    const favoriteList = favorites || [];
    const playlistList = playlists || [];

    const handlePlayFavorite = (track) => {
        playSong(track, favoriteList);
    };

    const renderHeader = () => (
        <View>
            <Text style={styles.header}>Thư viện</Text>
            
            <Link href="/playlist/favorites" asChild>
                <Pressable style={styles.menuItem}>
                    <Ionicons name="heart" size={28} color="#1DB954" />
                    <Text style={styles.menuText}>Bài hát đã thích</Text>
                    <Text style={styles.menuSubText}>{favoriteList.length} bài</Text>
                </Pressable>
            </Link>

            <Text style={styles.subHeader}>Playlists</Text>
            {playlistList.map(playlist => (
                <Link href={`/playlist/${playlist.id}`} key={playlist.id} asChild>
                    <Pressable style={styles.menuItem}>
                        <Ionicons name="list" size={28} color="#fff" />
                        <Text style={styles.menuText}>{playlist.name}</Text>
                        <Text style={styles.menuSubText}>{playlist.songs.length} bài</Text>
                    </Pressable>
                </Link>
            ))}

             <Text style={styles.subHeader}>Yêu thích gần đây</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={favoriteList.slice(0, 10)}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <SongItem
                        item={item}
                        onPlayPress={() => handlePlayFavorite(item)}
                        queue={favoriteList}
                    />
                )}
                keyExtractor={(item) => item.id}
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
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        padding: 15,
    },
    subHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        paddingHorizontal: 15,
        marginTop: 20,
        marginBottom: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    menuText: {
        color: 'white',
        fontSize: 18,
        marginLeft: 15,
    },
    menuSubText: {
        color: 'gray',
        fontSize: 16,
        marginLeft: 'auto',
    }
});