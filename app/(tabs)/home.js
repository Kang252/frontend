// frontend/app/(tabs)/home.js
import React from 'react';
// 1. XÓA SafeAreaView khỏi 'react-native'
import { Text, StyleSheet, FlatList } from 'react-native';
// 2. IMPORT TỪ ĐÂY
import { SafeAreaView } from 'react-native-safe-area-context';
import SongItem from '../../src/components/SongItem';
import { getMockSongs } from '../../src/data/songs';

export default function HomeScreen() {
  const songs = getMockSongs(); 

  return (
    // 3. SafeAreaView này giờ đã an toàn
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Chào buổi sáng</Text>
      
      <FlatList
        data={songs}
        renderItem={({ item, index }) => (
          <SongItem 
            track={item} 
            index={index}
          />
        )}
        keyExtractor={(item) => item.id}
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
    paddingTop: 40, // Giữ lại padding top này
  },
});