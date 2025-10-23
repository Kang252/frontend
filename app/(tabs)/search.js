// frontend/app/(tabs)/search.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  // 1. XÓA SafeAreaView
  TextInput,
  FlatList,
} from 'react-native';
// 2. IMPORT TỪ ĐÂY
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMockSongs } from '../../src/data/songs';
import SongItem from '../../src/components/SongItem';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const allSongs = getMockSongs();

  const filteredSongs = useMemo(() => {
    if (query.trim() === '') {
      return []; 
    }
    const lowerCaseQuery = query.toLowerCase();
    return allSongs.filter(song => 
      song.title.toLowerCase().includes(lowerCaseQuery) ||
      song.artist.toLowerCase().includes(lowerCaseQuery)
    );
  }, [query, allSongs]);

  return (
    // 3. SafeAreaView này giờ đã an toàn
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Tìm kiếm</Text>
      
      <View style={styles.searchBarContainer}>
        <Ionicons 
          name="search" 
          size={20} 
          color="gray" 
          style={styles.searchIcon} 
        />
        <TextInput
          style={styles.textInput}
          placeholder="Tìm kiếm bài hát hoặc ca sĩ..."
          placeholderTextColor="gray"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={filteredSongs}
        renderItem={({ item }) => (
          <SongItem
            track={item}
            index={allSongs.findIndex(song => song.id === item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {query.trim() === '' 
                ? 'Nhập để bắt đầu tìm kiếm.' 
                : `Không tìm thấy kết quả cho "${query}".`}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingTop: 40, // Giữ lại
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 40,
    color: 'white',
    fontSize: 16,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: 'gray',
    fontSize: 16,
  },
});