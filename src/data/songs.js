// frontend/src/data/songs.js (Sử dụng require cho file cục bộ)

// LƯU Ý: Đường dẫn require phải chính xác từ file AudioContext.js đến file MP3
// Nếu AudioContext.js nằm trong src/context/, đường dẫn sẽ là '../../assets/audio/...'

const MOCK_SONGS = [
  {
    id: '1',
    title: 'Bước Qua Nhau',
    artist: 'Vũ.',
    imageUrl: 'https://avatar-ex-swe.nixcdn.com/song/2021/10/27/a/f/a/e/1635308967664_640.jpg',
    // --- THAY ĐỔI: Đường dẫn cho require ---
    // Đường dẫn này là tương đối TỪ FILE AUDIO CONTEXT (src/context/AudioContext.js)
    trackUrl: require('../../assets/audio/BuocQuaNhau.mp3'), // <-- Sửa tên file nếu cần
    lyrics: `
[00:15.00]Hôm nay sao tôi thấy cô đơn lạ thường
[00:18.00]Từng dòng người vội đi trên phố đông
[00:22.00]Ai cũng có một người để nhớ mong
[00:25.00]Chờ đợi một người gọi đến cuối ngày
[00:29.00]Hôm nay sao tôi thấy không vui bằng người
[00:33.00]Chạy thật chậm dưới cơn mưa rất vội
[00:36.00]Chỉ là tôi nhớ em thôi em ơi
[00:39.00]Chuyện tình mình tựa cơn mưa không lời
[00:43.00]Tôi vẫn thế, vẫn đợi em dẫu biết nay xa vời
[00:50.00]Vẫn đợi một điều gì đó đã qua lâu rồi
[00:57.00]Phải làm sao để quên người ơi?
` // Giữ lại một phần lời
  },
  {
    id: '2',
    title: 'Tháng Mấy Em Nhớ Anh?',
    artist: 'Hà Anh Tuấn',
    imageUrl: 'https://avatar-ex-swe.nixcdn.com/song/2020/06/17/a/1/f/5/1592398695843_640.jpg',
    // --- THAY ĐỔI: Đường dẫn cho require ---
    trackUrl: require('../../assets/audio/ThangMayEmNhoAnh.mp3'), // <-- Sửa tên file nếu cần
    lyrics: `
[00:10.00]Tháng mấy mưa rơi nhiều hơn?
[00:15.00]Ánh mắt anh trông chờ hơn
[00:20.00]Em có đang cách xa anh cả một bầu trời?
[00:24.00]Hay chỉ là đôi phút rong chơi
[00:28.00]Tháng mấy ai hay buồn hơn?
[00:33.00]Góc phố anh nghe cô đơn
[00:38.00]Em có đang nhớ đến anh khi gió đông về?
[00:43.00]Hay bận lòng với những đam mê
` // Giữ lại một phần lời
  },
  {
    id: '3',
    title: 'Nàng Thơ',
    artist: 'Hoàng Dũng',
    imageUrl: 'https://avatar-ex-swe.nixcdn.com/song/2020/06/07/0/c/f/d/1591522079149_640.jpg',
    // --- THAY ĐỔI: Đường dẫn cho require ---
    trackUrl: require('../../assets/audio/NangTho.mp3'), // <-- Sửa tên file nếu cần
    lyrics: `
[00:12.00]Em ngày em đánh rơi nụ cười vào anh
[00:18.00]Có nghĩ sau này em sẽ chờ
[00:23.00]Anh ngày anh đánh rơi nụ cười vào em
[00:29.00]Có nghĩ sau này anh sẽ tìm
[00:34.00]Tìm em trong những giấc mơ dịu dàng như là mây
[00:39.00]Tìm em trong những áng thơ tình đầu anh vụng tay
[00:44.00]Tìm em trong những sớm mai ngồi chờ sương nhẹ tan
[00:50.00]Giờ này em ở đâu?
` // Giữ lại một phần lời
  },
  // Bạn có thể thêm các bài hát khác từ assets theo cách tương tự
];

// Hàm lấy dữ liệu tĩnh
export const getMockSongs = () => {
  return MOCK_SONGS;
};