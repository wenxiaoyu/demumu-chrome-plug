/**
 * 调整单个图片尺寸脚本
 * 
 * 使用方法：
 * node scripts/resize-single-image.js <input-file> <width> <height>
 * 
 * 示例：
 * node scripts/resize-single-image.js images/screenshot-01.png 1280 800
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取命令行参数
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('❌ 用法: node scripts/resize-single-image.js <input-file> <width> <height>');
  console.error('');
  console.error('示例:');
  console.error('  node scripts/resize-single-image.js images/screenshot-01.png 1280 800');
  process.exit(1);
}

const inputFile = args[0];
const targetWidth = parseInt(args[1]);
const targetHeight = parseInt(args[2]);

if (isNaN(targetWidth) || isNaN(targetHeight)) {
  console.error('❌ 宽度和高度必须是数字');
  process.exit(1);
}

async function resizeImage() {
  try {
    console.log(`🖼️  调整图片尺寸...`);
    console.log(`   输入: ${inputFile}`);
    console.log(`   目标尺寸: ${targetWidth}x${targetHeight}`);
    
    // 读取原始图片信息
    const metadata = await sharp(inputFile).metadata();
    console.log(`   原始尺寸: ${metadata.width}x${metadata.height}`);
    
    // 生成输出文件名
    const ext = path.extname(inputFile);
    const baseName = path.basename(inputFile, ext);
    const dirName = path.dirname(inputFile);
    const outputFile = path.join(dirName, `${baseName}-resized${ext}`);
    
    // 调整尺寸
    await sharp(inputFile)
      .resize(targetWidth, targetHeight, {
        fit: 'contain', // 保持宽高比，不裁剪
        background: { r: 255, g: 255, b: 255, alpha: 1 } // 白色背景
      })
      .png()
      .toFile(outputFile);
    
    // 验证输出文件
    const outputMetadata = await sharp(outputFile).metadata();
    console.log(`   输出尺寸: ${outputMetadata.width}x${outputMetadata.height}`);
    console.log(`   输出文件: ${outputFile}`);
    console.log('');
    console.log('✅ 完成！');
    
  } catch (error) {
    console.error('❌ 调整失败:', error.message);
    process.exit(1);
  }
}

resizeImage();
