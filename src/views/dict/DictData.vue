<template>
  <div class="dict-data-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>字典数据管理</span>
          <div>
            <el-button
              type="success"
              @click="handleImport"
              style="margin-right: 10px"
            >
              <el-icon><Upload /></el-icon>
              导入数据
            </el-button>
            <el-button
              type="danger"
              :disabled="selectedIds.length === 0"
              @click="handleBatchDelete"
              style="margin-right: 10px"
            >
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增数据
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="字典类型">
          <el-select
            v-model="searchForm.dictTypeId"
            placeholder="请选择字典类型"
            clearable
            style="width: 200px"
            @change="handleSearch"
          >
            <el-option
              v-for="item in dictTypeList"
              :key="item.id"
              :label="item.dictName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型编码">
          <el-input v-model="searchForm.dictType" placeholder="请输入类型编码" clearable />
        </el-form-item>
        <el-form-item label="字典标签">
          <el-input v-model="searchForm.dictLabel" placeholder="请输入字典标签" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
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
        <el-table-column prop="dictType" label="字典类型编码" width="150" />
        <el-table-column prop="dictLabel" label="字典标签" min-width="120" />
        <el-table-column prop="dictValue" label="字典值(英文)" min-width="150" />
        <el-table-column prop="promptText" label="AI提示词" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.promptText || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="120px"
        label-position="right"
      >
        <el-form-item label="字典类型" prop="dictTypeId">
          <el-select
            v-model="formData.dictTypeId"
            placeholder="请选择字典类型"
            style="width: 100%"
            :disabled="!!formData.id"
          >
            <el-option
              v-for="item in dictTypeList"
              :key="item.id"
              :label="item.dictName"
              :value="item.id!"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="formData.dictLabel" placeholder="请输入字典标签，如：连帽衫" />
        </el-form-item>
        <el-form-item label="字典值(英文)" prop="dictValue">
          <el-input
            v-model="formData.dictValue"
            placeholder="请输入字典值/英文，如：hoodie"
          />
          <div class="form-tip">此值将存储在数据库中，用于AI识别</div>
        </el-form-item>
        <el-form-item label="AI提示词(Prompt)" prop="promptText">
          <el-input
            v-model="formData.promptText"
            type="textarea"
            :rows="3"
            placeholder="请输入AI提示词，用于后端拼接AI指令。例如：dictLabel='酒红'时，可输入'dark red, burgundy'"
          />
          <div class="form-tip">
            此字段用于补充AI识别的提示词，多个关键词用逗号分隔。例如：dictLabel="酒红"时，可输入"dark
            red, burgundy"
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" style="width: 100%" />
          <div class="form-tip">数值越小越靠前，决定生成Prompt时的顺序</div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
          <div class="form-tip">禁用后AI Prompt里就不包含这个词</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入字典数据" width="600px" @close="handleImportDialogClose">
      <el-form label-width="120px" label-position="right">
        <el-form-item label="上传文件">
          <el-upload
            ref="uploadRef"
            drag
            :auto-upload="false"
            :limit="1"
            :on-exceed="handleExceed"
            :on-change="handleFileChange"
            :file-list="fileList"
            accept=".xlsx,.xls"
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 Excel 文件（.xlsx, .xls）
                <el-link type="primary" :underline="false" @click.stop="handleDownloadTemplate" style="margin-left: 8px">
                  <el-icon><Download /></el-icon>
                  下载模板
                </el-link>
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="重复策略">
          <el-radio-group v-model="duplicateStrategy">
            <el-radio label="skip">跳过重复（保留原有数据）</el-radio>
            <el-radio label="update">更新重复（覆盖原有数据）</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importing" @click="handleImportSubmit">开始导入</el-button>
      </template>
    </el-dialog>

    <!-- 导入结果对话框 -->
    <el-dialog v-model="resultDialogVisible" title="导入结果" width="900px">
      <div class="import-result-summary">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="总记录数">{{ importResult?.totalCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="成功数量">
            <span style="color: #67c23a">{{ importResult?.successCount || 0 }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="失败数量">
            <span style="color: #f56c6c">{{ importResult?.failCount || 0 }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-tabs v-model="resultTab" style="margin-top: 20px">
        <el-tab-pane label="成功列表" name="success">
          <el-table
            :data="importResult?.successList || []"
            border
            stripe
            max-height="400"
            v-if="importResult?.successList && importResult.successList.length > 0"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="rowNum" label="行号" width="80" align="center" />
            <el-table-column prop="dictType" label="字典类型编码" width="150" />
            <el-table-column prop="dictLabel" label="字典标签" min-width="120" />
            <el-table-column prop="dictValue" label="字典值" min-width="150" />
            <el-table-column prop="operation" label="操作类型" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.operation === '新增' ? 'success' : 'warning'">
                  {{ row.operation }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无成功记录" />
        </el-tab-pane>
        <el-tab-pane label="失败列表" name="fail">
          <el-table
            :data="importResult?.failList || []"
            border
            stripe
            max-height="400"
            v-if="importResult?.failList && importResult.failList.length > 0"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="rowNum" label="行号" width="80" align="center" />
            <el-table-column prop="dictType" label="字典类型编码" width="150" />
            <el-table-column prop="dictLabel" label="字典标签" min-width="120" />
            <el-table-column prop="dictValue" label="字典值" min-width="150" />
            <el-table-column prop="errorMessage" label="失败原因" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <span style="color: #f56c6c">{{ row.errorMessage }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无失败记录" />
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button type="primary" @click="resultDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadInstance, type UploadFile } from 'element-plus'
import { Plus, Search, Refresh, Delete, Download, Upload } from '@element-plus/icons-vue'
import { dictDataApi, dictTypeApi } from '@/api/dict'
import type { DictData, DictType, PageParams, DictDataImportResultVO } from '@/types'

const loading = ref(false)
const tableData = ref<DictData[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const dictTypeList = ref<DictType[]>([])
const selectedIds = ref<number[]>([])

// 导入相关
const importDialogVisible = ref(false)
const resultDialogVisible = ref(false)
const importing = ref(false)
const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadFile[]>([])
const selectedFile = ref<File | null>(null)
const duplicateStrategy = ref('skip')
const importResult = ref<DictDataImportResultVO | null>(null)
const resultTab = ref('success')

const pageParams = reactive<PageParams>({
  pageNum: 1,
  pageSize: 10
})

const searchForm = reactive({
  dictTypeId: undefined as number | undefined,
  dictType: '',
  dictLabel: '',
  status: undefined as number | undefined
})

const formData = reactive<DictData>({
  dictTypeId: 0,
  dictLabel: '',
  dictValue: '',
  promptText: '',
  sort: 0,
  status: 1
})

const formRules: FormRules = {
  dictTypeId: [{ required: true, message: '请选择字典类型', trigger: 'change' }],
  dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
}

const dialogTitle = computed(() => (formData.id ? '编辑字典数据' : '新增字典数据'))

// 获取字典类型列表
const fetchDictTypeList = async () => {
  try {
    // 使用分页查询获取所有启用的字典类型
    const res = await dictTypeApi.getPage({
      pageNum: 1,
      pageSize: 1000,
      status: 1
    })
    if (res.data) {
      dictTypeList.value = res.data.records || []
    }
  } catch (error) {
    console.error('获取字典类型列表失败:', error)
  }
}

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...pageParams,
      ...searchForm
    }
    const res = await dictDataApi.getPage(params)
    if (res && res.data) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageParams.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.dictTypeId = undefined
  searchForm.dictType = ''
  searchForm.dictLabel = ''
  searchForm.status = undefined
  handleSearch()
}

// 分页变化
const handleSizeChange = () => {
  fetchData()
}

const handlePageChange = () => {
  fetchData()
}

// 选择变化
const handleSelectionChange = (selection: DictData[]) => {
  selectedIds.value = selection.map((item) => item.id!).filter((id) => id !== undefined)
}

// 状态切换
const handleStatusChange = async (row: DictData) => {
  try {
    await dictDataApi.updateStatus(row.id!, row.status!)
    ElMessage.success('状态修改成功')
    fetchData()
  } catch (error) {
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
    console.error('状态修改失败:', error)
  }
}

// 新增
const handleAdd = () => {
  Object.assign(formData, {
    dictTypeId: 0,
    dictLabel: '',
    dictValue: '',
    promptText: '',
    sort: 0,
    status: 1
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row: DictData) => {
  try {
    const res = await dictDataApi.getDetail(row.id!)
    if (res && res.data) {
      Object.assign(formData, res.data)
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

// 删除
const handleDelete = async (row: DictData) => {
  try {
    await ElMessageBox.confirm('确定要删除该字典数据吗？', '提示', {
      type: 'warning'
    })
    await dictDataApi.delete(row.id!)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条数据吗？`, '提示', {
      type: 'warning'
    })
    await dictDataApi.batchDelete(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (formData.id) {
          await dictDataApi.update(formData)
          ElMessage.success('更新成功')
        } else {
          await dictDataApi.create(formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error('保存失败:', error)
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 下载模板
const handleDownloadTemplate = async () => {
  try {
    const response = await dictDataApi.downloadTemplate()
    // 对于blob响应，response 是 AxiosResponse，response.data 是 Blob 对象
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
    
    // 从响应头获取文件名，如果没有则使用默认文件名
    const contentDisposition = response.headers?.['content-disposition'] || ''
    let filename = '字典数据导入模板.xlsx'
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
    ElMessage.success('模板下载成功')
  } catch (error: any) {
    console.error('下载模板失败:', error)
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

// 打开导入对话框
const handleImport = () => {
  importDialogVisible.value = true
}

// 文件选择变化
const handleFileChange = (file: UploadFile) => {
  selectedFile.value = file.raw || null
}

// 文件超出限制
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件，请先删除已有文件')
}

// 导入对话框关闭
const handleImportDialogClose = () => {
  fileList.value = []
  selectedFile.value = null
  duplicateStrategy.value = 'skip'
  uploadRef.value?.clearFiles()
}

// 提交导入
const handleImportSubmit = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  importing.value = true
  try {
    const res = await dictDataApi.importData(selectedFile.value, duplicateStrategy.value)
    if (res && res.data) {
      importResult.value = res.data
      importDialogVisible.value = false
      resultDialogVisible.value = true
      resultTab.value = res.data.failCount && res.data.failCount > 0 ? 'fail' : 'success'
      
      // 如果有成功导入的数据，刷新列表
      if (res.data.successCount && res.data.successCount > 0) {
        fetchData()
      }
      
      ElMessage.success(`导入完成：成功 ${res.data.successCount || 0} 条，失败 ${res.data.failCount || 0} 条`)
    }
  } catch (error) {
    console.error('导入失败:', error)
  } finally {
    importing.value = false
  }
}

onMounted(async () => {
  await fetchDictTypeList()
  fetchData()
})
</script>

<style lang="scss" scoped>
.dict-data-container {
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

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.5;
  }

  .import-result-summary {
    margin-bottom: 20px;
  }
}
</style>
