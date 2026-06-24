/* ============================================
   毛玻璃导航仪表盘 - 核心逻辑
   ============================================ */

// ==================== 默认数据 ====================
const DEFAULT_DATA = {
  categories: [
    {
      id: 'cat_default_1',
      name: '我的网站',
      emoji: '⭐',
      websites: [
        {
          id: 'web_default_1',
          name: 'Cloudflare',
          url: 'https://dash.cloudflare.com',
          desc: 'CDN & 安全管理面板',
          icon: null
        },
        {
          id: 'web_default_2',
          name: 'NNYunIDC',
          url: 'https://nnyunidc.com',
          desc: '云服务与 IDC',
          icon: null
        },
        {
          id: 'web_default_3',
          name: 'Stat Monitor',
          url: 'https://stat.080920.xyz',
          desc: '状态监控面板',
          icon: null
        }
      ]
    },
    {
      id: 'cat_default_2',
      name: '开发工具',
      emoji: '🔧',
      websites: [
        {
          id: 'web_default_4',
          name: 'GitHub',
          url: 'https://github.com',
          desc: '代码托管与协作',
          icon: null
        },
        {
          id: 'web_default_5',
          name: 'CodePen',
          url: 'https://codepen.io',
          desc: '前端代码实验场',
          icon: null
        },
        {
          id: 'web_default_6',
          name: 'Docker Hub',
          url: 'https://hub.docker.com',
          desc: '容器镜像仓库',
          icon: null
        }
      ]
    },
    {
      id: 'cat_default_3',
      name: '文档参考',
      emoji: '📚',
      websites: [
        {
          id: 'web_default_7',
          name: 'MDN Web Docs',
          url: 'https://developer.mozilla.org',
          desc: 'Web 技术权威文档',
          icon: null
        },
        {
          id: 'web_default_8',
          name: 'Can I Use',
          url: 'https://caniuse.com',
          desc: '浏览器兼容性查询',
          icon: null
        },
        {
          id: 'web_default_9',
          name: 'NPM',
          url: 'https://www.npmjs.com',
          desc: 'Node.js 包管理',
          icon: null
        }
      ]
    },
    {
      id: 'cat_default_4',
      name: 'AI & 效率',
      emoji: '🤖',
      websites: [
        {
          id: 'web_default_10',
          name: 'ChatGPT',
          url: 'https://chatgpt.com',
          desc: 'AI 对话助手',
          icon: null
        },
        {
          id: 'web_default_11',
          name: 'Stack Overflow',
          url: 'https://stackoverflow.com',
          desc: '开发者问答社区',
          icon: null
        },
        {
          id: 'web_default_12',
          name: 'Dev.to',
          url: 'https://dev.to',
          desc: '开发者博客社区',
          icon: null
        }
      ]
    },
    {
      id: 'cat_default_5',
      name: '平台服务',
      emoji: '☁️',
      websites: [
        {
          id: 'web_default_13',
          name: 'Vercel',
          url: 'https://vercel.com',
          desc: '前端部署平台',
          icon: null
        }
      ]
    }
  ],
  settings: {
    theme: 'dark',
    categoryOrder: [],
    websiteOrder: {}
  }
};

// ==================== 工具函数 ====================
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ==================== 数据管理 ====================
class DataManager {
  constructor() {
    this.storageKey = 'nav_dashboard_data';
    this.data = null;
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.data = JSON.parse(saved);
        // 兼容旧数据：确保 settings 存在
        if (!this.data.settings) {
          this.data.settings = { ...DEFAULT_DATA.settings };
        }
      } else {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.save();
      }
    } catch (e) {
      console.error('数据加载失败:', e);
      this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      this.save();
    }
    return this.data;
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.error('数据保存失败:', e);
      showToast('数据保存失败，可能是存储空间已满', 'error');
    }
  }

  // 分类操作
  addCategory(name, emoji) {
    const cat = {
      id: generateId(),
      name,
      emoji: emoji || '📁',
      websites: []
    };
    this.data.categories.push(cat);
    this.save();
    return cat;
  }

  updateCategory(id, name, emoji) {
    const cat = this.data.categories.find(c => c.id === id);
    if (cat) {
      cat.name = name;
      cat.emoji = emoji || '📁';
      this.save();
    }
    return cat;
  }

  deleteCategory(id) {
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.save();
  }

  reorderCategories(orderedIds) {
    const map = {};
    this.data.categories.forEach(c => map[c.id] = c);
    this.data.categories = orderedIds.map(id => map[id]).filter(Boolean);
    this.save();
  }

  // 网站操作
  addWebsite(categoryId, name, url, desc, icon) {
    const cat = this.data.categories.find(c => c.id === categoryId);
    if (!cat) return null;
    const site = {
      id: generateId(),
      name,
      url,
      desc: desc || '',
      icon: icon || null
    };
    cat.websites.push(site);
    this.save();
    return site;
  }

  updateWebsite(categoryId, websiteId, name, url, desc, icon) {
    const cat = this.data.categories.find(c => c.id === categoryId);
    if (!cat) return null;
    const site = cat.websites.find(w => w.id === websiteId);
    if (site) {
      site.name = name;
      site.url = url;
      site.desc = desc || '';
      if (icon !== undefined) site.icon = icon;
      this.save();
    }
    return site;
  }

  deleteWebsite(categoryId, websiteId) {
    const cat = this.data.categories.find(c => c.id === categoryId);
    if (cat) {
      cat.websites = cat.websites.filter(w => w.id !== websiteId);
      this.save();
    }
  }

  reorderWebsites(categoryId, orderedIds) {
    const cat = this.data.categories.find(c => c.id === categoryId);
    if (!cat) return;
    const map = {};
    cat.websites.forEach(w => map[w.id] = w);
    cat.websites = orderedIds.map(id => map[id]).filter(Boolean);
    this.save();
  }

  getTheme() {
    return this.data.settings.theme || 'dark';
  }

  setTheme(theme) {
    this.data.settings.theme = theme;
    this.save();
  }
}

// ==================== GitHub API ====================
class GitHubAPI {
  constructor() {
    this.storageKey = 'nav_github_settings';
    this.settings = this.loadSettings();
    this.isVerified = false;
    this.userInfo = null;
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : {
        token: '',
        repo: '',
        branch: 'main'
      };
    } catch {
      return { token: '', repo: '', branch: 'main' };
    }
  }

  saveSettings() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
  }

  updateSettings(token, repo, branch) {
    this.settings.token = token;
    this.settings.repo = repo;
    this.settings.branch = branch || 'main';
    this.saveSettings();
  }

  isConfigured() {
    return this.settings.token && this.settings.repo;
  }

  getHeaders() {
    return {
      'Authorization': `token ${this.settings.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  }

  async verifyToken() {
    if (!this.settings.token) {
      throw new Error('请先输入 GitHub Token');
    }

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Token 验证失败');
      }

      this.userInfo = await response.json();
      this.isVerified = true;
      return this.userInfo;
    } catch (error) {
      this.isVerified = false;
      throw error;
    }
  }

  async testConnection() {
    if (!this.isConfigured()) {
      throw new Error('请先配置 Token 和仓库地址');
    }

    try {
      // 验证 Token
      await this.verifyToken();

      // 检查仓库是否存在
      const [owner, repo] = this.settings.repo.split('/');
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error('仓库不存在或无权访问');
      }

      return { success: true, user: this.userInfo };
    } catch (error) {
      throw error;
    }
  }

  async getFile(path) {
    const [owner, repo] = this.settings.repo.split('/');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${this.settings.branch}`;

    const response = await fetch(url, { headers: this.getHeaders() });

    if (response.status === 404) {
      return null; // 文件不存在
    }

    if (!response.ok) {
      throw new Error('获取文件失败');
    }

    const data = await response.json();
    return {
      content: atob(data.content),
      sha: data.sha
    };
  }

  async updateFile(path, content, message = 'Update data') {
    const [owner, repo] = this.settings.repo.split('/');

    // 获取现有文件的 SHA（如果存在）
    let sha = null;
    try {
      const existing = await this.getFile(path);
      if (existing) {
        sha = existing.sha;
      }
    } catch {}

    const body = {
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: this.settings.branch
    };

    if (sha) {
      body.sha = sha;
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('更新文件失败');
    }

    return await response.json();
  }

  async syncToGitHub(data) {
    if (!this.isConfigured()) {
      throw new Error('请先配置 GitHub 设置');
    }

    const content = JSON.stringify(data, null, 2);
    return await this.updateFile(
      'nav-data.json',
      content,
      '🔄 Sync navigation data'
    );
  }

  async syncFromGitHub() {
    if (!this.isConfigured()) {
      throw new Error('请先配置 GitHub 设置');
    }

    const file = await this.getFile('nav-data.json');
    if (!file) {
      throw new Error('GitHub 上没有找到数据文件');
    }

    return JSON.parse(file.content);
  }
}

// ==================== 背景图管理 ====================
class BackgroundManager {
  constructor() {
    this.storageKey = 'nav_background_settings';
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : {
        imageUrl: '',
        effect: 'cover',
        opacity: 50
      };
    } catch {
      return { imageUrl: '', effect: 'cover', opacity: 50 };
    }
  }

  saveSettings() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
  }

  updateSettings(imageUrl, effect, opacity) {
    this.settings.imageUrl = imageUrl || '';
    this.settings.effect = effect || 'cover';
    this.settings.opacity = opacity !== undefined ? opacity : 50;
    this.saveSettings();
    this.apply();
  }

  apply() {
    const body = document.body;
    
    if (this.settings.imageUrl) {
      body.classList.add('custom-bg');
      body.style.setProperty('--custom-bg-image', `url(${this.settings.imageUrl})`);
      
      switch (this.settings.effect) {
        case 'cover':
          body.style.setProperty('--custom-bg-size', 'cover');
          body.style.setProperty('--custom-bg-repeat', 'no-repeat');
          break;
        case 'contain':
          body.style.setProperty('--custom-bg-size', 'contain');
          body.style.setProperty('--custom-bg-repeat', 'no-repeat');
          break;
        case 'repeat':
          body.style.setProperty('--custom-bg-size', 'auto');
          body.style.setProperty('--custom-bg-repeat', 'repeat');
          break;
      }
      
      body.style.setProperty('--custom-bg-opacity', this.settings.opacity / 100);
    } else {
      body.classList.remove('custom-bg');
      body.style.removeProperty('--custom-bg-image');
      body.style.removeProperty('--custom-bg-size');
      body.style.removeProperty('--custom-bg-repeat');
      body.style.removeProperty('--custom-bg-opacity');
    }
  }

  setImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.updateSettings(e.target.result, this.settings.effect, this.settings.opacity);
        resolve(e.target.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  setImageFromUrl(url) {
    return new Promise((resolve, reject) => {
      // 验证图片是否可以加载
      const img = new Image();
      img.onload = () => {
        this.updateSettings(url, this.settings.effect, this.settings.opacity);
        resolve(url);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = url;
    });
  }

  clear() {
    this.updateSettings('', this.settings.effect, this.settings.opacity);
  }
}

// ==================== 粒子系统 ====================
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 70;
    this.maxDist = 120;
    this.animationId = null;
    this.resize();
    this.init();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  draw() {
    const style = getComputedStyle(document.documentElement);
    const particleColor = style.getPropertyValue('--particle-color').trim();
    const lineColor = style.getPropertyValue('--particle-line').trim();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制连线
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.maxDist) {
          const alpha = 1 - dist / this.maxDist;
          this.ctx.beginPath();
          this.ctx.strokeStyle = lineColor;
          this.ctx.globalAlpha = alpha * 0.5;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }

    // 绘制粒子
    this.ctx.globalAlpha = 1;
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.fillStyle = particleColor;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.globalAlpha = 1;
  }

  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      // 边界修正
      p.x = Math.max(0, Math.min(this.canvas.width, p.x));
      p.y = Math.max(0, Math.min(this.canvas.height, p.y));
    });
  }

  animate() {
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (!this.animationId) this.animate();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// ==================== 天气模块 ====================
class WeatherWidget {
  constructor() {
    this.iconEl = document.getElementById('weather-icon');
    this.textEl = document.getElementById('weather-text');
    this.widgetEl = document.getElementById('weather-widget');
    this.cacheKey = 'nav_weather_cache';
    this.loadCached();
    this.fetch();
    this.widgetEl.addEventListener('click', () => this.fetch());
  }

  loadCached() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        // 缓存 30 分钟
        if (Date.now() - data.timestamp < 30 * 60 * 1000) {
          this.render(data);
          return;
        }
      }
    } catch {}
  }

  async fetch() {
    try {
      const res = await window.fetch('https://wttr.in/?format=j1', { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      const current = data.current_condition?.[0];
      if (!current) return;
      const weatherData = {
        temp: current.temp_C,
        desc: current.weatherDesc?.[0]?.value || '',
        icon: this.getWeatherIcon(parseInt(current.weatherCode)),
        timestamp: Date.now()
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(weatherData));
      this.render(weatherData);
    } catch (e) {
      console.warn('天气获取失败:', e);
      this.textEl.textContent = '--°C';
    }
  }

  getWeatherIcon(code) {
    // wttr.in 天气代码映射
    if (code === 113) return '☀️';
    if (code === 116) return '⛅';
    if ([119, 122].includes(code)) return '☁️';
    if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 311, 314, 353, 356, 359].includes(code)) return '🌧️';
    if ([200, 386, 389, 392, 395].includes(code)) return '⛈️';
    if ([179, 182, 185, 227, 230, 260, 323, 326, 329, 332, 335, 338, 350, 362, 365, 368, 371, 374, 377].includes(code)) return '🌨️';
    if ([143, 248, 260].includes(code)) return '🌫️';
    return '🌤';
  }

  render(data) {
    this.iconEl.textContent = data.icon;
    this.textEl.textContent = `${data.temp}°C`;
    this.widgetEl.title = data.desc;
  }
}

// ==================== 时钟模块 ====================
class ClockWidget {
  constructor() {
    this.timeEl = document.getElementById('clock-time');
    this.dateEl = document.getElementById('clock-date');
    this.update();
    setInterval(() => this.update(), 1000);
  }

  update() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    this.dateEl.textContent = `${year}/${month}/${day} 周${weekdays[now.getDay()]}`;
  }
}

// ==================== 图标上传处理 ====================
class IconUploader {
  constructor() {
    this.uploadArea = document.getElementById('icon-upload-area');
    this.fileInput = document.getElementById('icon-file-input');
    this.preview = document.getElementById('icon-preview');
    this.clearBtn = document.getElementById('clear-icon-btn');
    this.currentIcon = null;

    this.uploadArea.addEventListener('click', () => this.fileInput.click());
    this.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadArea.style.borderColor = 'var(--accent)';
    });
    this.uploadArea.addEventListener('dragleave', () => {
      this.uploadArea.style.borderColor = '';
    });
    this.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadArea.style.borderColor = '';
      if (e.dataTransfer.files.length) this.processFile(e.dataTransfer.files[0]);
    });
    this.fileInput.addEventListener('change', () => {
      if (this.fileInput.files.length) this.processFile(this.fileInput.files[0]);
    });
    this.clearBtn.addEventListener('click', () => this.clear());
  }

  processFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('请上传图片文件', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('图片大小不能超过 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // 压缩图片
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        // 居中裁剪
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        this.currentIcon = canvas.toDataURL('image/png', 0.8);
        this.renderPreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  renderPreview() {
    if (this.currentIcon) {
      this.preview.innerHTML = `<img src="${this.currentIcon}" alt="icon">`;
      this.clearBtn.style.display = 'block';
    } else {
      this.preview.innerHTML = '<span class="icon-placeholder">📷</span>';
      this.clearBtn.style.display = 'none';
    }
  }

  clear() {
    this.currentIcon = null;
    this.fileInput.value = '';
    this.renderPreview();
  }

  setIcon(icon) {
    this.currentIcon = icon;
    this.renderPreview();
  }

  getIcon() {
    return this.currentIcon;
  }
}

// ==================== 主应用 ====================
class App {
  constructor() {
    this.dm = new DataManager();
    this.data = this.dm.load();
    this.github = new GitHubAPI();
    this.bgManager = new BackgroundManager();
    this.dashboard = document.getElementById('dashboard');
    this.emptyState = document.getElementById('empty-state');
    this.searchInput = document.getElementById('search-input');
    this.sortableInstances = [];

    // 编辑状态
    this.editingCategoryId = null;
    this.editingWebsiteId = null;
    this.editingWebsiteCategoryId = null;
    this.deleteCallback = null;

    // 图标上传器
    this.iconUploader = new IconUploader();

    // 初始化各模块
    this.applyTheme(this.dm.getTheme());
    this.clock = new ClockWidget();
    this.weather = new WeatherWidget();
    this.particles = new ParticleSystem(document.getElementById('particles-canvas'));
    this.particles.start();

    // 渲染 & 绑定事件
    this.bgManager.apply(); // 应用保存的背景图
    this.render();
    this.bindEvents();
  }

  // --- 主题 ---
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    const current = this.dm.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.dm.setTheme(next);
    this.applyTheme(next);
    showToast(`已切换到${next === 'dark' ? '暗色' : '亮色'}主题`, 'info');
  }

  // --- 渲染 ---
  render() {
    // 销毁旧的 Sortable 实例
    this.sortableInstances.forEach(s => s.destroy());
    this.sortableInstances = [];

    this.dashboard.innerHTML = '';

    if (this.data.categories.length === 0) {
      this.emptyState.style.display = 'flex';
      return;
    }
    this.emptyState.style.display = 'none';

    this.data.categories.forEach(cat => {
      const card = this.createCategoryCard(cat);
      this.dashboard.appendChild(card);
    });

    this.initSortables();
  }

  createCategoryCard(cat) {
    const card = document.createElement('div');
    card.className = 'category-card glass-card';
    card.dataset.categoryId = cat.id;

    card.innerHTML = `
      <div class="category-header">
        <div class="category-title-area">
          <span class="category-emoji">${cat.emoji}</span>
          <span class="category-name">${this.escapeHtml(cat.name)}</span>
          <span class="category-count">${cat.websites.length}</span>
        </div>
        <div class="category-actions">
          <button class="category-action-btn" data-action="edit-category" data-id="${cat.id}" title="编辑">✏️</button>
          <button class="category-action-btn danger" data-action="delete-category" data-id="${cat.id}" title="删除">🗑️</button>
        </div>
      </div>
      <div class="website-list" data-category-id="${cat.id}">
        ${cat.websites.map(site => this.createWebsiteItemHTML(site)).join('')}
      </div>
      <button class="add-website-btn" data-action="add-website" data-category-id="${cat.id}">
        + 添加网站
      </button>
    `;

    // 点击网站链接
    card.querySelectorAll('.website-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.website-actions')) return;
        const url = item.dataset.url;
        if (url) window.open(url, '_blank');
      });
    });

    return card;
  }

  createWebsiteItemHTML(site) {
    const faviconUrl = getFaviconUrl(site.url);
    const iconHtml = site.icon
      ? `<img src="${site.icon}" alt="${this.escapeHtml(site.name)}" onerror="this.parentElement.innerHTML='<span class=\\'favicon-fallback\\'>${getInitial(site.name)}</span>'">`
      : faviconUrl
        ? `<img src="${faviconUrl}" alt="${this.escapeHtml(site.name)}" onerror="this.parentElement.innerHTML='<span class=\\'favicon-fallback\\'>${getInitial(site.name)}</span>'">`
        : `<span class="favicon-fallback">${getInitial(site.name)}</span>`;

    return `
      <div class="website-item" data-website-id="${site.id}" data-url="${this.escapeHtml(site.url)}">
        <div class="website-icon">${iconHtml}</div>
        <div class="website-info">
          <div class="website-name">${this.escapeHtml(site.name)}</div>
          ${site.desc ? `<div class="website-desc">${this.escapeHtml(site.desc)}</div>` : ''}
        </div>
        <div class="website-actions">
          <button class="website-action-btn" data-action="edit-website" data-id="${site.id}" title="编辑">✏️</button>
          <button class="website-action-btn danger" data-action="delete-website" data-id="${site.id}" title="删除">🗑️</button>
        </div>
      </div>
    `;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Sortable 初始化 ---
  initSortables() {
    // 分类拖拽
    const catSortable = new Sortable(this.dashboard, {
      animation: 200,
      handle: '.category-header',
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      onEnd: () => {
        const ids = Array.from(this.dashboard.querySelectorAll('.category-card'))
          .map(el => el.dataset.categoryId);
        this.dm.reorderCategories(ids);
      }
    });
    this.sortableInstances.push(catSortable);

    // 网站拖拽
    this.dashboard.querySelectorAll('.website-list').forEach(list => {
      const siteSortable = new Sortable(list, {
        group: 'websites',
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: (evt) => {
          const categoryId = evt.to.dataset.categoryId;
          const ids = Array.from(evt.to.querySelectorAll('.website-item'))
            .map(el => el.dataset.websiteId);
          this.dm.reorderWebsites(categoryId, ids);
          // 更新计数
          this.updateCounts();
        }
      });
      this.sortableInstances.push(siteSortable);
    });
  }

  updateCounts() {
    this.data.categories.forEach(cat => {
      const card = this.dashboard.querySelector(`[data-category-id="${cat.id}"]`);
      if (card) {
        const count = card.querySelector('.category-count');
        const list = card.querySelector('.website-list');
        if (count && list) {
          count.textContent = list.querySelectorAll('.website-item').length;
        }
      }
    });
  }

  // --- 弹窗管理 ---
  openModal(id) {
    document.getElementById(id).classList.add('active');
  }

  closeModal(id) {
    document.getElementById(id).classList.remove('active');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  // --- 分类操作 ---
  openAddCategory() {
    this.editingCategoryId = null;
    document.getElementById('category-modal-title').textContent = '添加分类';
    document.getElementById('category-name').value = '';
    document.getElementById('category-emoji').value = '';
    document.querySelectorAll('.emoji-option').forEach(e => e.classList.remove('selected'));
    this.openModal('category-modal');
    document.getElementById('category-name').focus();
  }

  openEditCategory(id) {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return;
    this.editingCategoryId = id;
    document.getElementById('category-modal-title').textContent = '编辑分类';
    document.getElementById('category-name').value = cat.name;
    document.getElementById('category-emoji').value = cat.emoji;
    // 高亮选中的 emoji
    document.querySelectorAll('.emoji-option').forEach(e => {
      e.classList.toggle('selected', e.dataset.emoji === cat.emoji);
    });
    this.openModal('category-modal');
    document.getElementById('category-name').focus();
  }

  saveCategory() {
    const name = document.getElementById('category-name').value.trim();
    const emoji = document.getElementById('category-emoji').value.trim() || '📁';
    if (!name) {
      showToast('请输入分类名称', 'error');
      return;
    }
    if (this.editingCategoryId) {
      this.dm.updateCategory(this.editingCategoryId, name, emoji);
      showToast('分类已更新', 'success');
    } else {
      this.dm.addCategory(name, emoji);
      showToast('分类已添加', 'success');
    }
    this.closeModal('category-modal');
    this.render();
  }

  confirmDeleteCategory(id) {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return;
    document.getElementById('delete-message').textContent =
      `确定要删除分类「${cat.name}」吗？其中的 ${cat.websites.length} 个网站也会被删除。`;
    this.deleteCallback = () => {
      this.dm.deleteCategory(id);
      showToast('分类已删除', 'success');
      this.render();
    };
    this.openModal('delete-modal');
  }

  // --- 网站操作 ---
  openAddWebsite(categoryId) {
    this.editingWebsiteId = null;
    this.editingWebsiteCategoryId = categoryId;
    document.getElementById('website-modal-title').textContent = '添加网站';
    document.getElementById('website-name').value = '';
    document.getElementById('website-url').value = '';
    document.getElementById('website-desc').value = '';
    this.iconUploader.clear();
    this.openModal('website-modal');
    document.getElementById('website-name').focus();
  }

  openEditWebsite(categoryId, websiteId) {
    const cat = this.data.categories.find(c => c.id === categoryId);
    if (!cat) return;
    const site = cat.websites.find(w => w.id === websiteId);
    if (!site) return;
    this.editingWebsiteId = websiteId;
    this.editingWebsiteCategoryId = categoryId;
    document.getElementById('website-modal-title').textContent = '编辑网站';
    document.getElementById('website-name').value = site.name;
    document.getElementById('website-url').value = site.url;
    document.getElementById('website-desc').value = site.desc || '';
    this.iconUploader.setIcon(site.icon);
    this.openModal('website-modal');
    document.getElementById('website-name').focus();
  }

  saveWebsite() {
    const name = document.getElementById('website-name').value.trim();
    const url = document.getElementById('website-url').value.trim();
    const desc = document.getElementById('website-desc').value.trim();
    const icon = this.iconUploader.getIcon();

    if (!name) {
      showToast('请输入网站名称', 'error');
      return;
    }
    if (!url) {
      showToast('请输入网站地址', 'error');
      return;
    }
    // 简单校验 URL
    try {
      new URL(url);
    } catch {
      showToast('请输入有效的 URL（以 http:// 或 https:// 开头）', 'error');
      return;
    }

    if (this.editingWebsiteId) {
      this.dm.updateWebsite(this.editingWebsiteCategoryId, this.editingWebsiteId, name, url, desc, icon);
      showToast('网站已更新', 'success');
    } else {
      this.dm.addWebsite(this.editingWebsiteCategoryId, name, url, desc, icon);
      showToast('网站已添加', 'success');
    }
    this.closeModal('website-modal');
    this.render();
  }

  confirmDeleteWebsite(categoryId, websiteId) {
    const cat = this.data.categories.find(c => c.id === categoryId);
    if (!cat) return;
    const site = cat.websites.find(w => w.id === websiteId);
    if (!site) return;
    document.getElementById('delete-message').textContent =
      `确定要删除网站「${site.name}」吗？`;
    this.deleteCallback = () => {
      this.dm.deleteWebsite(categoryId, websiteId);
      showToast('网站已删除', 'success');
      this.render();
    };
    this.openModal('delete-modal');
  }

  // --- 搜索 ---
  performSearch(query) {
    const q = query.toLowerCase().trim();
    const cards = this.dashboard.querySelectorAll('.category-card');

    if (!q) {
      cards.forEach(card => {
        card.style.display = '';
        card.classList.remove('search-empty');
        card.querySelectorAll('.website-item').forEach(item => {
          item.style.display = '';
          item.classList.remove('search-hidden');
          // 移除高亮
          const nameEl = item.querySelector('.website-name');
          const descEl = item.querySelector('.website-desc');
          if (nameEl) nameEl.innerHTML = this.escapeHtml(nameEl.textContent);
          if (descEl) descEl.innerHTML = this.escapeHtml(descEl.textContent);
        });
      });
      return;
    }

    cards.forEach(card => {
      const items = card.querySelectorAll('.website-item');
      let hasMatch = false;

      items.forEach(item => {
        const name = item.querySelector('.website-name')?.textContent || '';
        const desc = item.querySelector('.website-desc')?.textContent || '';
        const url = item.dataset.url || '';
        const match = name.toLowerCase().includes(q) ||
                      desc.toLowerCase().includes(q) ||
                      url.toLowerCase().includes(q);

        if (match) {
          hasMatch = true;
          item.style.display = '';
          item.classList.remove('search-hidden');
          // 高亮匹配文本
          const nameEl = item.querySelector('.website-name');
          const descEl = item.querySelector('.website-desc');
          if (nameEl) nameEl.innerHTML = this.highlightText(nameEl.textContent, q);
          if (descEl) descEl.innerHTML = this.highlightText(descEl.textContent, q);
        } else {
          item.style.display = 'none';
          item.classList.add('search-hidden');
        }
      });

      if (hasMatch) {
        card.style.display = '';
        card.classList.remove('search-empty');
      } else {
        card.style.display = 'none';
        card.classList.add('search-empty');
      }
    });
  }

  highlightText(text, query) {
    const escaped = this.escapeHtml(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<span class="search-highlight">$1</span>');
  }

  // --- 事件绑定 ---
  bindEvents() {
    // 主题切换
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

    // GitHub 同步
    document.getElementById('sync-btn').addEventListener('click', () => this.syncWithGitHub());

    // 设置
    document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());

    // 设置弹窗中的按钮
    document.getElementById('verify-token-btn').addEventListener('click', () => this.testGitHubConnection());
    document.getElementById('save-github-settings').addEventListener('click', () => this.saveGitHubSettings());
    document.getElementById('test-github-connection').addEventListener('click', () => this.testGitHubConnection());
    document.getElementById('save-all-settings').addEventListener('click', () => this.saveAllSettings());

    // 数据管理按钮
    document.getElementById('export-btn').addEventListener('click', () => this.exportData());
    document.getElementById('import-btn').addEventListener('click', () => {
      document.getElementById('import-file-input').click();
    });
    document.getElementById('import-file-input').addEventListener('change', (e) => this.importData(e));
    document.getElementById('push-to-github-btn').addEventListener('click', () => this.syncWithGitHub());
    document.getElementById('pull-from-github-btn').addEventListener('click', () => this.syncFromGitHub());

    // 背景图设置
    document.getElementById('upload-bg-btn').addEventListener('click', () => {
      document.getElementById('bg-file-input').click();
    });
    document.getElementById('bg-file-input').addEventListener('change', (e) => {
      if (e.target.files[0]) {
        this.uploadBackground(e.target.files[0]);
      }
    });
    document.getElementById('apply-bg-url').addEventListener('click', () => this.applyBackgroundUrl());
    document.getElementById('clear-bg-btn').addEventListener('click', () => this.clearBackground());

    // 背景效果和透明度
    document.querySelectorAll('input[name="bg-effect"]').forEach(radio => {
      radio.addEventListener('change', (e) => this.updateBgEffect(e.target.value));
    });
    document.getElementById('bg-opacity').addEventListener('input', (e) => {
      this.updateBgOpacity(e.target.value);
    });

    // 添加分类
    document.getElementById('add-category-btn').addEventListener('click', () => this.openAddCategory());

    // 保存分类
    document.getElementById('save-category-btn').addEventListener('click', () => this.saveCategory());

    // 保存网站
    document.getElementById('save-website-btn').addEventListener('click', () => this.saveWebsite());

    // 确认删除
    document.getElementById('confirm-delete-btn').addEventListener('click', () => {
      if (this.deleteCallback) {
        this.deleteCallback();
        this.deleteCallback = null;
      }
      this.closeModal('delete-modal');
    });

    // 关闭弹窗按钮
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModal(btn.dataset.close);
      });
    });

    // 点击遮罩关闭弹窗
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeAllModals();
      });
    });

    // Emoji 选择器
    document.querySelectorAll('.emoji-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.emoji-option').forEach(e => e.classList.remove('selected'));
        opt.classList.add('selected');
        document.getElementById('category-emoji').value = opt.dataset.emoji;
      });
    });

    // 快捷键帮助
    document.getElementById('shortcuts-btn').addEventListener('click', () => {
      this.openModal('shortcuts-modal');
    });

    // 搜索
    this.searchInput.addEventListener('input', (e) => {
      this.performSearch(e.target.value);
    });

    // 事件委托：分类和网站操作
    this.dashboard.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      const categoryId = btn.dataset.categoryId ||
                         btn.closest('.category-card')?.dataset.categoryId;

      switch (action) {
        case 'edit-category':
          this.openEditCategory(id);
          break;
        case 'delete-category':
          this.confirmDeleteCategory(id);
          break;
        case 'add-website':
          this.openAddWebsite(categoryId);
          break;
        case 'edit-website':
          this.openEditWebsite(categoryId, id);
          break;
        case 'delete-website':
          this.confirmDeleteWebsite(categoryId, id);
          break;
      }
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      // 如果在输入框中，只处理 Esc
      const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

      if (e.key === 'Escape') {
        if (document.querySelector('.modal-overlay.active')) {
          this.closeAllModals();
        } else if (this.searchInput.value) {
          this.searchInput.value = '';
          this.performSearch('');
          this.searchInput.blur();
        }
        return;
      }

      if (isInput) return;

      // / 或 Ctrl+K → 聚焦搜索
      if (e.key === '/' || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        this.searchInput.focus();
        return;
      }

      // T → 切换主题
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        this.toggleTheme();
        return;
      }

      // N → 添加分类
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        this.openAddCategory();
        return;
      }

      // ? → 快捷键帮助
      if (e.key === '?') {
        e.preventDefault();
        this.openModal('shortcuts-modal');
        return;
      }
    });

    // 回车保存
    document.getElementById('category-name').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.saveCategory();
    });
    document.getElementById('website-url').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.saveWebsite();
    });
  }

  // --- 导出数据 ---
  exportData() {
    try {
      const data = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        source: 'nav-dashboard',
        navData: this.dataManager.data,
        backgroundSettings: this.bgManager.settings,
        theme: this.dm.getTheme()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nav-dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('数据导出成功！', 'success');
    } catch (e) {
      console.error('导出失败:', e);
      showToast('数据导出失败', 'error');
    }
  }

  // --- 导入数据 ---
  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 重置 input 以便重复选择同一文件
    event.target.value = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // 兼容新旧格式
        const navData = imported.navData || imported.data;
        
        // 验证数据格式
        if (!navData || !navData.categories) {
          showToast('无效的备份文件格式', 'error');
          return;
        }

        // 确认覆盖
        if (!confirm('导入将覆盖当前所有数据，确定要继续吗？')) {
          return;
        }

        // 恢复导航数据
        this.dataManager.data = navData;
        this.dataManager.save();
        
        // 恢复背景设置（如果有）
        if (imported.backgroundSettings) {
          this.bgManager.settings = imported.backgroundSettings;
          this.bgManager.saveSettings();
          this.bgManager.apply();
        }
        
        // 恢复主题（如果有）
        if (imported.theme) {
          this.dm.setTheme(imported.theme);
          this.applyTheme(imported.theme);
        }

        // 重新渲染
        this.render();

        showToast('数据导入成功！页面即将刷新...', 'success');

        // 延迟刷新以确保用户看到提示
        setTimeout(() => location.reload(), 1500);
      } catch (err) {
        console.error('导入失败:', err);
        showToast('文件解析失败，请检查格式', 'error');
      }
    };
    reader.readAsText(file);
  }

  // --- 设置相关 ---
  openSettings() {
    this.loadSettingsForm();
    this.openModal('settings-modal');
  }

  loadSettingsForm() {
    // 加载 GitHub 设置
    document.getElementById('github-token').value = this.github.settings.token;
    document.getElementById('github-repo').value = this.github.settings.repo;
    document.getElementById('github-branch').value = this.github.settings.branch;
    this.updateSyncStatus();

    // 加载背景图设置
    const bgSettings = this.bgManager.settings;
    document.getElementById('bg-url').value = bgSettings.imageUrl || '';
    document.getElementById('bg-opacity').value = bgSettings.opacity;
    document.getElementById('bg-opacity-value').textContent = bgSettings.opacity + '%';
    
    // 设置背景效果单选按钮
    document.querySelectorAll('input[name="bg-effect"]').forEach(radio => {
      radio.checked = radio.value === bgSettings.effect;
    });

    // 更新背景预览
    this.updateBgPreview();
  }

  updateSyncStatus() {
    const statusEl = document.getElementById('sync-status');
    const dot = statusEl.querySelector('.status-dot');
    const text = statusEl.querySelector('.status-text');

    if (this.github.isVerified) {
      dot.className = 'status-dot connected';
      text.textContent = `已连接: ${this.github.userInfo?.login || ''}`;
    } else if (this.github.isConfigured()) {
      dot.className = 'status-dot disconnected';
      text.textContent = '已配置，未验证';
    } else {
      dot.className = 'status-dot disconnected';
      text.textContent = '未连接';
    }
  }

  updateBgPreview() {
    const preview = document.getElementById('bg-preview');
    const placeholder = preview.querySelector('.bg-preview-placeholder');
    
    if (this.bgManager.settings.imageUrl) {
      preview.classList.add('has-image');
      preview.style.backgroundImage = `url(${this.bgManager.settings.imageUrl})`;
      if (placeholder) placeholder.style.display = 'none';
    } else {
      preview.classList.remove('has-image');
      preview.style.backgroundImage = '';
      if (placeholder) {
        placeholder.style.display = '';
        placeholder.textContent = '当前：默认渐变';
      }
    }
  }

  async saveGitHubSettings() {
    const token = document.getElementById('github-token').value.trim();
    const repo = document.getElementById('github-repo').value.trim();
    const branch = document.getElementById('github-branch').value.trim() || 'main';

    if (!token || !repo) {
      showToast('请填写 Token 和仓库地址', 'error');
      return;
    }

    this.github.updateSettings(token, repo, branch);
    showToast('GitHub 设置已保存', 'success');
    this.updateSyncStatus();
  }

  async testGitHubConnection() {
    try {
      // 先保存设置
      await this.saveGitHubSettings();
      
      showToast('正在测试连接...', 'info');
      const result = await this.github.testConnection();
      
      this.updateSyncStatus();
      showToast(`连接成功！用户: ${result.user.login}`, 'success');
    } catch (error) {
      showToast(`连接失败: ${error.message}`, 'error');
    }
  }

  async syncWithGitHub() {
    if (!this.github.isConfigured()) {
      showToast('请先在设置中配置 GitHub', 'error');
      this.openSettings();
      return;
    }

    try {
      showToast('正在同步到 GitHub...', 'info');

      // 准备同步数据（包含导航数据和背景设置）
      const syncData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        navData: this.dataManager.data,
        backgroundSettings: this.bgManager.settings,
        theme: this.dm.getTheme()
      };

      await this.github.syncToGitHub(syncData);

      showToast('数据已同步到 GitHub！', 'success');
    } catch (error) {
      showToast(`同步失败: ${error.message}`, 'error');
    }
  }

  async syncFromGitHub() {
    if (!this.github.isConfigured()) {
      showToast('请先在设置中配置 GitHub', 'error');
      return;
    }

    try {
      showToast('正在从 GitHub 拉取数据...', 'info');

      const data = await this.github.syncFromGitHub();

      // 确认覆盖
      if (!confirm('从 GitHub 拉取的数据将覆盖本地数据，确定要继续吗？')) {
        return;
      }

      // 恢复导航数据
      if (data.navData) {
        this.dataManager.data = data.navData;
        this.dataManager.save();
      }
      
      // 恢复背景设置
      if (data.backgroundSettings) {
        this.bgManager.settings = data.backgroundSettings;
        this.bgManager.saveSettings();
        this.bgManager.apply();
      }
      
      // 恢复主题
      if (data.theme) {
        this.dm.setTheme(data.theme);
        this.applyTheme(data.theme);
      }
      
      // 重新渲染
      this.render();

      showToast('数据已从 GitHub 同步！', 'success');
    } catch (error) {
      showToast(`拉取失败: ${error.message}`, 'error');
    }
  }

  // --- 背景图相关 ---
  async uploadBackground(file) {
    try {
      await this.bgManager.setImageFromFile(file);
      this.updateBgPreview();
      showToast('背景图片已更新', 'success');
    } catch (error) {
      showToast('图片上传失败', 'error');
    }
  }

  async applyBackgroundUrl() {
    const url = document.getElementById('bg-url').value.trim();
    
    if (!url) {
      showToast('请输入图片 URL', 'error');
      return;
    }

    try {
      showToast('正在加载图片...', 'info');
      await this.bgManager.setImageFromUrl(url);
      this.updateBgPreview();
      showToast('背景图片已更新', 'success');
    } catch (error) {
      showToast('图片加载失败，请检查 URL', 'error');
    }
  }

  clearBackground() {
    this.bgManager.clear();
    this.updateBgPreview();
    document.getElementById('bg-url').value = '';
    showToast('背景已恢复默认', 'success');
  }

  updateBgEffect(effect) {
    this.bgManager.updateSettings(
      this.bgManager.settings.imageUrl,
      effect,
      this.bgManager.settings.opacity
    );
  }

  updateBgOpacity(opacity) {
    document.getElementById('bg-opacity-value').textContent = opacity + '%';
    this.bgManager.updateSettings(
      this.bgManager.settings.imageUrl,
      this.bgManager.settings.effect,
      parseInt(opacity)
    );
  }

  saveAllSettings() {
    // 保存 GitHub 设置
    this.saveGitHubSettings();
    
    // 保存背景图设置（已经在 change 事件中自动保存）
    
    showToast('所有设置已保存', 'success');
    this.closeModal('settings-modal');
  }
}

// ==================== 启动 ====================
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
