const { marked } = require('marked');
const axios = require('axios');
const fs = require('fs');

require('dotenv').config()

const { WORDPRESS_URL = '', WORDPRESS_USERNAME = '', WORDPRESS_APP_PASSWORD = '' } = process.env;

// 获取命令行参数中的 Markdown 文件名（默认为 example.md）
let markdownFileName = process.argv[2] || 'example.md';

if (WORDPRESS_URL && WORDPRESS_USERNAME && WORDPRESS_APP_PASSWORD) {
  // 获取当前日期并格式化为 YYYY-MM-DD
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
  const defaultTitle = `${formattedDate} 日记`;

  // 读取 Markdown 文件
  if (markdownFileName.indexOf('.md') === -1) {
    markdownFileName = markdownFileName + '.md'
  }

  const markdownContent = fs.readFileSync(markdownFileName, 'utf8');

  // 使用正则表达式提取第一个 h1 标题
  const titleMatch = markdownContent.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : defaultTitle;

  const content = titleMatch ? markdownContent.substring(titleMatch.index + titleMatch[1].length + 3) : markdownContent;

  // 将 Markdown 转换为 HTML
  const htmlContent = marked.parse(content);

  // 替换为你的 WordPress 网站的 URL
  const wordpressUrl = WORDPRESS_URL;

  // 替换为你的用户名和应用密码
  const username = WORDPRESS_USERNAME;
  const applicationPassword = WORDPRESS_APP_PASSWORD;

  // 要发布的文章内容
  const postData = {
    title,
    content: htmlContent,
    status: 'publish'
  };

  // 生成 Basic Auth 头
  const auth = Buffer.from(`${username}:${applicationPassword}`).toString('base64');

  // 发送请求发布文章
  axios.post(wordpressUrl, postData, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      console.log('文章发布成功!');
      console.log('文章ID:', response.data.id);
    })
    .catch(error => {
      console.log('文章发布失败');
      console.log('状态码:', error.response.status);
      console.log('响应内容:', error.response.data);
    });
} else {
  console.log('请设置 WORDPRESS_URL, WORDPRESS_USERNAME 和 WORDPRESS_APP_PASSWORD 环境变量');
}
