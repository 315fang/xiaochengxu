// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000'
    }
  },

  // 开发环境代理 /api -> 后端，生产环境由 Vercel rewrites 处理
  routeRules: {
    '/api/**': {
      proxy: process.env.NUXT_PUBLIC_API_BASE
        ? `${process.env.NUXT_PUBLIC_API_BASE}/api/**`
        : 'http://localhost:3000/api/**'
    }
  },

  app: {
    head: {
      title: '代理商中心',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '品牌代理商管理门户' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    config: {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            gold: {
              50:  '#fdf8f0',
              100: '#faefd9',
              200: '#f4dcad',
              300: '#ecc476',
              400: '#e4a83a',
              500: '#C6A16E',
              600: '#a07845',
              700: '#7c5c35',
              800: '#5e4429',
              900: '#3d2c1a',
            },
            dark: {
              50:  '#3a3a3a',
              100: '#2d2d2d',
              200: '#242424',
              300: '#1e1e1e',
              400: '#1a1a1a',
              500: '#161616',
              600: '#111111',
              700: '#0d0d0d',
              800: '#0a0a0a',
              900: '#050505',
            }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
          },
          boxShadow: {
            'gold': '0 0 20px rgba(198, 161, 110, 0.15)',
            'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)',
          }
        }
      }
    }
  },

  typescript: {
    strict: false,
    shim: false
  },

  ssr: false,

  compatibilityDate: '2024-11-01'
})
