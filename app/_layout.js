// frontend/app/_layout.js
import { Stack } from 'expo-router';
import { AudioProvider } from '../src/context/AudioContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { PlaylistsProvider } from '../src/context/PlaylistsContext';

// --- BỎ IMPORT VÀ LOG KIỂM TRA AUDIO ---
// import { Audio } from 'expo-av'; // Hoặc expo-audio
// console.log("--- CHECKING AUDIO IMPORT IN LAYOUT ---", Audio);
// --- KẾT THÚC BỎ ---

export default function RootLayout() {
  return (
    <AudioProvider>
      <FavoritesProvider>
        <PlaylistsProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="player" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="playlist/[id]" options={{ headerShown: false }} />
          </Stack>
        </PlaylistsProvider>
      </FavoritesProvider>
    </AudioProvider>
  );
}