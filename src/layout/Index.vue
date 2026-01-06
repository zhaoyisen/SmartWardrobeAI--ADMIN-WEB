<template>
  <el-container class="layout-container">
    <el-aside width="240px" class="layout-aside">
      <div class="logo">
        <h2>智能衣橱</h2>
        <p>后台管理系统</p>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="layout-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-sub-menu index="/dict">
          <template #title>
            <el-icon><Collection /></el-icon>
            <span>数据字典管理</span>
          </template>
          <el-menu-item index="/dict/type">字典类型管理</el-menu-item>
          <el-menu-item index="/dict/data">字典数据管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/ai-model">
          <el-icon><Cpu /></el-icon>
          <span>AI模型配置</span>
        </el-menu-item>
        <el-sub-menu index="/user">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/user/admin">管理端用户</el-menu-item>
          <el-menu-item index="/user/app">App端用户</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/storage">
          <el-icon><FolderOpened /></el-icon>
          <span>存储管理</span>
        </el-menu-item>
        <el-menu-item index="/category-strategy">
          <el-icon><Grid /></el-icon>
          <span>品类策略配置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar 
                :src="avatarUrl" 
                :size="32" 
                class="user-avatar"
                fit="cover"
              >
                <el-icon><User /></el-icon>
              </el-avatar>
              <span>{{ userInfo?.nickname || userInfo?.username || '管理员' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { tokenUtils } from '@/utils/request'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

const currentTitle = computed(() => {
  return route.meta?.title || '后台管理'
})

// 用户信息
const userInfo = ref<any>(null)

// 计算头像URL，确保有效
const avatarUrl = computed(() => {
  if (!userInfo.value) return undefined
  const avatar = userInfo.value.avatar
  if (avatar && typeof avatar === 'string' && avatar.trim()) {
    return avatar.trim()
  }
  return undefined
})

// 获取用户信息
const loadUserInfo = () => {
  const info = tokenUtils.getUserInfo()
  if (info) {
    userInfo.value = info
  }
}

onMounted(() => {
  loadUserInfo()
  
  // 监听自定义事件，当用户信息更新时自动刷新
  window.addEventListener('userInfoUpdated', loadUserInfo)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('userInfoUpdated', loadUserInfo)
})

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    })
    // 清除认证信息
    tokenUtils.clearAuth()
    // 跳转到登录页
    router.push('/login')
  } catch (error: any) {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #304156;
  overflow: hidden;

  .logo {
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    background-color: #2b3a4a;
    border-bottom: 1px solid #1f2d3d;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    p {
      margin: 0;
      font-size: 12px;
      color: #8898aa;
    }
  }

  .layout-menu {
    border-right: none;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }
}

.layout-header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .header-left {
    flex: 1;
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #606266;

      .user-avatar {
        flex-shrink: 0;
      }

      &:hover {
        color: #409eff;
      }
    }
  }
}

.layout-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>

