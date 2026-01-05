<template>
  <div class="dict-type-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>字典类型管理</span>
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
              新增类型
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="类型名称">
          <el-input v-model="searchForm.dictName" placeholder="请输入类型名称" clearable />
        </el-form-item>
        <el-form-item label="类型编码">
          <el-input v-model="searchForm.dictType" placeholder="请输入类型编码" clearable />
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
        <el-table-column prop="dictName" label="类型名称" min-width="150" />
        <el-table-column prop="dictType" label="类型编码" min-width="150" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
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
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="类型名称" prop="dictName">
          <el-input v-model="formData.dictName" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="类型编码" prop="dictType">
          <el-input
            v-model="formData.dictType"
            placeholder="请输入类型编码（英文，如：clothing_category）"
            :disabled="!!formData.id"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" style="width: 100%" />
          <div class="form-tip">数字越小越靠前</div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
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
import { dictTypeApi } from '@/api/dict'
import type { DictType, PageParams } from '@/types'

const loading = ref(false)
const tableData = ref<DictType[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const selectedIds = ref<number[]>([])

const pageParams = reactive<PageParams>({
  pageNum: 1,
  pageSize: 10
})

const searchForm = reactive({
  dictName: '',
  dictType: '',
  status: undefined as number | undefined
})

const formData = reactive<DictType>({
  dictName: '',
  dictType: '',
  remark: '',
  sort: 0,
  status: 1
})

const formRules: FormRules = {
  dictName: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  dictType: [
    { required: true, message: '请输入类型编码', trigger: 'blur' },
    { pattern: /^[a-z_]+$/, message: '类型编码只能包含小写字母和下划线', trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => (formData.id ? '编辑字典类型' : '新增字典类型'))

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...pageParams,
      ...searchForm
    }
    const res = await dictTypeApi.getPage(params)
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
  searchForm.dictName = ''
  searchForm.dictType = ''
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
const handleSelectionChange = (selection: DictType[]) => {
  selectedIds.value = selection.map((item) => item.id!).filter((id) => id !== undefined)
}

// 状态切换
const handleStatusChange = async (row: DictType) => {
  try {
    await dictTypeApi.updateStatus(row.id!, row.status!)
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
    dictName: '',
    dictType: '',
    remark: '',
    sort: 0,
    status: 1
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row: DictType) => {
  try {
    const res = await dictTypeApi.getDetail(row.id!)
    if (res && res.data) {
      Object.assign(formData, res.data)
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

// 删除
const handleDelete = async (row: DictType) => {
  try {
    await ElMessageBox.confirm('确定要删除该字典类型吗？', '提示', {
      type: 'warning'
    })
    await dictTypeApi.delete(row.id!)
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
    await dictTypeApi.batchDelete(selectedIds.value)
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
          await dictTypeApi.update(formData)
          ElMessage.success('更新成功')
        } else {
          await dictTypeApi.create(formData)
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

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.dict-type-container {
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
  }
}
</style>
