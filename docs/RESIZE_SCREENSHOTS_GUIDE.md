# 调整截图尺寸指南

本指南提供多种方法将 screenshot-03.png、screenshot-04.png、screenshot-05.png 调整为 640x400 尺寸。

## 🎯 目标

将以下文件调整为 640x400 尺寸：

- `images/screenshot-03.png` → `images/screenshot-03-640x400.png`
- `images/screenshot-04.png` → `images/screenshot-04-640x400.png`
- `images/screenshot-05.png` → `images/screenshot-05-640x400.png`

---

## 方法一：使用 Node.js 脚本（推荐）

### 步骤 1：安装 sharp 库

```bash
npm install --save-dev sharp
```

### 步骤 2：运行调整脚本

```bash
node scripts/resize-screenshots.js
```

### 步骤 3：验证结果

检查 `images/` 目录，应该生成了 3 个新文件：

- `screenshot-03-640x400.png`
- `screenshot-04-640x400.png`
- `screenshot-05-640x400.png`

---

## 方法二：使用在线工具（最简单）

### 推荐工具 1：ILoveIMG

**网址**：https://www.iloveimg.com/resize-image

**步骤**：

1. 访问网站
2. 点击"选择图片"
3. 上传 screenshot-03.png、screenshot-04.png、screenshot-05.png
4. 选择"按像素调整大小"
5. 输入：宽度 640，高度 400
6. 点击"调整图片大小"
7. 下载调整后的图片
8. 重命名为：
   - `screenshot-03-640x400.png`
   - `screenshot-04-640x400.png`
   - `screenshot-05-640x400.png`
9. 保存到 `images/` 目录

### 推荐工具 2：Squoosh

**网址**：https://squoosh.app/

**步骤**：

1. 访问网站
2. 拖拽图片到页面
3. 在右侧"Resize"部分：
   - Width: 640
   - Height: 400
   - Method: Browser's high quality
4. 点击下载
5. 重命名并保存到 `images/` 目录

### 推荐工具 3：Photopea（在线 Photoshop）

**网址**：https://www.photopea.com/

**步骤**：

1. 访问网站
2. 点击"文件" → "打开"
3. 选择 screenshot-03.png
4. 点击"图像" → "图像大小"
5. 取消勾选"约束比例"
6. 输入：宽度 640，高度 400
7. 点击"确定"
8. 点击"文件" → "导出为" → "PNG"
9. 保存为 `screenshot-03-640x400.png`
10. 重复步骤 3-9 处理其他图片

---

## 方法三：使用 Windows 画图

### 步骤：

1. 右键点击 `screenshot-03.png`
2. 选择"编辑"（会在画图中打开）
3. 点击"调整大小"
4. 取消勾选"保持纵横比"
5. 选择"像素"
6. 输入：
   - 水平：640
   - 垂直：400
7. 点击"确定"
8. 点击"文件" → "另存为" → "PNG 图片"
9. 保存为 `screenshot-03-640x400.png`
10. 重复步骤 1-9 处理其他图片

---

## 方法四：使用 PowerShell + ImageMagick

### 前提条件：

安装 ImageMagick：https://imagemagick.org/script/download.php

### 步骤：

```powershell
# 进入 images 目录
cd images

# 调整 screenshot-03.png
magick convert screenshot-03.png -resize 640x400! screenshot-03-640x400.png

# 调整 screenshot-04.png
magick convert screenshot-04.png -resize 640x400! screenshot-04-640x400.png

# 调整 screenshot-05.png
magick convert screenshot-05.png -resize 640x400! screenshot-05-640x400.png

# 返回项目根目录
cd ..
```

**注意**：`!` 表示强制调整到指定尺寸，忽略纵横比。

---

## 方法五：使用 Python 脚本

### 前提条件：

安装 Python 和 Pillow 库：

```bash
pip install Pillow
```

### 创建脚本：

创建 `scripts/resize-screenshots.py`：

```python
from PIL import Image
import os

# 图片目录
images_dir = os.path.join(os.path.dirname(__file__), '..', 'images')

# 要处理的文件
files = [
    'screenshot-03.png',
    'screenshot-04.png',
    'screenshot-05.png'
]

# 目标尺寸
target_size = (640, 400)

for filename in files:
    input_path = os.path.join(images_dir, filename)

    if not os.path.exists(input_path):
        print(f'⚠️  跳过: {filename} (文件不存在)')
        continue

    # 打开图片
    img = Image.open(input_path)

    # 调整尺寸
    img_resized = img.resize(target_size, Image.Resampling.LANCZOS)

    # 生成输出文件名
    base_name = os.path.splitext(filename)[0]
    output_filename = f'{base_name}-640x400.png'
    output_path = os.path.join(images_dir, output_filename)

    # 保存
    img_resized.save(output_path, 'PNG')
    print(f'✅ 已调整: {output_filename}')

print('\n✨ 完成！')
```

### 运行脚本：

```bash
python scripts/resize-screenshots.py
```

---

## 方法六：使用 Figma（最专业）

### 步骤：

1. 访问 https://www.figma.com/
2. 创建新文件
3. 按 `F` 创建 Frame
4. 设置尺寸：W: 640, H: 400
5. 拖拽 screenshot-03.png 到 Frame 中
6. 调整图片大小以填充 Frame
7. 选中 Frame
8. 点击右侧"Export"
9. 格式选择 PNG
10. 点击"Export Frame"
11. 保存为 `screenshot-03-640x400.png`
12. 重复步骤 3-11 处理其他图片

---

## ✅ 验证结果

调整完成后，验证文件：

### 检查文件是否存在：

```bash
# Windows PowerShell
dir images\screenshot-*-640x400.png

# 应该看到：
# screenshot-03-640x400.png
# screenshot-04-640x400.png
# screenshot-05-640x400.png
```

### 检查文件尺寸：

1. 右键点击图片
2. 选择"属性"
3. 切换到"详细信息"标签
4. 查看"尺寸"应该是 640 x 400

---

## 📋 快速命令参考

### 使用 Node.js 脚本：

```bash
npm install --save-dev sharp
node scripts/resize-screenshots.js
```

### 使用 Python 脚本：

```bash
pip install Pillow
python scripts/resize-screenshots.py
```

### 使用 ImageMagick：

```bash
cd images
magick convert screenshot-03.png -resize 640x400! screenshot-03-640x400.png
magick convert screenshot-04.png -resize 640x400! screenshot-04-640x400.png
magick convert screenshot-05.png -resize 640x400! screenshot-05-640x400.png
cd ..
```

---

## 💡 推荐方案

根据你的情况选择：

| 方案                 | 适用场景               | 难度          |
| -------------------- | ---------------------- | ------------- |
| 在线工具（ILoveIMG） | 快速处理，无需安装     | ⭐ 最简单     |
| Windows 画图         | Windows 用户，无需安装 | ⭐⭐ 简单     |
| Node.js 脚本         | 开发者，批量处理       | ⭐⭐⭐ 中等   |
| Figma                | 需要精细控制           | ⭐⭐⭐ 中等   |
| ImageMagick          | 命令行爱好者           | ⭐⭐⭐⭐ 较难 |

**我的推荐**：使用在线工具 ILoveIMG，最快最简单！

---

## 🎯 完成后

调整完成后，你应该在 `images/` 目录下有以下文件：

```
images/
├── screenshot-01-1280x800.png
├── screenshot-01-640x400.png
├── screenshot-02-en-1280x800.png
├── screenshot-02-en-640x400.png
├── screenshot-03.png
├── screenshot-03-640x400.png  ← 新生成
├── screenshot-04.png
├── screenshot-04-640x400.png  ← 新生成
├── screenshot-05.png
└── screenshot-05-640x400.png  ← 新生成
```

现在你可以将这些 640x400 的截图上传到 Chrome Web Store 了！

---

**祝你顺利！** 🎉
