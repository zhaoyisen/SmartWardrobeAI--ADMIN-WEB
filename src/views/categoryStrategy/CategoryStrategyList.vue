<template>
  <div class="category-strategy-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>品类策略配置</span>
          <div>
            <el-button
              type="success"
              @click="handleRefreshCache"
              :loading="cacheRefreshing"
              style="margin-right: 10px"
            >
              <el-icon><Refresh /></el-icon>
              刷新缓存
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
              新增策略
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="品类代码">
          <el-input v-model="searchForm.categoryCode" placeholder="请输入品类代码" clearable />
        </el-form-item>
        <el-form-item label="中文描述">
          <el-input v-model="searchForm.categoryDesc" placeholder="请输入中文描述" clearable />
        </el-form-item>
        <el-form-item label="部位">
          <el-select v-model="searchForm.region" placeholder="请选择部位" clearable style="width: 150px">
            <el-option
              v-for="item in regionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="层级">
          <el-select v-model="searchForm.layer" placeholder="请选择层级" clearable style="width: 150px">
            <el-option
              v-for="item in layerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
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
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="categoryCode" label="品类代码" min-width="120" />
        <el-table-column prop="categoryDesc" label="中文描述" min-width="120" />
        <el-table-column prop="regionLabel" label="部位" width="100" />
        <el-table-column prop="layerLabel" label="层级" width="100" />
        <el-table-column prop="sort" label="排序" width="80" align="center" sortable="custom" />
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
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">查看</el-button>
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
        <el-form-item label="品类代码" prop="categoryCode">
          <el-input
            v-model="formData.categoryCode"
            placeholder="请输入品类代码（如：T-shirt）"
            :disabled="!!formData.id"
          />
          <div class="form-tip">品类代码唯一，新增后可编辑</div>
        </el-form-item>
        <el-form-item label="中文描述" prop="categoryDesc">
          <el-input v-model="formData.categoryDesc" placeholder="请输入中文描述（如：T恤）" />
        </el-form-item>
        <el-form-item label="部位" prop="region">
          <el-select
            v-model="formData.region"
            placeholder="请选择部位"
            style="width: 100%"
            :loading="regionLoading"
          >
            <el-option
              v-for="item in regionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="层级" prop="layer">
          <el-select
            v-model="formData.layer"
            placeholder="请选择层级"
            style="width: 100%"
            :loading="layerLoading"
          >
            <el-option
              v-for="item in layerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" style="width: 100%" />
          <div class="form-tip">数字越小越靠前</div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情查看对话框 -->
    <el-dialog v-model="detailDialogVisible" title="品类策略详情" width="700px">
      <div class="detail-dialog-content" v-if="currentDetailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="品类代码">{{ currentDetailData.categoryCode }}</el-descriptions-item>
          <el-descriptions-item label="中文描述">{{ currentDetailData.categoryDesc }}</el-descriptions-item>
          <el-descriptions-item label="部位">{{ currentDetailData.regionLabel || currentDetailData.region }}</el-descriptions-item>
          <el-descriptions-item label="层级">{{ currentDetailData.layerLabel || currentDetailData.layer }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ currentDetailData.sort || 0 }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentDetailData.status === 1 ? 'success' : 'danger'">
              {{ currentDetailData.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ currentDetailData.remark || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ currentDetailData.createTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">
            {{ currentDetailData.updateTime || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, Delete } from '@element-plus/icons-vue'
import { categoryStrategyApi } from '@/api/categoryStrategy'
import { dictDataApi } from '@/api/dict'
import type { CategoryStrategyVO, CategoryStrategySaveDTO, PageParams, DictDropdownOption } from '@/types'

const loading = ref(false)
const tableData = ref<CategoryStrategyVO[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const selectedIds = ref<number[]>([])
const currentDetailData = ref<CategoryStrategyVO | null>(null)
const regionOptions = ref<DictDropdownOption[]>([])
const layerOptions = ref<DictDropdownOption[]>([])
const regionLoading = ref(false)
const layerLoading = ref(false)
const cacheRefreshing = ref(false)

const pageParams = reactive<PageParams>({
  pageNum: 1,
  pageSize: 10
})

const searchForm = reactive({
  categoryCode: '',
  categoryDesc: '',
  region: '',
  layer: '',
  status: undefined as number | undefined,
  sortField: 'sort', // 排序字段
  isAsc: true // 是否升序
})

const formData = reactive<CategoryStrategySaveDTO>({
  categoryCode: '',
  categoryDesc: '',
  region: '',
  layer: '',
  sort: 0,
  status: 1,
  remark: ''
})

const formRules: FormRules = {
  categoryCode: [
    { required: true, message: '请输入品类代码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9-_]+$/, message: '品类代码只能包含字母、数字、连字符和下划线', trigger: 'blur' }
  ],
  categoryDesc: [
    { required: true, message: '请输入中文描述', trigger: 'blur' },
    { max: 50, message: '中文描述不能超过50个字符', trigger: 'blur' }
  ],
  region: [{ required: true, message: '请选择部位', trigger: 'change' }],
  layer: [{ required: true, message: '请选择层级', trigger: 'change' }]
}

const dialogTitle = computed(() => (formData.id ? '编辑品类策略' : '新增品类策略'))

// 获取部位字典选项
const fetchRegionOptions = async () => {
  regionLoading.value = true
  try {
    const res = await dictDataApi.getListByType('clothing_region')
    if (res && res.data) {
      regionOptions.value = res.data
    }
  } catch (error) {
    console.error('获取部位字典失败:', error)
  } finally {
    regionLoading.value = false
  }
}

// 获取层级字典选项
const fetchLayerOptions = async () => {
  layerLoading.value = true
  try {
    const res = await dictDataApi.getListByType('clothing_layer')
    if (res && res.data) {
      layerOptions.value = res.data
    }
  } catch (error) {
    console.error('获取层级字典失败:', error)
  } finally {
    layerLoading.value = false
  }
}

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...pageParams,
      categoryCode: searchForm.categoryCode,
      categoryDesc: searchForm.categoryDesc,
      region: searchForm.region,
      layer: searchForm.layer,
      status: searchForm.status,
      sortField: searchForm.sortField,
      isAsc: searchForm.isAsc
    }
    const res = await categoryStrategyApi.getList(params)
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
  searchForm.categoryCode = ''
  searchForm.categoryDesc = ''
  searchForm.region = ''
  searchForm.layer = ''
  searchForm.status = undefined
  searchForm.sortField = 'sort'
  searchForm.isAsc = true
  handleSearch()
}

// 排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  if (prop === 'sort') {
    if (order === 'ascending') {
      searchForm.sortField = 'sort'
      searchForm.isAsc = true
    } else if (order === 'descending') {
      searchForm.sortField = 'sort'
      searchForm.isAsc = false
    } else {
      // 取消排序，恢复默认
      searchForm.sortField = 'sort'
      searchForm.isAsc = true
    }
    pageParams.pageNum = 1
    fetchData()
  }
}

// 分页变化
const handleSizeChange = () => {
  fetchData()
}

const handlePageChange = () => {
  fetchData()
}

// 选择变化
const handleSelectionChange = (selection: CategoryStrategyVO[]) => {
  selectedIds.value = selection.map((item) => item.id!).filter((id) => id !== undefined)
}

// 状态切换
const handleStatusChange = async (row: CategoryStrategyVO) => {
  try {
    await categoryStrategyApi.updateStatus(row.id!, row.status!)
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
    id: undefined,
    categoryCode: '',
    categoryDesc: '',
    region: '',
    layer: '',
    sort: 0,
    status: 1,
    remark: ''
  })
  // 确保字典选项已加载
  if (regionOptions.value.length === 0) {
    fetchRegionOptions()
  }
  if (layerOptions.value.length === 0) {
    fetchLayerOptions()
  }
  dialogVisible.value = true
}

// 查看详情
const handleViewDetail = async (row: CategoryStrategyVO) => {
  try {
    const res = await categoryStrategyApi.getDetail(row.id!)
    if (res && res.data) {
      currentDetailData.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

// 编辑
const handleEdit = async (row: CategoryStrategyVO) => {
  try {
    const res = await categoryStrategyApi.getDetail(row.id!)
    if (res && res.data) {
      const data = res.data
      Object.assign(formData, {
        id: data.id,
        categoryCode: data.categoryCode || '',
        categoryDesc: data.categoryDesc || '',
        region: data.region || '',
        layer: data.layer || '',
        sort: data.sort || 0,
        status: data.status !== undefined ? data.status : 1,
        remark: data.remark || ''
      })
      // 确保字典选项已加载
      if (regionOptions.value.length === 0) {
        fetchRegionOptions()
      }
      if (layerOptions.value.length === 0) {
        fetchLayerOptions()
      }
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

// 删除
const handleDelete = async (row: CategoryStrategyVO) => {
  try {
    await ElMessageBox.confirm('确定要删除该品类策略吗？', '提示', {
      type: 'warning'
    })
    await categoryStrategyApi.delete(row.id!)
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
    await categoryStrategyApi.batchDelete(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

// 刷新缓存
const handleRefreshCache = async () => {
  try {
    cacheRefreshing.value = true
    await categoryStrategyApi.refreshCache()
    ElMessage.success('缓存刷新成功')
  } catch (error) {
    console.error('刷新缓存失败:', error)
  } finally {
    cacheRefreshing.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (formData.id) {
          await categoryStrategyApi.update(formData)
          ElMessage.success('更新成功')
        } else {
          await categoryStrategyApi.create(formData)
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
  fetchRegionOptions()
  fetchLayerOptions()
  fetchData()
})
</script>

<style lang="scss" scoped>
.category-strategy-container {
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

  .detail-dialog-content {
    padding: 10px 0;
  }
}
</style>

