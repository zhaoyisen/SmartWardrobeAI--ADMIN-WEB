<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff">
              <el-icon size="30"><Collection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">0</div>
              <div class="stat-label">字典类型</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a">
              <el-icon size="30"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">0</div>
              <div class="stat-label">字典数据</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c">
              <el-icon size="30"><Cpu /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">0</div>
              <div class="stat-label">AI模型</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f56c6c">
              <el-icon size="30"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">0</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统概览</span>
            </div>
          </template>
          <div class="welcome-content">
            <h3>欢迎使用智能衣橱后台管理系统</h3>
            <p>请通过左侧菜单开始使用系统功能</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
// 仪表盘页面
</script>

<style lang="scss" scoped>
.dashboard-container {
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #303133;
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .card-header {
    font-weight: 600;
    color: #303133;
  }

  .welcome-content {
    text-align: center;
    padding: 40px 0;

    h3 {
      font-size: 24px;
      color: #303133;
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      color: #909399;
    }
  }
}
</style>

