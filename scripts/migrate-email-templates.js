/**
 * Firestore 邮件模板迁移脚本
 * 
 * 用途：将 Firestore 中已存在的单语言邮件模板迁移为多语言格式
 * 
 * 使用方法：
 * 1. 确保已安装 Firebase Admin SDK: npm install firebase-admin
 * 2. 下载 Firebase 服务账号密钥（JSON 文件）
 * 3. 设置环境变量: set GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
 * 4. 运行脚本: node scripts/migrate-email-templates.js
 */

const admin = require('firebase-admin');

// 初始化 Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

// 默认的中文邮件模板
const defaultChineseTemplate = {
  subject: '⚠️ 重要通知：{{userName}} 已经 {{inactiveDays}} 天没有活跃',
  htmlBody: `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>重要通知</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 8px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #d32f2f;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .message {
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 15px;
      margin: 20px 0;
    }
    .details {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .details-item {
      margin: 8px 0;
      display: flex;
      justify-content: space-between;
    }
    .details-label {
      font-weight: bold;
      color: #666;
    }
    .details-value {
      color: #333;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 14px;
    }
    .note {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ 重要通知</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        您好，
      </div>
      
      <div class="message">
        <p>我们注意到 <strong>{{userName}}</strong> 已经 <strong>{{inactiveDays}}</strong> 天没有活跃了。</p>
        <p>根据预先设定的规则，系统判定可能需要您的关注。</p>
      </div>
      
      <div class="details">
        <div class="details-item">
          <span class="details-label">最后活跃时间：</span>
          <span class="details-value">{{lastActiveDate}}</span>
        </div>
        <div class="details-item">
          <span class="details-label">检测时间：</span>
          <span class="details-value">{{currentDate}}</span>
        </div>
        <div class="details-item">
          <span class="details-label">未活跃天数：</span>
          <span class="details-value">{{inactiveDays}} 天</span>
        </div>
        <div class="details-item">
          <span class="details-label">功德值：</span>
          <span class="details-value">{{merit}}</span>
        </div>
        <div class="details-item">
          <span class="details-label">生命值：</span>
          <span class="details-value">{{hp}}</span>
        </div>
      </div>
      
      <div class="note">
        <p><strong>💡 这是什么？</strong></p>
        <p>这是一封自动发送的关怀提醒邮件。如果一切正常，请忽略此邮件。如果您担心对方的安全，建议尽快联系确认。</p>
      </div>
    </div>
    
    <div class="footer">
      <p>此邮件由"还活着吗"扩展自动发送</p>
      <p>© 2025 还活着吗 | 关心每一个生命</p>
    </div>
  </div>
</body>
</html>
  `.trim(),
  textBody: `
⚠️ 重要通知

您好，

我们注意到 {{userName}} 已经 {{inactiveDays}} 天没有活跃了。
根据预先设定的规则，系统判定可能需要您的关注。

详细信息：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
最后活跃时间：{{lastActiveDate}}
检测时间：{{currentDate}}
未活跃天数：{{inactiveDays}} 天
功德值：{{merit}}
生命值：{{hp}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 这是什么？
这是一封自动发送的关怀提醒邮件。如果一切正常，请忽略此邮件。
如果您担心对方的安全，建议尽快联系确认。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
此邮件由"还活着吗"扩展自动发送
© 2025 还活着吗 | 关心每一个生命
  `.trim()
};

// 默认的英文邮件模板
const defaultEnglishTemplate = {
  subject: '⚠️ Important Notice: {{userName}} has been inactive for {{inactiveDays}} days',
  htmlBody: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Important Notice</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 8px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #d32f2f;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .message {
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 15px;
      margin: 20px 0;
    }
    .details {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .details-item {
      margin: 8px 0;
      display: flex;
      justify-content: space-between;
    }
    .details-label {
      font-weight: bold;
      color: #666;
    }
    .details-value {
      color: #333;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 14px;
    }
    .note {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Important Notice</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hello,
      </div>
      
      <div class="message">
        <p>We noticed that <strong>{{userName}}</strong> has been inactive for <strong>{{inactiveDays}}</strong> days.</p>
        <p>According to the preset rules, the system has determined that your attention may be needed.</p>
      </div>
      
      <div class="details">
        <div class="details-item">
          <span class="details-label">Last Active:</span>
          <span class="details-value">{{lastActiveDate}}</span>
        </div>
        <div class="details-item">
          <span class="details-label">Detection Time:</span>
          <span class="details-value">{{currentDate}}</span>
        </div>
        <div class="details-item">
          <span class="details-label">Inactive Days:</span>
          <span class="details-value">{{inactiveDays}} days</span>
        </div>
        <div class="details-item">
          <span class="details-label">Merit:</span>
          <span class="details-value">{{merit}}</span>
        </div>
        <div class="details-item">
          <span class="details-label">HP:</span>
          <span class="details-value">{{hp}}</span>
        </div>
      </div>
      
      <div class="note">
        <p><strong>💡 What is this?</strong></p>
        <p>This is an automatically sent care reminder email. If everything is fine, please ignore this email. If you're concerned about their safety, we recommend contacting them as soon as possible.</p>
      </div>
    </div>
    
    <div class="footer">
      <p>This email was automatically sent by "Are You Still Alive" extension</p>
      <p>© 2025 Are You Still Alive | Caring for Every Life</p>
    </div>
  </div>
</body>
</html>
  `.trim(),
  textBody: `
⚠️ Important Notice

Hello,

We noticed that {{userName}} has been inactive for {{inactiveDays}} days.
According to the preset rules, the system has determined that your attention may be needed.

Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Last Active: {{lastActiveDate}}
Detection Time: {{currentDate}}
Inactive Days: {{inactiveDays}} days
Merit: {{merit}}
HP: {{hp}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 What is this?
This is an automatically sent care reminder email. If everything is fine, please ignore this email.
If you're concerned about their safety, we recommend contacting them as soon as possible.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This email was automatically sent by "Are You Still Alive" extension
© 2025 Are You Still Alive | Caring for Every Life
  `.trim()
};

/**
 * 检查模板是否为旧的单语言格式
 */
function isOldFormat(emailTemplate) {
  // 如果有 subject 字段但没有 zh_CN 和 en 字段，说明是旧格式
  return emailTemplate && 
         emailTemplate.subject && 
         !emailTemplate.zh_CN && 
         !emailTemplate.en;
}

/**
 * 检查模板是否为新的多语言格式
 */
function isNewFormat(emailTemplate) {
  return emailTemplate && 
         emailTemplate.zh_CN && 
         emailTemplate.en;
}

/**
 * 将旧格式转换为新格式
 */
function convertToMultiLanguage(oldTemplate, language) {
  console.log(`  转换旧模板（语言: ${language}）...`);
  
  // 根据用户的语言设置，决定将旧模板放在哪个语言下
  if (language === 'zh_CN') {
    return {
      zh_CN: oldTemplate,
      en: defaultEnglishTemplate
    };
  } else {
    return {
      zh_CN: defaultChineseTemplate,
      en: oldTemplate
    };
  }
}

/**
 * 迁移单个用户的邮件模板
 */
async function migrateUserSettings(uid, data) {
  try {
    const { language, emailTemplate } = data;
    
    // 检查是否需要迁移
    if (!emailTemplate) {
      console.log(`  ⏭️  跳过：没有邮件模板`);
      return { status: 'skipped', reason: 'no_template' };
    }
    
    if (isNewFormat(emailTemplate)) {
      console.log(`  ✅ 跳过：已经是多语言格式`);
      return { status: 'skipped', reason: 'already_migrated' };
    }
    
    if (!isOldFormat(emailTemplate)) {
      console.log(`  ⚠️  跳过：模板格式无法识别`);
      return { status: 'skipped', reason: 'unknown_format' };
    }
    
    // 转换为多语言格式
    const multiLangTemplate = convertToMultiLanguage(emailTemplate, language || 'zh_CN');
    
    // 更新 Firestore
    await db.collection('userSettings').doc(uid).update({
      emailTemplate: multiLangTemplate,
      updatedAt: Date.now()
    });
    
    console.log(`  ✅ 迁移成功`);
    return { status: 'migrated' };
    
  } catch (error) {
    console.error(`  ❌ 迁移失败:`, error.message);
    return { status: 'error', error: error.message };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始迁移 Firestore 邮件模板...\n');
  
  try {
    // 获取所有 userSettings 文档
    const snapshot = await db.collection('userSettings').get();
    
    if (snapshot.empty) {
      console.log('❌ 没有找到任何 userSettings 文档');
      return;
    }
    
    console.log(`📊 找到 ${snapshot.size} 个用户配置\n`);
    
    const results = {
      total: snapshot.size,
      migrated: 0,
      skipped: 0,
      errors: 0
    };
    
    // 遍历所有文档
    for (const doc of snapshot.docs) {
      const uid = doc.id;
      const data = doc.data();
      
      console.log(`\n👤 处理用户: ${uid}`);
      console.log(`  语言: ${data.language || '未设置'}`);
      
      const result = await migrateUserSettings(uid, data);
      
      if (result.status === 'migrated') {
        results.migrated++;
      } else if (result.status === 'skipped') {
        results.skipped++;
      } else if (result.status === 'error') {
        results.errors++;
      }
    }
    
    // 输出统计结果
    console.log('\n' + '='.repeat(50));
    console.log('📈 迁移统计:');
    console.log(`  总数: ${results.total}`);
    console.log(`  ✅ 已迁移: ${results.migrated}`);
    console.log(`  ⏭️  已跳过: ${results.skipped}`);
    console.log(`  ❌ 失败: ${results.errors}`);
    console.log('='.repeat(50));
    
    if (results.migrated > 0) {
      console.log('\n✨ 迁移完成！');
    } else {
      console.log('\n💡 没有需要迁移的数据');
    }
    
  } catch (error) {
    console.error('\n❌ 迁移过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
main()
  .then(() => {
    console.log('\n👋 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 脚本执行失败:', error);
    process.exit(1);
  });
