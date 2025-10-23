// frontend/app/_layout.js
import { Stack } from 'expo-router';
import { AudioProvider } from '../src/context/AudioContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { PlaylistsProvider } from '../src/context/PlaylistsContext';
import { Audio } from 'expo-audio';
console.log("--- CHECKING AUDIO IMPORT IN LAYOUT ---", Audio);
export default function RootLayout() {
  return (
    <AudioProvider>
      <FavoritesProvider> 
        <PlaylistsProvider>
          <Stack>
            {/* Màn hình (Tabs) chính */}
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
            
            {/* Màn hình Player (Modal) */}
            <Stack.Screen
              name="player"
              options={{
                presentation: 'modal', 
                headerShown: false,
              }}
            />
            
            {/* 1. ĐĂNG KÝ MÀN HÌNH PLAYLIST MỚI */}
            <Stack.Screen
              name="playlist/[id]" // Tên file/đường dẫn
              options={{
                headerShown: false, // Chúng ta đã tự tạo header
              }}
            />
            
          </Stack>
        </PlaylistsProvider>
      </FavoritesProvider> 
    </AudioProvider>
  );
}