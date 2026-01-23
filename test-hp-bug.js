// 测试 HP 累加 Bug
// 在浏览器 Console 中执行

console.log('=== HP Bug 测试 ===');

// 1. 设置初始数据
const now = Date.now();
const testData = {
  userId: 'test-user',
  lastKnockTime: now,
  todayKnocks: 1,
  totalKnocks: 1,
  merit: 6,
  consecutiveDays: 1,
  combo: 0,
  hp: 100,
  status: 'alive',
  createdAt: now,
  updatedAt: now,
};

chrome.storage.local.set({ userData: testData }, () => {
  console.log('✅ 初始数据已设置:', testData);
  console.log('📝 HP = 100');
  console.log('');
  console.log('🔍 测试步骤:');
  console.log('1. 关闭 Popup');
  console.log('2. 重新打开 Popup（不要敲击）');
  console.log('3. 再次关闭并打开 Popup');
  console.log('4. 重复几次');
  console.log('5. 检查 HP 是否超过 100');
  console.log('');
  console.log('💡 执行以下命令检查当前 HP:');
  console.log('chrome.storage.local.get("userData", (r) => console.log("HP:", r.userData.hp))');
});

// 2. 检查当前 HP 的函数
window.checkHP = function() {
  chrome.storage.local.get('userData', (result) => {
    const hp = result.userData?.hp;
    console.log('📊 当前 HP:', hp);
    if (hp > 100) {
      console.error('❌ BUG 确认: HP 超过 100!', hp);
    } else {
      console.log('✅ HP 正常');
    }
  });
};

console.log('');
console.log('💡 随时执行 checkHP() 来检查 HP');
