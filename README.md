# ✨ 毛玻璃导航仪表盘

一个具有毛玻璃（Glassmorphism）风格的个人常用网站导航页。

## 特性

- 🪟 毛玻璃磨砂效果
- 🎯 仪表盘风格，拖拽排序
- 🔍 搜索过滤
- 🌙/☀️ 暗色/亮色主题切换
- ⏰ 实时时钟
- 🌤 天气显示（自动获取）
- ⭐ 粒子星空背景
- 📤 自定义图标上传
- ⌨️ 键盘快捷键
- 💾 localStorage 持久化
- 📱 响应式设计

## 快捷键

| 按键 | 功能 |
|------|------|
| `/` 或 `Ctrl+K` | 聚焦搜索框 |
| `T` | 切换暗/亮主题 |
| `N` | 添加新分类 |
| `Esc` | 关闭弹窗 / 清空搜索 |
| `?` | 显示快捷键帮助 |

## 部署

### GitHub Pages

1. 创建仓库，上传项目文件
2. Settings → Pages → Source 选择 main 分支
3. 访问 `https://<username>.github.io/<repo>/`

### Vercel

1. 导入 Git 仓库
2. 无需配置，直接部署

### 本地使用

直接在浏览器中打开 `index.html` 即可。

## 技术栈

- HTML5 + CSS3 + Vanilla JavaScript
- SortableJS（拖拽排序）
- Canvas API（粒子动画）
- wttr.in（天气数据）
- Google Favicon API（网站图标）

## 自定义

所有数据存储在浏览器 localStorage 中，首次打开会加载默认网站列表。
你可以通过界面添加、编辑、删除分类和网站，所有修改自动保存。
