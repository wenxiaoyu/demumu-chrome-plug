// 测试时间修改场景
// 在浏览器 Console 中执行

console.log('=== 时间修改测试脚本 ===\n');

// 辅助函数：检查数据
window.checkData = function() {
  chrome.storage.local.get('userData', (r) => {
    if (!r.userData) {
      console.log('❌ No data found');
      return;
    }
    
    const data = r.userData;
    console.log('\n📊 Current Data:');
    console.log('  todayKnocks:', data.todayKnocks);
    console.log('  totalKnocks:', data.totalKnocks);
    console.log('  hp:', data.hp);
    console.log('  merit:', data.merit);
    console.log('  consecutiveDays:', data.consecutiveDays);
    console.log('  lastKnockTime:', new Date(data.lastKnockTime).toISOString());
    console.log('  updatedAt:', new Date(data.updatedAt).toISOString());
    console.log('  System time:', new Date().toISOString());
    console.log('');
    
    // 检查是否是同一天
    const lastDate = new Date(data.lastKnockTime);
    const nowDate = new Date();
    const isSameDay = 
      lastDate.getFullYear() === nowDate.getFullYear() &&
      lastDate.getMonth() === nowDate.getMonth() &&
      lastDate.getDate() === nowDate.getDate();
    
    console.log('  Is same day?', isSameDay);
    
    if (!isSameDay) {
      console.log('  ⚠️ Different day detected!');
      console.log('  Expected: todayKnocks should be 0 after opening popup');
    }
  });
};

// 测试步骤
console.log('📝 Test Steps:\n');
console.log('1. Clear data and reload:');
console.log('   chrome.storage.local.clear(() => location.reload());\n');

console.log('2. Open popup and knock once\n');

console.log('3. Check current data:');
console.log('   checkData();\n');

console.log('4. Change system time to tomorrow\n');

console.log('5. Close and reopen popup\n');

console.log('6. Check data again:');
console.log('   checkData();\n');

console.log('7. Expected results:');
console.log('   - todayKnocks: 0 (reset)');
console.log('   - totalKnocks: 1 (unchanged)');
console.log('   - hp: 90 (penalty applied)');
console.log('   - Console should show: "[useKnock] Day changed, reset todayKnocks to 0"\n');

console.log('💡 Quick commands:');
console.log('   checkData() - Check current data');
console.log('   chrome.storage.local.clear(() => location.reload()) - Clear and reload');
