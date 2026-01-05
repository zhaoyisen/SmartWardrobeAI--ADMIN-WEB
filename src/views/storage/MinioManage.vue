<template>
  <div class="storage-manage-container">
    <!-- 存储统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff">
              <el-icon size="30"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ storageStats.totalFiles || 0 }}</div>
              <div class="stat-label">文件总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a">
              <el-icon size="30"><FolderOpened /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ storageStats.totalSizeFormatted || '0 B' }}</div>
              <div class="stat-label">存储总量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c">
              <el-icon size="30"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ storageStats.bucketName || '-' }}</div>
              <div class="stat-label">存储桶名称</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 文件列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文件管理</span>
          <div>
            <el-button type="primary" @click="fetchStorageStats">
              <el-icon><Refresh /></el-icon>
              刷新统计
            </el-button>
            <el-button
              type="danger"
              :disabled="selectedFiles.length === 0"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除 ({{ selectedFiles.length }})
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="文件名">
          <el-input
            v-model="searchForm.fileName"
            placeholder="请输入文件名（模糊查询）"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="文件类型">
          <el-input
            v-model="searchForm.fileType"
            placeholder="如：.jpg"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="存储平台">
          <el-select v-model="searchForm.platform" placeholder="请选择" clearable style="width: 120px">
            <el-option label="MinIO" value="minio" />
            <el-option label="七牛云" value="qiniu" />
            <el-option label="阿里云" value="aliyun" />
            <el-option label="本地" value="local" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传人">
          <el-input
            v-model="searchForm.createBy"
            placeholder="请输入上传人标识"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="查看模式">
          <el-select v-model="searchForm.viewMode" placeholder="请选择" style="width: 150px">
            <el-option label="数据库记录" value="db" />
            <el-option label="MinIO实时文件" value="minio" />
            <el-option label="两者都显示" value="both" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传时间">
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 360px"
            @change="handleTimeRangeChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="filePath" label="存储路径" min-width="250" show-overflow-tooltip />
        <el-table-column prop="fileSizeFormatted" label="文件大小" width="120" align="center">
          <template #default="{ row }">
            <span>{{ row.fileSizeFormatted || formatFileSize(row.fileSize || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fileType" label="文件类型" width="100" align="center" />
        <el-table-column prop="platform" label="存储平台" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.platform === 'minio'" type="primary" size="small">MinIO</el-tag>
            <el-tag v-else-if="row.platform === 'qiniu'" type="success" size="small">七牛云</el-tag>
            <el-tag v-else-if="row.platform === 'aliyun'" type="warning" size="small">阿里云</el-tag>
            <el-tag v-else-if="row.platform === 'local'" type="info" size="small">本地</el-tag>
            <span v-else>{{ row.platform || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="上传人" width="120" align="center" />
        <el-table-column prop="fileHash" label="文件哈希" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.fileHash || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="上传时间" width="180" />
        <el-table-column
          v-if="searchForm.viewMode === 'both' || searchForm.viewMode === 'minio'"
          label="状态"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag v-if="row.existsInMinio" type="success" size="small">存在</el-tag>
            <el-tag v-else type="danger" size="small">不存在</el-tag>
            <el-tag
              v-if="row.accessible"
              type="success"
              size="small"
              style="margin-left: 4px"
            >
              可访问
            </el-tag>
            <el-tag v-else-if="row.existsInMinio" type="warning" size="small" style="margin-left: 4px">
              不可访问
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handlePreview(row)">预览</el-button>
            <el-button type="success" link size="small" @click="handleDownload(row)">下载</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pageParams.pageNum"
          v-model:page-size="pageParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storageApi } from '@/api/storage'
import type { StorageFileVO, StorageFileQueryDTO, PageParams } from '@/types'

const loading = ref(false)
const tableData = ref<StorageFileVO[]>([])
const selectedFiles = ref<StorageFileVO[]>([])
const total = ref(0)
const timeRange = ref<[string, string] | null>(null)

const storageStats = reactive({
  totalFiles: 0,
  totalSize: 0,
  totalSizeFormatted: '0 B',
  bucketName: ''
})

const pageParams = reactive<PageParams>({
  pageNum: 1,
  pageSize: 10
})

const searchForm = reactive<StorageFileQueryDTO>({
  pageNum: 1,
  pageSize: 10,
  fileName: '',
  fileType: '',
  platform: '',
  createBy: '',
  startTime: '',
  endTime: '',
  viewMode: 'db'
})

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 时间范围变化处理
const handleTimeRangeChange = (value: [string, string] | null) => {
  if (value && value.length === 2) {
    searchForm.startTime = value[0]
    searchForm.endTime = value[1]
  } else {
    searchForm.startTime = ''
    searchForm.endTime = ''
  }
}

// 获取存储统计
const fetchStorageStats = async () => {
  try {
    const res = await storageApi.getStatistics()
    if (res && res.data) {
      const data = res.data
      storageStats.totalFiles = data.totalFiles || 0
      storageStats.totalSize = data.totalSize || 0
      storageStats.totalSizeFormatted = data.totalSizeFormatted || formatFileSize(data.totalSize || 0)
      storageStats.bucketName = data.bucketName || ''
    }
  } catch (error) {
    console.error('获取存储统计失败:', error)
    // 401 等错误已经在响应拦截器中处理，这里只记录日志
  }
}

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: StorageFileQueryDTO = {
      ...pageParams,
      ...searchForm
    }
    const res = await storageApi.pageQuery(params)
    if (res && res.data) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    // 401 等错误已经在响应拦截器中处理，这里只显示通用错误提示
    // ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageParams.pageNum = 1
  searchForm.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.fileName = ''
  searchForm.fileType = ''
  searchForm.platform = ''
  searchForm.createBy = ''
  searchForm.startTime = ''
  searchForm.endTime = ''
  searchForm.viewMode = 'db'
  timeRange.value = null
  handleSearch()
}

// 分页变化
const handleSizeChange = () => {
  pageParams.pageNum = 1
  searchForm.pageNum = 1
  fetchData()
}

const handlePageChange = () => {
  searchForm.pageNum = pageParams.pageNum
  fetchData()
}

// 选择变化
const handleSelectionChange = (selection: StorageFileVO[]) => {
  selectedFiles.value = selection
}

// 预览文件
const handlePreview = async (row: StorageFileVO) => {
  if (!row.id) {
    ElMessage.warning('文件ID不存在')
    return
  }
  try {
    const res = await storageApi.getPreviewUrl(row.id, 3600)
    if (res && res.data) {
      const previewUrl = res.data.previewUrl
      if (previewUrl) {
        window.open(previewUrl, '_blank')
      } else {
        ElMessage.warning('获取预览URL失败')
      }
    }
  } catch (error) {
    console.error('获取预览URL失败:', error)
    // 错误信息已在响应拦截器中显示
  }
}

// 下载文件
const handleDownload = async (row: StorageFileVO) => {
  if (!row.id) {
    ElMessage.warning('文件ID不存在')
    return
  }
  try {
    const response = await storageApi.downloadFile(row.id)
    // 对于blob响应，response 是 AxiosResponse，response.data 是 Blob 对象
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
    
    // 从响应头获取文件名，如果没有则使用数据库中的文件名
    const contentDisposition = response.headers?.['content-disposition'] || ''
    let filename = row.fileName || 'download'
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''))
      }
    }
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('下载成功')
  } catch (error: any) {
    console.error('下载失败:', error)
    // 如果错误响应是blob（可能是错误信息），尝试读取
    if (error.response && error.response.data instanceof Blob) {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const errorText = JSON.parse(reader.result as string)
          ElMessage.error(errorText.message || '下载失败')
        } catch {
          ElMessage.error('下载失败')
        }
      }
      reader.readAsText(error.response.data)
    } else {
      ElMessage.error(error.message || '下载失败')
    }
  }
}

// 删除
const handleDelete = async (row: StorageFileVO) => {
  if (!row.id) {
    ElMessage.warning('文件ID不存在')
    return
  }
  try {
    await ElMessageBox.confirm('确定要删除该文件吗？删除后无法恢复！', '提示', {
      type: 'warning'
    })
    await storageApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchData()
    fetchStorageStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请选择要删除的文件')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？删除后无法恢复！`,
      '提示',
      {
        type: 'warning'
      }
    )
    const ids = selectedFiles.value.map((file) => file.id!).filter((id) => id !== undefined)
    const res = await storageApi.batchDelete(ids)
    if (res && res.data) {
      const result = res.data
      if (result.failCount && result.failCount > 0) {
        ElMessage.warning(
          `批量删除完成，成功 ${result.successCount} 个，失败 ${result.failCount} 个`
        )
      } else {
        ElMessage.success(`批量删除成功，共删除 ${result.successCount} 个文件`)
      }
    } else {
      ElMessage.success('批量删除成功')
    }
    selectedFiles.value = []
    fetchData()
    fetchStorageStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

onMounted(() => {
  fetchStorageStats()
  fetchData()
})
</script>

<style lang="scss" scoped>
.storage-manage-container {
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
          font-size: 24px;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: #303133;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
