import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { tokenUtils } from '@/utils/request'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/Index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'dict',
        name: 'Dict',
        redirect: '/dict/type',
        meta: { title: '数据字典管理', icon: 'Collection' },
        children: [
          {
            path: 'type',
            name: 'DictType',
            component: () => import('@/views/dict/DictType.vue'),
            meta: { title: '字典类型管理' }
          },
          {
            path: 'data',
            name: 'DictData',
            component: () => import('@/views/dict/DictData.vue'),
            meta: { title: '字典数据管理' }
          }
        ]
      },
      {
        path: 'ai-model',
        name: 'AiModel',
        component: () => import('@/views/aiModel/AiModelList.vue'),
        meta: { title: 'AI模型配置', icon: 'Cpu' }
      },
      {
        path: 'user',
        name: 'User',
        redirect: '/user/admin',
        meta: { title: '用户管理', icon: 'User' },
        children: [
          {
            path: 'admin',
            name: 'AdminUser',
            component: () => import('@/views/user/AdminUser.vue'),
            meta: { title: '管理端用户' }
          },
          {
            path: 'app',
            name: 'AppUser',
            component: () => import('@/views/user/AppUser.vue'),
            meta: { title: 'App端用户' }
          }
        ]
      },
      {
        path: 'storage',
        name: 'Storage',
        component: () => import('@/views/storage/MinioManage.vue'),
        meta: { title: '存储管理', icon: 'FolderOpened' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：检查登录状态
router.beforeEach((to, _from, next) => {
  const token = tokenUtils.getToken()
  
  // 如果已登录且访问登录页，跳转到首页
  if (to.path === '/login' && token) {
    next('/')
    return
  }
  
  // 如果需要认证且没有token，跳转到登录页
  // 排除登录页本身，避免循环跳转
  if (to.path !== '/login' && to.meta.requiresAuth !== false && !token) {
    next('/login')
    return
  }
  
  next()
})

export default router

