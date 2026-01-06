/**
 * 数据字典类型
 */
export interface DictType {
  id?: number
  dictType: string // 字典类型编码
  dictName: string // 字典类型名称
  remark?: string // 备注
  sort?: number // 排序
  status?: number // 状态 0-禁用 1-启用
  createTime?: string
  updateTime?: string
}

/**
 * 字典数据
 */
export interface DictData {
  id?: number
  dictTypeId: number // 字典类型ID
  dictType?: string // 字典类型编码
  dictLabel: string // 字典标签（中文展示名）
  dictValue: string // 字典值（存储键值/英文）
  promptText?: string // AI提示词（关键字段）
  sort?: number // 排序
  status?: number // 状态 0-禁用 1-启用
  createTime?: string
  updateTime?: string
}

/**
 * 字典下拉选项
 */
export interface DictDropdownOption {
  value: string // 值
  label: string // 标签
  promptText?: string // AI提示词（字典数据时可选）
}

/**
 * AI模型配置
 */
export interface AiModel {
  id?: number
  modelKey: string // Model Key (前端传参标识)
  label?: string // 模型前端展示名字
  modelName: string // Model Name (实际调用ID/API调用名字)
  baseUrl: string // Base URL (调用地址)
  apiKey?: string // API Key
  supportThinking: boolean // 是否支持思考模式 1支持，0不支持
  maxThinkingBudget?: number // 最大允许的思考Token数（风控限制）
  defaultEnableThinking: boolean // 默认是否开启思考模式
  defaultThinkingBudget?: number // 默认Token数（若前端未传，默认Token数）
  sort?: number // 排序
  status: number // 状态 0-禁用 1-启用
  remark?: string // 备注
  createTime?: string
  updateTime?: string
}

/**
 * 分页请求参数
 */
export interface PageParams {
  pageNum: number
  pageSize: number
}

/**
 * 分页响应（匹配后端 PageResult）
 */
export interface PageResult<T> {
  records: T[]
  total: number
  pages: number
  current: number
  size: number
}

/**
 * 管理端用户（sys_user表）
 */
export interface AdminUser {
  id?: number
  username: string // 用户名（唯一）
  password?: string // 密码（新增/编辑时使用，BCrypt加密）
  nickname?: string // 昵称
  avatar?: string // 头像URL
  status: number // 状态 0-禁用 1-启用
  createTime?: string
  updateTime?: string
}

/**
 * App端用户（users表）
 */
export interface AppUser {
  id?: number
  username?: string // 昵称
  email?: string // 邮箱（唯一，登录凭证）
  phone?: string // 手机号（唯一，登录凭证）
  avatarUrl?: string // 头像URL（后端字段：avatar_url）
  height?: number // 身高（cm）
  weight?: number // 体重（kg）
  status: number // 状态 0-禁用 1-启用
  createTime?: string
  updateTime?: string
}

/**
 * 【后台】存储文件信息VO
 */
export interface StorageFileVO {
  id?: number
  fileName?: string // 原始文件名
  filePath?: string // 文件存储路径(OSS Key)
  fileUrl?: string // 完整访问URL(快照)
  fileSize?: number // 文件大小（字节）
  fileSizeFormatted?: string // 格式化后的文件大小（如：1.00 MB）
  fileType?: string // 文件扩展名
  platform?: string // 存储平台(minio/qiniu/aliyun/local)
  createBy?: string // 上传人标识
  fileHash?: string // 文件内容哈希(MD5)
  createTime?: string
  updateTime?: string
  existsInMinio?: boolean // 是否存在于MinIO（仅viewMode为both或minio时返回）
  accessible?: boolean // 文件是否可访问（仅viewMode为both或minio时返回）
}

/**
 * 【后台】存储文件分页查询参数
 */
export interface StorageFileQueryDTO extends PageParams {
  sortField?: string // 排序字段
  isAsc?: boolean // 是否升序，默认false
  fileName?: string // 文件名（模糊查询）
  fileType?: string // 文件类型（精确匹配）
  platform?: string // 存储平台
  createBy?: string // 上传人标识
  startTime?: string // 开始时间（格式：yyyy-MM-dd HH:mm:ss）
  endTime?: string // 结束时间（格式：yyyy-MM-dd HH:mm:ss）
  viewMode?: string // 查看模式：db（数据库记录）、minio（MinIO实时文件）、both（两者都显示），默认db
}

/**
 * 【后台】存储统计信息VO
 */
export interface StorageStatisticsVO {
  totalFiles?: number // 总文件数
  totalSize?: number // 总大小（字节）
  totalSizeFormatted?: string // 格式化后的总大小（如：1.00 GB）
  bucketName?: string // 存储桶名称
}

/**
 * 文件预览URL信息
 */
export interface FilePreviewVO {
  previewUrl?: string // 临时预览URL（带签名）
  expiresAt?: string // URL过期时间（ISO 8601格式）
}

/**
 * 批量删除结果VO
 */
export interface BatchDeleteResultVO {
  successCount?: number // 成功删除的数量
  failCount?: number // 失败的数量
  failIds?: number[] // 删除失败的文件ID列表
}

/**
 * @deprecated 使用 StorageFileVO 替代
 * MinIO文件信息（保留以向后兼容）
 */
export interface MinioFile {
  id?: number
  fileName: string // 文件名
  originalName: string // 原始文件名
  filePath: string // 文件路径
  bucketName: string // 存储桶名称
  fileSize: number // 文件大小（字节）
  contentType?: string // 文件类型
  userId?: number // 关联用户ID
  userType?: string // 用户类型（admin/app）
  status?: number // 状态
  createTime?: string
}

/**
 * @deprecated 不再使用
 * MinIO存储桶统计（保留以向后兼容）
 */
export interface MinioBucketStats {
  bucketName: string
  fileCount: number
  totalSize: number // 总大小（字节）
  formatSize?: string // 格式化大小（如：1.5GB）
}

/**
 * 后端统一响应格式（对应Java的Result）
 */
export interface Result<T = any> {
  code: number
  message: string
  data: T
}

/**
 * API响应（兼容Result，别名）
 */
export type ApiResponse<T = any> = Result<T>

/**
 * 登录请求DTO
 */
export interface AdminLoginDTO {
  username: string
  password: string
}

/**
 * 登录响应VO
 */
export interface AdminLoginVO {
  token: string
  id: number
  username: string
  nickname?: string
  avatar?: string
}

/**
 * 趋势数据VO
 */
export interface TrendDataVO {
  date?: string // 日期（LocalDate）
  dateStr?: string // 日期字符串（用于前端展示）
  clothingCount?: number // 新增衣物数
  userCount?: number // 新增用户数
  fileCount?: number // 新增文件数
}

/**
 * 分类统计VO
 */
export interface CategoryStatsVO {
  name?: string // 分类名称
  value?: string // 分类值
  count?: number // 数量
  percentage?: number // 占比（百分比）
}

/**
 * 最近衣物VO
 */
export interface RecentClothingVO {
  id?: number // 衣物ID
  name?: string // 衣物名称
  region?: string // 部位
  category?: string // 品类
  userId?: number // 用户ID
  username?: string // 用户名
  createTime?: string // 创建时间（LocalDateTime）
}

/**
 * 最近用户VO
 */
export interface RecentUserVO {
  id?: number // 用户ID
  username?: string // 用户名
  email?: string // 邮箱
  phone?: string // 手机号
  createTime?: string // 注册时间（LocalDateTime）
}

/**
 * 基础统计
 */
export interface BasicStatistics {
  dictTypeCount?: number // 字典类型数
  dictDataCount?: number // 字典数据数
  aiModelCount?: number // AI模型数
  totalUserCount?: number // 用户总数（管理端+App端）
  sysUserCount?: number // 管理端用户数
  appUserCount?: number // App端用户数
  clothingCount?: number // 衣物总数
  fileCount?: number // 文件总数
}

/**
 * 分类统计
 */
export interface CategoryStatistics {
  regionStats?: CategoryStatsVO[] // 按部位统计
  categoryStats?: CategoryStatsVO[] // 按品类统计
  seasonStats?: CategoryStatsVO[] // 按季节统计
}

/**
 * 最近操作记录
 */
export interface RecentActivities {
  recentClothing?: RecentClothingVO[] // 最近新增的衣物（最多10条）
  recentUsers?: RecentUserVO[] // 最近注册的用户（最多10条）
}

/**
 * 用户活跃度
 */
export interface UserActivity {
  dailyActiveUsers?: number // 日活（当天有操作的用户数）
  monthlyActiveUsers?: number // 月活（最近30天有操作的用户数）
}

/**
 * 仪表盘统计数据VO
 */
export interface DashboardVO {
  basicStatistics?: BasicStatistics // 基础统计
  trendData7Days?: TrendDataVO[] // 数据趋势（最近7天）
  trendData30Days?: TrendDataVO[] // 数据趋势（最近30天）
  categoryStatistics?: CategoryStatistics // 衣物分类统计
  recentActivities?: RecentActivities // 最近操作记录
  storageInfo?: StorageStatisticsVO // 存储信息
  userActivity?: UserActivity // 用户活跃度
}

