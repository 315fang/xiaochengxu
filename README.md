# 代理商 Web 门户 · 快速启动

## 技术栈
- **框架**: Nuxt 3 + Vue 3 Composition API
- **样式**: Tailwind CSS（黑金主题）
- **状态**: Pinia
- **部署**: Vercel（SSG 静态生成）

## 本地开发

```bash
cd agent-portal

# 1. 安装依赖
npm install

# 2. 复制环境变量
cp .env.example .env
# 编辑 .env，将 NUXT_PUBLIC_API_BASE 改为后端地址

# 3. 启动开发服务器
npm run dev
# 访问 http://localhost:3001
```

## 目录结构

```
agent-portal/
├── pages/
│   ├── index.vue              # 品牌首页（公开）
│   ├── join.vue               # 加入代理商（公开）
│   ├── login.vue              # 登录页（公开）
│   └── dashboard/
│       ├── index.vue          # 工作台看板
│       ├── commissions.vue    # 佣金明细
│       ├── withdraw.vue       # 提现
│       ├── team.vue           # 团队管理
│       ├── orders.vue         # 代理订单
│       └── stock.vue          # 云仓库存
├── layouts/
│   ├── blank.vue              # 空白布局（登录/公开页）
│   └── dashboard.vue          # 仪表盘布局（侧边栏+顶栏）
├── stores/
│   └── auth.ts                # Pinia 认证状态
├── composables/
│   ├── useAuth.ts             # 登录/退出逻辑
│   └── useApi.ts              # HTTP 请求封装（自动带 JWT）
├── middleware/
│   └── auth.ts                # 路由守卫（未登录跳 /login）
└── assets/css/
    └── main.css               # 黑金主题全局样式
```

## 生产部署（Vercel）

### 方式一：Vercel 直接部署（推荐）

1. 将 `agent-portal/` 目录推送到 GitHub 仓库
2. 在 Vercel 导入该仓库
3. 设置环境变量：
   - `NUXT_PUBLIC_API_BASE` = `https://your-backend-domain.com`
4. 构建命令：`npm run generate`
5. 输出目录：`.output/public`

### 方式二：本地生成后上传

```bash
npm run generate
# 生成的静态文件在 .output/public/
```

### API 跨域配置

生产环境 Vercel 通过 `vercel.json` 的 `rewrites` 代理 `/api/*` 请求到后端：

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-domain.com/api/:path*"
    }
  ]
}
```

需将 `vercel.json` 中的 `your-backend-domain.com` 替换为实际后端域名。

## 后端 API 依赖

门户使用后端的以下接口（均需 JWT 认证）：

| 功能 | 接口 |
|------|------|
| 登录 | `POST /api/auth/login` |
| 钱包信息 | `GET /api/wallet/info` |
| 佣金明细 | `GET /api/wallet/commissions` |
| 申请提现 | `POST /api/wallet/withdraw` |
| 提现记录 | `GET /api/wallet/withdrawals` |
| 工作台数据 | `GET /api/agent/workbench` |
| 代理订单 | `GET /api/agent/orders` |
| 云仓日志 | `GET /api/agent/stock-logs` |
| 采购入仓 | `POST /api/agent/restock` |
| 团队成员 | `GET /api/distribution/team` |
| 团队统计 | `GET /api/distribution/stats` |
| 佣金统计 | `GET /api/commissions/my-stats` |

## 主题定制

主题颜色在 `assets/css/main.css` 和 `nuxt.config.ts` 中通过 CSS 变量控制：

```css
:root {
  --color-gold: #C6A16E;      /* 主金色 */
  --color-bg: #0f0f0f;        /* 页面背景 */
  --color-surface: #1a1a1a;   /* 卡片背景 */
}
```
