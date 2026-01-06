import request from '@/utils/request'
import type { Result, DashboardVO } from '@/types'

/**
 * 仪表盘相关API
 */
export const dashboardApi = {
  // 获取仪表盘统计数据
  getStatistics: () => {
    return request.get<Result<DashboardVO>>('/api/admin/dashboard/statistics')
  }
}

