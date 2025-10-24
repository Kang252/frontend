// frontend/app/_layout.js
import { Stack } from 'expo-router';
import { AudioProvider } from '../src/context/AudioContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { PlaylistsProvider } from '../src/context/PlaylistsContext';
import { DownloadProvider } from '../src/context/DownloadContext';

export default function RootLayout() {
  return (
    // 1. Đặt DownloadProvider ra ngoài cùng (hoặc ít nhất là bên ngoài AudioProvider)
    <DownloadProvider>
      <AudioProvider>
        <FavoritesProvider>
          <PlaylistsProvider>
            {/* 2. Các Provider khác và Stack nằm bên trong */}
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="player" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="playlist/[id]" options={{ headerShown: false }} />
            </Stack>
          </PlaylistsProvider>
        </FavoritesProvider>
      </AudioProvider>
    </DownloadProvider>
  );
}