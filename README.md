# WordPress Tools

一键发布 Markdown 文章到 WordPress 的命令行工具

## ✨ 特性

- 🚀 一键发布 Markdown 文章到 WordPress
- 📝 支持 Markdown 格式自动转换为 HTML
- 🔐 使用 WordPress REST API 安全认证
- 📦 支持批量发布多篇文章
- ⚙️ 简单的环境变量配置

## 🛠️ 技术栈

- Node.js
- Axios - HTTP 客户端
- Marked - Markdown 解析器
- WordPress REST API
- dotenv - 环境变量管理

## 📦 安装

```bash
git clone https://github.com/erishen/wordpress-tools.git
cd wordpress-tools
npm install
```

## ⚙️ 配置

1. 创建 `.env` 文件：

```bash
WORDPRESS_URL="https://www.erishen.cn/wordpress/?rest_route=/wp/v2/posts"
WORDPRESS_USERNAME="your_username"
WORDPRESS_APP_PASSWORD="your_app_password"
```

2. 创建 `articles` 文件夹：

```bash
mkdir articles
```

3. 将需要发布的 Markdown 文章放入 `articles` 文件夹

## 🚀 使用方法

### 发布单篇文章

```bash
npm run write article.md
```

### 发布多篇文章

```bash
npm run write article1.md article2.md article3.md
```

### 发布所有文章

```bash
npm run write *.md
```

## 📝 文章格式

Markdown 文件示例：

```markdown
# 文章标题

这是文章内容...

## 小标题

- 列表项1
- 列表项2

\`\`\`javascript
console.log('代码块');
\`\`\`
```

## 🔐 获取 WordPress App Password

1. 登录 WordPress 后台
2. 进入 用户 > 个人资料
3. 滚动到 "应用程序密码" 部分
4. 输入应用名称（如 "WordPress Tools"）
5. 点击 "添加新应用程序密码"
6. 复制生成的密码到 `.env` 文件

## 📂 项目结构

```
wordpress-tools/
├── src/
│   └── writeArticle.js    # 核心发布逻辑
├── articles/               # 文章存放目录
├── .env                    # 环境变量配置
├── package.json
└── README.md
```

## 🎯 使用场景

- 📝 技术博客批量发布
- 📚 文档迁移到 WordPress
- 🔄 自动化内容发布流程
- 📊 内容管理自动化

## 🔗 相关链接

- [WordPress REST API 文档](https://developer.wordpress.org/rest-api/)
- [Marked 文档](https://marked.js.org/)
- [我的博客](https://www.erishen.cn)

## 📄 License

MIT

## 👤 Author

**Erishen Sun**

- Website: [www.erishen.cn](https://www.erishen.cn)
- GitHub: [@erishen](https://github.com/erishen)
- Email: leisun8309@gmail.com

## 🤝 Contributing

欢迎提交 Issue 和 Pull Request！

## ⭐ Star History

如果这个项目对你有帮助，请给个 Star ⭐️
