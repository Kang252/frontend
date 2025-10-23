// frontend/src/hooks/useAudioPlayer.js
import { useContext } from 'react';
import { AudioContext } from '../context/AudioContext';

export const useAudioPlayer = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer phải được dùng bên trong AudioProvider');
  }
  return context;
};