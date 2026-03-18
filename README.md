# 🚀 DevHub — GitHub & Vercel Manager

Quản lý GitHub repos và Vercel deployments từ một nơi. Deploy với 1 click!

## Cài đặt & Chạy

```bash
npm install
npm run dev
```

Mở: http://localhost:5173

## Setup lần đầu

1. Tạo **GitHub Personal Access Token**:
   - https://github.com/settings/tokens/new
   - Scopes cần: `repo`, `read:user`

2. Tạo **Vercel Access Token**:
   - https://vercel.com/account/tokens

3. Mở DevHub → click **"Setup Tokens"** → nhập vào.

## Tính năng

### 🚀 1-Click Deploy
- Auto-detect GitHub repos đã link với Vercel projects (theo tên)
- Nhấn **"1-Click Deploy"** → tạo commit trigger trên GitHub → Vercel tự deploy
- Nút **VSCode** → mở/clone repo trong VSCode

### 📁 GitHub Repos
- Xem tất cả repos với metadata (language, stars, forks, branches)
- Click repo → xem commits gần nhất
- Push deploy trigger trực tiếp

### ⚡ Vercel Projects
- Xem tất cả projects + trạng thái deployment hiện tại
- Xem deployment history từng project
- Mở website + redirect đến Vercel dashboard

## VSCode Integration

Nút **"VSCode Clone"** dùng deep link `vscode://` để:
- Mở VSCode và clone repo về máy local
- Hoạt động ngay không cần extension thêm

### Workflow đề xuất:
1. Mở project từ DevHub → VSCode
2. Code và sửa như bình thường
3. Khi muốn deploy → quay lại DevHub → **1-Click Deploy**

## Build production

```bash
npm run build
```

Output ở `dist/` — có thể deploy lên bất kỳ static host nào.
