// frontend/app/(tabs)/_layout.js
import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

// 1. Import BottomTabBar từ thư viện vừa cài
import { BottomTabBar } from '@react-navigation/bottom-tabs';

// 2. Import MiniPlayer
import MiniPlayer from '../../src/components/MiniPlayer';

// 3. Component tùy chỉnh để hiển thị MiniPlayer + TabBar
const TabBarWithMiniPlayer = (props) => {
  return (
    <View style={{ backgroundColor: '#121212' }}>
      {/* MINI PLAYER SẼ HIỂN THỊ Ở TRÊN */}
      <MiniPlayer />
      
      {/* TAB BAR MẶC ĐỊNH HIỂN THỊ Ở DƯỚI */}
      <BottomTabBar {...props} />
    </View>
  );
};


export default function TabLayout() {
  return (
    // 4. Sử dụng prop 'tabBar' để chèn component tùy chỉnh
    <Tabs
      tabBar={(props) => <TabBarWithMiniPlayer {...props} />}
      
      screenOptions={{
        tabBarActiveTintColor: '#1DB954',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#191414',
          borderTopColor: '#191414',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Tìm kiếm',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Thư viện',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}