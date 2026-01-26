/**
 * 调整截图尺寸脚本
 * 
 * 将 images 目录下的截图调整为 640x400 尺寸
 * 
 * 使用方法：
 * node scripts/resize-screenshots.js
 */

const fs = require('fs');
const path = require('path');

// 检查是否安装了 sharp
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ 错误：未安装 sharp 库');
  console.log('\n请先安装 sharp：');
  console.log('  npm install --save-dev sharp');
  console.log('\n或者使用在线工具调整图片尺寸：');
  console.log('  https://www.iloveimg.com/resize-image');
  console.log('  https://squoosh.app/');
  process.exit(1);
}

const imagesDir = path.join(__dirname, '../images');

// 要处理的文件
const filesToResize = [
  'screenshot-03.png',
  'screenshot-04.png',
  'screenshot-05.png'
];

// 目标尺寸
const targetWidth = 640;
const targetHeight = 400;

async function resizeImage(inputFile, outputFile) {
  try {
    await sharp(inputFile)
      .resize(targetWidth, targetHeight, {
        fit: 'fill', // 强制调整到指定尺寸
        background: { r: 255, g: 255, b: 255, alpha: 1 } // 白色背景
      })
      .png()
      .toFile(outputFile);
    
    console.log(`✅ 已调整: ${path.basename(outputFile)}`);
  } catch (error) {
    console.error(`❌ 调整失败: ${path.basename(inputFile)}`);
    console.error(`   错误: ${error.message}`);
  }
}

async function main() {
  console.log('🖼️  开始调整截图尺寸...\n');
  console.log(`目标尺寸: ${targetWidth}x${targetHeight}\n`);

  for (const filename of filesToResize) {
    const inputPath = path.join(imagesDir, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  跳过: ${filename} (文件不存在)`);
      continue;
    }

    // 生成输出文件名
    const baseName = path.basename(filename, '.png');
    const outputFilename = `${baseName}-640x400.png`;
    const outputPath = path.join(imagesDir, outputFilename);

    // 调整尺寸
    await resizeImage(inputPath, outputPath);
  }

  console.log('\n✨ 完成！');
  console.log('\n生成的文件：');
  console.log('  - screenshot-03-640x400.png');
  console.log('  - screenshot-04-640x400.png');
  console.log('  - screenshot-05-640x400.png');
}

main().catch(error => {
  console.error('❌ 发生错误:', error);
  process.exit(1);
});
