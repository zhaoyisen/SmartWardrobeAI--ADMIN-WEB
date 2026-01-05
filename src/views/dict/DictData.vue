<template>
  <div class="dict-data-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>字典数据管理</span>
          <div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, Delete } from '@element-plus/icons-vue'
import { dictDataApi, dictTypeApi } from '@/api/dict'
import type { DictData, DictType, PageParams } from '@/types'

const loading = ref(false)
const tableData = ref<DictData[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const dictTypeList = ref<DictType[]>([])
const selectedIds = ref<number[]>([])

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
}
</style>
