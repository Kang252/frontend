// frontend/src/data/songs.js

const MOCK_SONGS = [
  {
    id: '1',
    title: 'Bước Qua Nhau',
    artist: 'Vũ.',
    imageUrl: 'https://picsum.photos/seed/1/200',
    trackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    // 1. THÊM LỜI BÀI HÁT (GIẢ)
    lyrics: `
[00:03.00]SoundHelix Song 1
[00:05.00]This is a sample track.
[00:08.00]Để thực hiện FR-6.1
[00:11.00]Chúng ta cần hiển thị lời bài hát
[00:14.00]Đồng bộ với âm nhạc.
[00:18.00]Dòng này sẽ sáng lên ở giây 18
[00:22.00]Và dòng này ở giây 22.
[00:26.00]Chúng ta sẽ dùng FlatList...
[00:30.00]...để tự động cuộn.
[00:34.00]Cảm ơn bạn đã xem.
[00:38.00](Nhạc dạo)
[00:45.00]...
[00:50.00]Kết thúc.
`
  },
  {
    id: '2',
    title: 'Tháng Mấy Em Nhớ Anh?',
    artist: 'Hà Anh Tuấn',
    imageUrl: 'https://picsum.photos/seed/2/200',
    trackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    // 2. Lời cho bài hát 2
    lyrics: `
[00:02.00]Đây là bài hát số 2
[00:05.00]SoundHelix Song 2
[00:08.00]Lời bài hát ở đây
[00:12.00]...
`
  },
  {
    id: '3',
    title: 'Nàng Thơ',
    artist: 'Hoàng Dũng',
    imageUrl: 'https://picsum.photos/seed/3/200',
    trackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    lyrics: `[00:01.00]Không có lời bài hát cho bài này.`
  },
  {
    id: '4',
    title: 'See Tình',
    artist: 'Hoàng Thùy Linh',
    imageUrl: 'https://picsum.photos/seed/4/200',
    trackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    lyrics: `
[00:02.00]SoundHelix Song 4
[00:05.00]Demo Lyrics...
`
  },
  {
    id: '5',
    title: 'Có Em',
    artist: 'Madihu, Low G',
    imageUrl: 'https://picsum.photos/seed/5/200',
    trackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    lyrics: `
[00:02.00]SoundHelix Song 5
[00:05.00]Demo Lyrics...
`
  },
];

export const getMockSongs = () => {
  return MOCK_SONGS;
};