// 简单的 API 测试脚本
// 运行: node test-api.js

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 开始测试 API...\n');

  // 1. 健康检查
  console.log('1️⃣ 测试健康检查...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ 健康检查通过:', data);
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message);
    console.log('请确保后端服务器正在运行: npm run dev');
    process.exit(1);
  }

  // 2. 用户注册
  console.log('\n2️⃣ 测试用户注册...');
  const testUserId = `test_user_${Date.now()}`;
  let token = '';
  
  try {
    const response = await fetch(`${BASE_URL}/api/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        name: '测试用户',
        email: 'test@example.com',
      }),
    });
    const data = await response.json();
    token = data.token;
    console.log('✅ 用户注册成功:', {
      userId: data.user.userId,
      name: data.user.name,
      hasToken: !!token,
    });
  } catch (error) {
    console.error('❌ 用户注册失败:', error.message);
  }

  // 3. 创建对话
  console.log('\n3️⃣ 测试创建对话...');
  let conversationId = '';
  
  try {
    const response = await fetch(`${BASE_URL}/api/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: testUserId,
        title: '测试对话',
      }),
    });
    const data = await response.json();
    conversationId = data._id;
    console.log('✅ 对话创建成功:', {
      id: conversationId,
      title: data.title,
    });
  } catch (error) {
    console.error('❌ 创建对话失败:', error.message);
  }

  // 4. 添加消息
  console.log('\n4️⃣ 测试添加消息...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/conversation/${conversationId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: 'user',
        content: '你好！',
      }),
    });
    const data = await response.json();
    console.log('✅ 消息添加成功，消息数量:', data.messages.length);
  } catch (error) {
    console.error('❌ 添加消息失败:', error.message);
  }

  // 5. 创建记忆
  console.log('\n5️⃣ 测试创建记忆...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/memory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: testUserId,
        type: 'note',
        content: '这是一条测试记忆',
        metadata: {
          tags: ['测试'],
          importance: 3,
        },
      }),
    });
    const data = await response.json();
    console.log('✅ 记忆创建成功:', {
      id: data._id,
      type: data.type,
      content: data.content,
    });
  } catch (error) {
    console.error('❌ 创建记忆失败:', error.message);
  }

  // 6. 获取记忆列表
  console.log('\n6️⃣ 测试获取记忆列表...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/memory/${testUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('✅ 记忆列表获取成功，记忆数量:', data.memories.length);
  } catch (error) {
    console.error('❌ 获取记忆列表失败:', error.message);
  }

  // 7. AI 聊天测试（需要配置 API Key）
  console.log('\n7️⃣ 测试 AI 聊天（需要 OpenAI API Key）...');
  console.log('⚠️ 跳过 AI 测试（需要在 .env 中配置 DEFAULT_OPENAI_KEY）');

  console.log('\n✅ 所有基础 API 测试完成！');
  console.log('\n📝 后续步骤：');
  console.log('1. 在 .env 中配置 DEFAULT_OPENAI_KEY 或在前端设置中添加 API Key');
  console.log('2. 启动前端: npm run dev');
  console.log('3. 在浏览器中打开 http://localhost:5173');
}

testAPI().catch(console.error);

