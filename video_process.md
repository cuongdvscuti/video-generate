# Scuti AI motion graphics intro

## Nguồn yêu cầu
Tài liệu gốc được định nghĩa trong [spec.md](spec.md): tạo một video motion graphics giới thiệu Scuti AI, lấy cảm hứng từ phong cách motion graphics code-driven hiện đại, thời lượng tối thiểu 10 giây, đồng thời ghi rõ quy trình tạo, công cụ và cách áp dụng vào công việc thực tế.

## Quy trình tạo video

### 1. Ý tưởng và phong cách
Tôi chọn hướng đi theo phong cách motion graphics hiện đại với:
- nền tối neon, ánh sáng xanh-violet
- các lớp glassmorphism / HUD panel
- vòng quay AI orb ở trung tâm
- text lớn, động lực lớn nhưng tối giản
- chuyển động chậm nhưng rõ ràng, phù hợp truyền tải thương hiệu AI

### 2. Công cụ sử dụng
- Playwright + Chrome headless: render các frame từ HTML/CSS animation
- Node.js: tạo file animation và chụp frame liên tục
- ffmpeg-static: ghép frame thành MP4

### 3. Prompt / mô tả sáng tạo
Mô tả dùng để tạo bộ khung thiết kế trong code:

> Create a premium dark neon motion graphics intro for Scuti AI. The scene should feel futuristic and intelligent, with layered HUD panels, glowing AI core orb, subtle grid background, blue-violet cinematic lighting, and strong centered typography. It should feel high-end and corporate, like a launch film for an AI platform. Use a 12-second runtime, smooth acceleration, glass material, and polished transitions.

### 4. Quy trình render thực tế
1. Viết HTML/CSS với các animation keyframes.
2. Dùng Playwright để mở trang đầu màn hình 1920x1080.
3. Chụp liên tục 360 frame ở 30 fps trong 12 giây.
4. Dùng ffmpeg-static ghép các frame thành file MP4.
5. Kiểm tra thời lượng và kích thước đầu ra.

## Kết quả đầu ra
File video cuối cùng:
- [scuti_ai_intro.mp4](scuti_ai_intro.mp4)

## Quan điểm cá nhân
Tôi thấy motion graphics kiểu này rất hiệu quả vì nó không chỉ làm đẹp thương hiệu mà còn làm rõ giá trị của sản phẩm trong vài giây. Với một startup hoặc dự án AI, video kiểu này giúp truyền tải cảm giác “sáng tạo, hiện đại, chuyên nghiệp” ngay từ lần xem đầu tiên. Nó khác với slide thông thường vì video có thể tiết lộ logic, niềm tin và sự mạnh mẽ của nền tảng trong cùng một nhịp điệu thị giác.

## Cách áp dụng vào công việc hằng ngày
Tôi có thể áp dụng kỹ thuật này vào các khía cạnh sau:
- Client proposals: sản phẩm demo ngắn, thay vì gửi đề xuất dài, tôi có thể dùng cảnh nền motion graphics để nêu giải pháp rõ hơn.
- Internal projects: quay intro cho product launch, sprint demo, roadmap update hoặc pitch nội bộ.
- Daily tasks: dùng các layout theo kiểu cinematic để làm slide team update, dashboard overview hoặc dashboard review.
- Marketing assets: tạo phiên bản ngắn cho landing page, LinkedIn, demo reel và campaign teaser.

Nói ngắn gọn, tôi thấy cách làm motion graphics này không chỉ là “thiết kế video”, mà là một phương pháp truyền đạt ý tưởng nhanh, rõ và có cảm giác chuyên nghiệp hơn so với cách trình bày truyền thống.
