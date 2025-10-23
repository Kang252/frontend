// frontend/src/data/songs.js (Dữ liệu mẫu tĩnh - Cần URL MP3 thật)

// LƯU Ý: URL nhạc dưới đây LÀ PLACEHOLDER (ngoại trừ bài đầu tiên).
// Bạn cần thay thế chúng bằng link MP3 trực tiếp, công khai và hoạt động được.

const MOCK_SONGS = [
  {
    id: '1',
    title: 'Bước Qua Nhau', // Hoặc bạn có thể đặt tên theo nhạc từ Tribe of Noise
    artist: 'Vũ.', // Hoặc tên nghệ sĩ từ Tribe of Noise
    imageUrl: 'https://avatar-ex-swe.nixcdn.com/song/2021/10/27/a/f/a/e/1635308967664_640.jpg',
    // --- SỬ DỤNG URL BẠN CUNG CẤP ---
    trackUrl: 'https://musopen.org/music/?composer=johann-sebastian-bach#',
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
[01:04.00]Chạy theo em ở khắp muôn nơi
[01:08.00]Tìm hoài sao chẳng thấy em tôi ơi
[01:11.00]Chạy theo những cơn mưa không lời
[01:15.00]Chỉ mình tôi tiếc nuối em tôi ơi
[01:18.00]Bước qua nhau làm tim đau
[01:22.00]Một lần sau cuối thôi em ơi
[01:25.00]Bước qua nhau làm tim đau
[01:29.00]Nhìn em xa mãi thôi
[01:47.00]Hôm nay mưa hay chính tôi đang bộn bề?
[01:50.00]Vài dòng thư cũ tôi xem rất vội
[01:54.00]Chỉ là tôi nhớ em thôi em ơi
[01:57.00]Chuyện tình mình tựa cơn mưa không lời
[02:00.00]Tôi vẫn thế, vẫn đợi em dẫu biết nay xa vời
[02:07.00]Vẫn đợi một điều gì đó đã qua lâu rồi
[02:14.00]Phải làm sao để quên người ơi?
[02:21.00]Chạy theo em ở khắp muôn nơi
[02:25.00]Tìm hoài sao chẳng thấy em tôi ơi
[02:29.00]Chạy theo những cơn mưa không lời
[02:32.00]Chỉ mình tôi tiếc nuối em tôi ơi
[02:36.00]Bước qua nhau làm tim đau
[02:39.00]Một lần sau cuối thôi em ơi
[02:43.00]Bước qua nhau làm tim đau
[02:46.00]Nhìn em xa mãi thôi
`
  },
  {
    id: '2',
    title: 'Tháng Mấy Em Nhớ Anh?',
    artist: 'Hà Anh Tuấn',
    imageUrl: 'https://avatar-ex-swe.nixcdn.com/song/2020/06/17/a/1/f/5/1592398695843_640.jpg',
    trackUrl: 'URL_MP3_HOAT_DONG_2', // <-- THAY THẾ URL NÀY
    lyrics: `
[00:10.00]Tháng mấy mưa rơi nhiều hơn?
[00:15.00]Ánh mắt anh trông chờ hơn
[00:20.00]Em có đang cách xa anh cả một bầu trời?
[00:24.00]Hay chỉ là đôi phút rong chơi
[00:28.00]Tháng mấy ai hay buồn hơn?
[00:33.00]Góc phố anh nghe cô đơn
[00:38.00]Em có đang nhớ đến anh khi gió đông về?
[00:43.00]Hay bận lòng với những đam mê
[00:47.00]Bao tháng ngày dài nơi đây mình anh với anh
[00:52.00]Em ở nơi đâu có biết anh còn thương nhớ em?
[00:57.00]Đêm cứ muộn phiền ru anh vào quên lãng
[01:01.00]Giấc mơ hôm qua giờ xa xôi như khói lam
[01:06.00]Tháng mấy em nhớ anh? Trời làm mưa mãi
[01:11.00]Để lá trên cây rụng rơi cuốn đi thương yêu ngày ấy
[01:16.00]Tháng mấy em nhớ anh? Cầu xin mưa lũ
[01:20.00]Mang hết yêu thương của em để nơi đây anh giữ lại
[01:25.00]Cho đến khi mưa tạnh, bình minh sáng soi
[01:30.00]Anh sẽ tin em ở bên với anh đến suốt cuộc đời
`
  },
  {
    id: '3',
    title: 'Nàng Thơ',
    artist: 'Hoàng Dũng',
    imageUrl: 'https://avatar-ex-swe.nixcdn.com/song/2020/06/07/0/c/f/d/1591522079149_640.jpg',
    trackUrl: 'URL_MP3_HOAT_DONG_3', // <-- THAY THẾ URL NÀY
    lyrics: `
[00:12.00]Em ngày em đánh rơi nụ cười vào anh
[00:18.00]Có nghĩ sau này em sẽ chờ
[00:23.00]Anh ngày anh đánh rơi nụ cười vào em
[00:29.00]Có nghĩ sau này anh sẽ tìm
[00:34.00]Tìm em trong những giấc mơ dịu dàng như là mây
[00:39.00]Tìm em trong những áng thơ tình đầu anh vụng tay
[00:44.00]Tìm em trong những sớm mai ngồi chờ sương nhẹ tan
[00:50.00]Giờ này em ở đâu?
[00:55.00]Hỡi nàng thơ của anh, xin em chớ buồn
[01:00.00]Đừng làm rơi khóe mi, lệ vương lên áo ai
[01:06.00]Hỡi tình yêu của anh, xin em hãy chờ
[01:11.00]Ngày mai anh sẽ đến, đến ôm em vào lòng
[01:17.00]Rồi thì thầm khe khẽ lời yêu em mãi thôi
`
  },
  {
    id: '4',
    title: 'See Tình',
    artist: 'Hoàng Thùy Linh',
    imageUrl: 'https://avatar-ex-swe.nixcdn.com/song/2022/02/20/d/4/a/a/1645353591456_640.jpg',
    trackUrl: 'URL_MP3_HOAT_DONG_4', // <-- THAY THẾ URL NÀY
    lyrics: `
[00:10.00]Uầy uầy uầy uầy
[00:12.00]Sao mới gặp lần đầu mà đầu mình quay quay?
[00:15.00]Anh ơi anh à?
[00:17.00]Anh có yêu bản thân mình không?
[00:19.00]Nếu có thì làm tình địch với em nha!
[00:22.00]Uầy uầy uầy uầy
[00:24.00]Sao mới gặp lần đầu mà đầu mình quay quay?
[00:26.00]Hay là mình cùng xây nhà và nuôi thêm mấy đứa trẻ nhà?
[00:30.00]Anh ơi anh à!
[00:31.00]Em hơi bị ngộ đó nhá!
[00:33.00]Giây phút em gặp anh là em biết em see tình
[00:38.00]Tình tình tình tình tang tang tính
[00:40.00]Giây phút em gặp anh là em biết em see tình
[00:45.00]Tình đừng tình tình tang tang tang
`
  },
  {
    id: '5',
    title: 'Có Em',
    artist: 'Madihu, Low G',
    imageUrl: 'https://avatar-ex-swe.nixcdn.com/song/2022/07/21/5/c/8/f/1658394435985_640.jpg',
    trackUrl: 'URL_MP3_HOAT_DONG_5', // <-- THAY THẾ URL NÀY
    lyrics: `
[00:08.00]Đừng nói chi, mình cùng say đắm baby
[00:11.00]Đừng thấy lạ nếu như mai sau thức giấc mình chung một nhà
[00:15.00]Đừng nghĩ suy, chuyện trò như tri kỷ baby
[00:18.00]Và thế là anh quên đi cô đơn khi hoàng hôn vừa tà
[00:22.00]Vì có em như là melody dịu dàng, nhẹ nhàng trên khuông nhạc
[00:26.00]Vì có em đi vào những giấc mơ ngọt ngào, ấm áp lạ thường
[00:30.00]Vì có em, làm con tim anh thêm xuyến xao bồi hồi
[00:33.00]Và có lẽ anh đã yêu mất rồi
[00:37.00]Đi bên anh thêm đoạn đường dài
[00:41.00]Gạt bỏ âu lo muộn phiền ngoài tai
[00:44.00]Trôi theo cảm xúc, mặc ngoài kia đúng sai
[00:48.00]Chỉ cần tay đan tay, tình yêu dẫn lối em ơi
`
  },
];

// Khôi phục lại hàm này để dùng dữ liệu tĩnh
export const getMockSongs = () => {
  return MOCK_SONGS;
};