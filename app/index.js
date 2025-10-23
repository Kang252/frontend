// frontend/app/index.js
import { Redirect } from 'expo-router';

// Tự động chuyển hướng từ gốc (/) đến (/home)
export default function StartPage() {
  return <Redirect href="/home" />;
}
