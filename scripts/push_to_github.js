// scripts/push_to_github.js - أداة رفع مشروع مقصف الفسحة إلى مستودع GitHub تلقائياً
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';

const token = process.argv[2] || process.env.GITHUB_TOKEN;
const repoUrl = 'https://github.com/motasemwshah4/smart-canteen.git';

if (!token) {
  console.log('------------------------------------------------------------');
  console.log('لم يتم العثور على رمز الوصول الشخصي (GitHub Personal Access Token).');
  console.log('يرجى تشغيل الأمر كالتالي:');
  console.log('node scripts/push_to_github.js <YOUR_GITHUB_TOKEN>');
  console.log('------------------------------------------------------------');
  process.exit(1);
}

async function run() {
  console.log(`🚀 جاري التحقق والرفع إلى المستودع: ${repoUrl}`);

  // التأكد من فرع main
  try {
    await git.branch({ fs, dir: '.', ref: 'main' });
  } catch (e) {}

  // إعداد Remote origin
  await git.addRemote({
    fs,
    dir: '.',
    remote: 'origin',
    url: repoUrl,
    force: true
  });

  console.log('⏳ جاري رفع الملفات إلى فرع main...');
  const pushResult = await git.push({
    fs,
    http,
    dir: '.',
    remote: 'origin',
    ref: 'main',
    onAuth: () => ({ username: token, password: '' })
  });

  console.log('🎉 تم رفع المشروع بنجاح 100% إلى GitHub!');
  console.log(`🔗 رابط المستودع: ${repoUrl}`);
}

run().catch((err) => {
  console.error('❌ خطأ أثناء الرفع إلى GitHub:', err.message);
  if (err.message.includes('401') || err.message.includes('Unauthorized')) {
    console.error('تنبيه: رمز المرور (Token) غير صالح أو تنقصه صلاحية repo.');
  }
  process.exit(1);
});
