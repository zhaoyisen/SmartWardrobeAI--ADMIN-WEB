<template>
  <div class="dashboard-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 主要内容 -->
    <template v-else>
      <!-- 基础统计卡片区域 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                <el-icon size="30"><Collection /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(dashboardData?.basicStatistics?.dictTypeCount) }}</div>
                <div class="stat-label">字典类型</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                <el-icon size="30"><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(dashboardData?.basicStatistics?.dictDataCount) }}</div>
                <div class="stat-label">字典数据</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                <el-icon size="30"><Cpu /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(dashboardData?.basicStatistics?.aiModelCount) }}</div>
                <div class="stat-label">AI模型</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
                <el-icon size="30"><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(dashboardData?.basicStatistics?.totalUserCount) }}</div>
                <div class="stat-label">用户总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
                <el-icon size="30"><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(dashboardData?.basicStatistics?.sysUserCount) }}</div>
                <div class="stat-label">管理端用户</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%)">
                <el-icon size="30"><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(dashboardData?.basicStatistics?.appUserCount) }}</div>
                <div class="stat-label">App端用户</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)">
                <el-icon size="30"><Box /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(dashboardData?.basicStatistics?.clothingCount) }}</div>
                <div class="stat-label">衣物总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
                <el-icon size="30"><FolderOpened /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(dashboardData?.basicStatistics?.fileCount) }}</div>
                <div class="stat-label">文件总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 数据趋势图表区域 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :span="24">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>数据趋势</span>
                <el-radio-group v-model="trendDays" size="small" @change="updateTrendChart">
                  <el-radio-button :label="7">最近7天</el-radio-button>
                  <el-radio-button :label="30">最近30天</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="trendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 分类统计和最近操作区域 -->
      <el-row :gutter="20" class="middle-row">
        <!-- 分类统计 -->
        <el-col :xs="24" :sm="24" :md="12" :lg="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>按部位统计</span>
              </div>
            </template>
            <div ref="regionChartRef" class="chart-container-small"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>按品类统计</span>
              </div>
            </template>
            <div ref="categoryChartRef" class="chart-container-small"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>按季节统计</span>
              </div>
            </template>
            <div ref="seasonChartRef" class="chart-container-small"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 最近操作记录和统计信息区域 -->
      <el-row :gutter="20" class="bottom-row">
        <!-- 最近操作记录 -->
        <el-col :xs="24" :sm="24" :md="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>最近操作记录</span>
              </div>
            </template>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="最近衣物" name="clothing">
                <el-table
                  :data="dashboardData?.recentActivities?.recentClothing || []"
                  style="width: 100%"
                  :show-header="true"
                  empty-text="暂无数据"
                >
                  <el-table-column prop="name" label="衣物名称" min-width="120" />
                  <el-table-column prop="region" label="部位" width="80" />
                  <el-table-column prop="category" label="品类" width="80" />
                  <el-table-column prop="username" label="用户" width="100" />
                  <el-table-column prop="createTime" label="创建时间" width="160">
                    <template #default="{ row }">
                      {{ formatDateTime(row.createTime) }}
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="最近用户" name="users">
                <el-table
                  :data="dashboardData?.recentActivities?.recentUsers || []"
                  style="width: 100%"
                  :show-header="true"
                  empty-text="暂无数据"
                >
                  <el-table-column prop="username" label="用户名" min-width="120" />
                  <el-table-column prop="email" label="邮箱" min-width="150" />
                  <el-table-column prop="phone" label="手机号" width="120" />
                  <el-table-column prop="createTime" label="注册时间" width="160">
                    <template #default="{ row }">
                      {{ formatDateTime(row.createTime) }}
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>

        <!-- 存储信息和用户活跃度 -->
        <el-col :xs="24" :sm="24" :md="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>系统信息</span>
              </div>
            </template>
            <div class="info-section">
              <div class="info-item">
                <div class="info-label">存储信息</div>
                <div class="info-content">
                  <div class="info-row">
                    <span class="info-key">总文件数：</span>
                    <span class="info-value">{{ formatNumber(dashboardData?.storageInfo?.totalFiles) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-key">总大小：</span>
                    <span class="info-value">{{ dashboardData?.storageInfo?.totalSizeFormatted || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-key">存储桶：</span>
                    <span class="info-value">{{ dashboardData?.storageInfo?.bucketName || '-' }}</span>
                  </div>
                </div>
              </div>
              <el-divider />
              <div class="info-item">
                <div class="info-label">用户活跃度</div>
                <div class="info-content">
                  <div class="info-row">
                    <span class="info-key">日活用户：</span>
                    <span class="info-value highlight">{{ formatNumber(dashboardData?.userActivity?.dailyActiveUsers) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-key">月活用户：</span>
                    <span class="info-value highlight">{{ formatNumber(dashboardData?.userActivity?.monthlyActiveUsers) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { dashboardApi } from '@/api/dashboard'
import type { DashboardVO, TrendDataVO, CategoryStatsVO, Result } from '@/types'
import dayjs from 'dayjs'

// 数据状态
const loading = ref(true)
const dashboardData = ref<DashboardVO | null>(null)
const trendDays = ref(7)
const activeTab = ref('clothing')

// 图表引用
const trendChartRef = ref<HTMLDivElement | null>(null)
const regionChartRef = ref<HTMLDivElement | null>(null)
const categoryChartRef = ref<HTMLDivElement | null>(null)
const seasonChartRef = ref<HTMLDivElement | null>(null)

// 图表实例
let trendChart: echarts.ECharts | null = null
let regionChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let seasonChart: echarts.ECharts | null = null

// 窗口大小调整监听器
let resizeObserver: ResizeObserver | null = null

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    const response = await dashboardApi.getStatistics() as unknown as Result<DashboardVO>
    if (response.code === 200 && response.data) {
      dashboardData.value = response.data
      await nextTick()
      initCharts()
    }
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) {
    // 如果 ref 还没有准备好，延迟初始化
    setTimeout(() => {
      if (trendChartRef.value && !trendChart) {
        initTrendChart()
      }
    }, 100)
    return
  }

  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      trendChart?.resize()
    })
  }
  
  updateTrendChart()
}

// 更新趋势图表
const updateTrendChart = () => {
  // 如果图表还没有初始化，先初始化
  if (!trendChart) {
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
    } else {
      return
    }
  }

  const trendData = trendDays.value === 7 
    ? dashboardData.value?.trendData7Days || []
    : dashboardData.value?.trendData30Days || []

  const dates = trendData.map((item: TrendDataVO) => item.dateStr || item.date || '')
  const clothingData = trendData.map((item: TrendDataVO) => item.clothingCount || 0)
  const userData = trendData.map((item: TrendDataVO) => item.userCount || 0)
  const fileData = trendData.map((item: TrendDataVO) => item.fileCount || 0)

  // 如果数据为空，显示空状态
  if (trendData.length === 0 || dates.length === 0) {
    const option: echarts.EChartsOption = {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#909399',
          fontSize: 16
        }
      },
      xAxis: {
        type: 'category',
        show: false
      },
      yAxis: {
        type: 'value',
        show: false
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    }
    trendChart.setOption(option, true)
    return
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['新增衣物', '新增用户', '新增文件'],
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增衣物',
        type: 'line',
        smooth: true,
        data: clothingData,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        data: userData,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '新增文件',
        type: 'line',
        smooth: true,
        data: fileData,
        itemStyle: { color: '#e6a23c' }
      }
    ]
  }

  trendChart.setOption(option, true)
}

// 初始化分类统计图表
const initCategoryChart = (
  chartRef: HTMLDivElement | null,
  chartInstance: echarts.ECharts | null,
  data: CategoryStatsVO[] | undefined,
  chartName: string
) => {
  if (!chartRef || !data || data.length === 0) {
    if (chartInstance) {
      chartInstance.setOption({
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#909399',
            fontSize: 14
          }
        }
      })
    }
    return chartInstance
  }

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef)
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      data: data.map((item: CategoryStatsVO) => item.name || '')
    },
    series: [
      {
        name: chartName,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}\n({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: data.map((item: CategoryStatsVO) => ({
          value: item.count || 0,
          name: item.name || ''
        }))
      }
    ]
  }

  chartInstance.setOption(option)
  return chartInstance
}

// 初始化所有图表
const initCharts = () => {
  // 使用 nextTick 确保 DOM 已经渲染
  nextTick(() => {
    initTrendChart()
    
    regionChart = initCategoryChart(
      regionChartRef.value,
      regionChart,
      dashboardData.value?.categoryStatistics?.regionStats,
      '按部位统计'
    ) || regionChart

    categoryChart = initCategoryChart(
      categoryChartRef.value,
      categoryChart,
      dashboardData.value?.categoryStatistics?.categoryStats,
      '按品类统计'
    ) || categoryChart

    seasonChart = initCategoryChart(
      seasonChartRef.value,
      seasonChart,
      dashboardData.value?.categoryStatistics?.seasonStats,
      '按季节统计'
    ) || seasonChart

    // 监听窗口大小变化
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        trendChart?.resize()
        regionChart?.resize()
        categoryChart?.resize()
        seasonChart?.resize()
      })

      if (trendChartRef.value) resizeObserver.observe(trendChartRef.value)
      if (regionChartRef.value) resizeObserver.observe(regionChartRef.value)
      if (categoryChartRef.value) resizeObserver.observe(categoryChartRef.value)
      if (seasonChartRef.value) resizeObserver.observe(seasonChartRef.value)
    }
  })
}

// 格式化数字
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return '0'
  return num.toLocaleString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (dateTime: string | undefined): string => {
  if (!dateTime) return '-'
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
}

// 组件挂载
onMounted(() => {
  loadData()
})

// 组件卸载前清理
onBeforeUnmount(() => {
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
  if (regionChart) {
    regionChart.dispose()
    regionChart = null
  }
  if (categoryChart) {
    categoryChart.dispose()
    categoryChart = null
  }
  if (seasonChart) {
    seasonChart.dispose()
    seasonChart = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  window.removeEventListener('resize', () => {
    trendChart?.resize()
  })
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;

  .loading-container {
    padding: 20px;
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .chart-row,
  .middle-row,
  .bottom-row {
    margin-top: 20px;
  }

  .stat-card {
    margin-bottom: 20px;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-4px);
    }

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
        flex-shrink: 0;
      }

      .stat-info {
        flex: 1;
        min-width: 0;

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #303133;
          line-height: 1;
          margin-bottom: 8px;
          word-break: break-all;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: #303133;
  }

  .chart-container {
    width: 100%;
    height: 400px;
  }

  .chart-container-small {
    width: 100%;
    height: 300px;
  }

  .info-section {
    .info-item {
      .info-label {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
      }

      .info-content {
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .info-key {
            color: #606266;
            font-size: 14px;
          }

          .info-value {
            color: #303133;
            font-size: 14px;
            font-weight: 500;

            &.highlight {
              color: #409eff;
              font-size: 16px;
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;

    .stat-card {
      .stat-content {
        .stat-icon {
          width: 50px;
          height: 50px;

          .el-icon {
            font-size: 24px;
          }
        }

        .stat-info {
          .stat-value {
            font-size: 24px;
          }
        }
      }
    }

    .chart-container {
      height: 300px;
    }

    .chart-container-small {
      height: 250px;
    }
  }
}
</style>
