<template>
  <div class="ai-model-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AI模型配置</span>
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
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增模型
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="Model Key">
          <el-input v-model="searchForm.modelKey" placeholder="请输入Model Key" clearable />
        </el-form-item>
        <el-form-item label="展示名称">
          <el-input v-model="searchForm.label" placeholder="请输入展示名称" clearable />
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
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="modelKey" label="Model Key" min-width="120" />
        <el-table-column prop="label" label="展示名称" min-width="120" />
        <el-table-column prop="modelName" label="API调用名称" min-width="150" />
        <el-table-column prop="baseUrl" label="Base URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="apiKey" label="API Key" min-width="200" align="center">
          <template #default="{ row }">
            <div class="api-key-cell">
              <span 
                class="api-key-text" 
                @click="copyApiKey(row.apiKey)"
                :title="visibleApiKeys[row.id!] ? '点击复制' : '点击复制（已脱敏）'"
              >
                {{ getMaskedApiKey(row.apiKey, row.id) }}
              </span>
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="toggleApiKeyVisibility(row.id!)"
                :icon="visibleApiKeys[row.id!] ? Hide : View"
                title="显示/隐藏"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="supportThinking" label="支持思考模式" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.supportThinking ? 'success' : 'info'">
              {{ row.supportThinking ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="defaultEnableThinking" label="默认开启思考" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.defaultEnableThinking ? 'success' : 'info'">
              {{ row.defaultEnableThinking ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="maxThinkingBudget" label="最大Token数" width="120" align="center">
          <template #default="{ row }">
            <span>{{ row.maxThinkingBudget || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="defaultThinkingBudget" label="默认Token数" width="120" align="center">
          <template #default="{ row }">
            <span>{{ row.defaultThinkingBudget || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" sortable />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
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
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="140px"
        label-position="right"
      >
        <el-form-item label="Model Key" prop="modelKey">
          <el-input
            v-model="formData.modelKey"
            placeholder="前端传参标识，如：qwen-plus"
            :disabled="!!formData.id"
          />
          <div class="form-tip">前端调用时的标识符，建议使用小写字母和连字符</div>
        </el-form-item>
        <el-form-item label="展示名称" prop="label">
          <el-input v-model="formData.label" placeholder="前端展示的名字，如：通义千问Plus" />
          <div class="form-tip">在前端界面显示的模型名称</div>
        </el-form-item>
        <el-form-item label="API调用名称" prop="modelName">
          <el-input v-model="formData.modelName" placeholder="实际调用ID，如：qwen-plus" />
          <div class="form-tip">实际调用AI服务时的模型ID</div>
        </el-form-item>
        <el-form-item label="Base URL" prop="baseUrl">
          <el-input v-model="formData.baseUrl" placeholder="如：https://api.openai.com/v1" />
          <div class="form-tip">API服务的基础URL地址</div>
        </el-form-item>
        <el-form-item label="API Key" prop="apiKey">
          <div class="api-key-input-wrapper">
            <el-input
              v-model="formData.apiKey"
              :type="showFormApiKey ? 'text' : 'password'"
              :placeholder="formData.id && originalApiKey ? '如需修改请重新输入完整API Key' : '请输入API Key'"
              :show-word-limit="false"
            />
            <el-button
              type="primary"
              link
              size="small"
              @click="showFormApiKey = !showFormApiKey"
              :icon="showFormApiKey ? Hide : View"
              title="显示/隐藏"
            />
          </div>
          <div class="form-tip">
            <span v-if="formData.id && originalApiKey" style="color: #909399;">
              当前已保存API Key，点击眼睛图标可查看完整值
            </span>
            <span v-else>API密钥</span>
          </div>
        </el-form-item>
        <el-divider content-position="left">思考模式配置</el-divider>
        <el-form-item label="支持思考模式" prop="supportThinking">
          <el-switch v-model="formData.supportThinking" />
          <div class="form-tip">是否支持思考模式（Thinking Mode）</div>
        </el-form-item>
        <el-form-item
          label="默认开启思考模式"
          prop="defaultEnableThinking"
          v-if="formData.supportThinking"
        >
          <el-switch v-model="formData.defaultEnableThinking" />
          <div class="form-tip">当支持思考模式时，默认是否开启</div>
        </el-form-item>
        <el-form-item
          label="最大Token数"
          prop="maxThinkingBudget"
          v-if="formData.supportThinking"
        >
          <el-input-number
            v-model="formData.maxThinkingBudget"
            :min="0"
            :max="1000000"
            style="width: 100%"
            placeholder="请输入最大Token数"
          />
          <div class="form-tip">
            <span style="color: #f56c6c">重要：</span>思考模式的风控阈值，防止费用爆炸。超过此值将拒绝请求
          </div>
        </el-form-item>
        <el-form-item
          label="默认Token数"
          prop="defaultThinkingBudget"
          v-if="formData.supportThinking"
        >
          <el-input-number
            v-model="formData.defaultThinkingBudget"
            :min="0"
            :max="1000000"
            style="width: 100%"
            placeholder="请输入默认Token数"
          />
          <div class="form-tip">若前端未传思考Token数，将使用此默认值</div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            :min="0"
            :max="9999"
            style="width: 100%"
            placeholder="请输入排序值"
          />
          <div class="form-tip">数字越小越靠前，用于控制模型列表的显示顺序</div>
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
    <el-dialog v-model="detailDialogVisible" title="AI模型详情" width="800px">
      <div class="detail-dialog-content" v-if="currentDetailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模型Key">{{ currentDetailData.modelKey }}</el-descriptions-item>
          <el-descriptions-item label="展示名称">{{ currentDetailData.label }}</el-descriptions-item>
          <el-descriptions-item label="API调用名称">{{ currentDetailData.modelName }}</el-descriptions-item>
          <el-descriptions-item label="Base URL" :span="2">
            <span style="word-break: break-all;">{{ currentDetailData.baseUrl }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="API Key" :span="2">
            <div class="api-key-display">
              <el-input
                :value="currentDetailData.apiKey || ''"
                readonly
                :type="showDetailApiKey ? 'text' : 'password'"
                class="api-key-display-input"
                @click="copyApiKey(currentDetailData.apiKey || '')"
                style="cursor: pointer;"
                title="点击复制"
              />
              <el-button
                type="primary"
                @click="showDetailApiKey = !showDetailApiKey"
                :icon="showDetailApiKey ? Hide : View"
              >
                {{ showDetailApiKey ? '隐藏' : '显示' }}
              </el-button>
              <el-button
                type="primary"
                @click="copyApiKey(currentDetailData.apiKey || '')"
                :icon="DocumentCopy"
              >
                复制
              </el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="支持思考模式">
            <el-tag :type="currentDetailData.supportThinking ? 'success' : 'info'">
              {{ currentDetailData.supportThinking ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="默认开启思考">
            <el-tag :type="currentDetailData.defaultEnableThinking ? 'success' : 'info'">
              {{ currentDetailData.defaultEnableThinking ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最大Token数">
            {{ currentDetailData.maxThinkingBudget || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="默认Token数">
            {{ currentDetailData.defaultThinkingBudget || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="排序">{{ currentDetailData.sort || 0 }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentDetailData.status === 1 ? 'success' : 'danger'">
              {{ currentDetailData.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ currentDetailData.createTime || '-' }}
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
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { View, Hide, DocumentCopy, Refresh } from '@element-plus/icons-vue'
import { aiModelApi } from '@/api/aiModel'
import type { AiModel, PageParams } from '@/types'

const loading = ref(false)
const tableData = ref<AiModel[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const originalApiKey = ref<string>('') // 保存原始API Key，用于判断是否修改
const showFormApiKey = ref(false) // 表单中API Key是否显示
const visibleApiKeys = ref<Record<number, boolean>>({}) // 列表中每行API Key的显示状态
const detailDialogVisible = ref(false) // 详情查看对话框
const currentDetailData = ref<AiModel | null>(null) // 当前查看的详情数据
const showDetailApiKey = ref(false) // 详情对话框中API Key是否显示
const cacheRefreshing = ref(false)

const pageParams = reactive<PageParams>({
  pageNum: 1,
  pageSize: 10
})

const searchForm = reactive({
  modelKey: '',
  label: '',
  status: undefined as number | undefined
})

const formData = reactive<AiModel>({
  modelKey: '',
  label: '',
  modelName: '',
  baseUrl: '',
  apiKey: '',
  supportThinking: false,
  defaultEnableThinking: false,
  maxThinkingBudget: undefined,
  defaultThinkingBudget: undefined,
  sort: 0,
  status: 1,
  remark: ''
})

const formRules: FormRules = {
  modelKey: [
    { required: true, message: '请输入Model Key', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: 'Model Key只能包含小写字母、数字和连字符', trigger: 'blur' }
  ],
  label: [
    { required: true, message: '请输入展示名称', trigger: 'blur' },
    { max: 50, message: '展示名称不能超过50个字符', trigger: 'blur' }
  ],
  modelName: [{ required: true, message: '请输入API调用名称', trigger: 'blur' }],
  baseUrl: [
    { required: true, message: '请输入Base URL', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  apiKey: [
    {
      validator: (rule, value, callback) => {
        // 编辑时，允许不修改（无论原始值是否存在）
        // 判断是否是编辑模式：如果有 id，说明是编辑模式
        if (formData.id) {
          // 编辑模式下，无论值是否为空，都允许通过
          callback()
          return
        }
        // 新增时必填
        const val = (value || formData.apiKey || '').trim()
        if (!val) {
          callback(new Error('API Key不能为空'))
          return
        }
        callback()
      },
      trigger: ['blur', 'change']
    }
  ],
  maxThinkingBudget: [
    {
      validator: (rule, value, callback) => {
        if (formData.supportThinking && (!value || value <= 0)) {
          callback(new Error('启用思考模式时，必须设置最大Token数'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  defaultThinkingBudget: [
    {
      validator: (rule, value, callback) => {
        if (formData.supportThinking && formData.defaultEnableThinking && (!value || value <= 0)) {
          callback(new Error('默认开启思考模式时，必须设置默认Token数'))
        } else if (value && formData.maxThinkingBudget && value > formData.maxThinkingBudget) {
          callback(new Error('默认Token数不能大于最大Token数'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  sort: [
    { type: 'number', message: '排序值必须是数字', trigger: 'blur' },
    { type: 'number', min: 0, max: 9999, message: '排序值范围：0-9999', trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => (formData.id ? '编辑AI模型' : '新增AI模型'))

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...pageParams,
      ...searchForm
    }
    const res = await aiModelApi.getList(params)
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
  searchForm.modelKey = ''
  searchForm.label = ''
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

// 新增
const handleAdd = () => {
  Object.assign(formData, {
    id: undefined, // 清除id，确保Model Key可以编辑
    modelKey: '',
    label: '',
    modelName: '',
    baseUrl: '',
    apiKey: '',
    supportThinking: false,
    defaultEnableThinking: false,
    maxThinkingBudget: undefined,
    defaultThinkingBudget: undefined,
    sort: 0,
    status: 1,
    remark: ''
  })
  originalApiKey.value = ''
  showFormApiKey.value = false // 重置显示状态
  dialogVisible.value = true
}

// 查看详情
const handleViewDetail = async (row: AiModel) => {
  try {
    const res = await aiModelApi.getDetail(row.id!)
    if (res && res.data) {
      currentDetailData.value = res.data
      showDetailApiKey.value = true // 默认显示API Key
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

// 编辑
const handleEdit = async (row: AiModel) => {
  try {
    const res = await aiModelApi.getDetail(row.id!)
    if (res && res.data) {
      const data = res.data
      // 编辑时使用接口返回的完整数据，API Key保存完整值
      originalApiKey.value = data.apiKey || ''
      Object.assign(formData, {
        ...data,
        apiKey: data.apiKey || '' // 保存完整的API Key值
      })
      showFormApiKey.value = false // 默认隐藏（使用password类型）
      dialogVisible.value = true
      // 清除所有验证错误，确保编辑时不会因为之前的验证而报错
      nextTick(() => {
        formRef.value?.clearValidate()
      })
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

// 切换状态
const handleToggleStatus = async (row: AiModel) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await aiModelApi.updateStatus(row.id!, newStatus)
    ElMessage.success('状态更新成功')
    fetchData()
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

// 删除
const handleDelete = async (row: AiModel) => {
  try {
    await ElMessageBox.confirm('确定要删除该AI模型吗？', '提示', {
      type: 'warning'
    })
    await aiModelApi.delete(row.id!)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 刷新缓存
const handleRefreshCache = async () => {
  try {
    cacheRefreshing.value = true
    await aiModelApi.refreshCache()
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

  // 编辑模式下，先清除API Key的验证错误，然后验证其他字段
  if (formData.id) {
    // 清除 apiKey 的验证错误
    formRef.value.clearValidate('apiKey')
    await nextTick()
    
    // 验证除 apiKey 外的所有字段（逐个验证）
    const fieldsToValidate = ['modelKey', 'label', 'modelName', 'baseUrl', 'maxThinkingBudget', 'defaultThinkingBudget', 'sort']
    let allValid = true
    
    for (const field of fieldsToValidate) {
      try {
        await formRef.value.validateField(field)
      } catch {
        allValid = false
      }
    }
    
    if (allValid) {
      await handleFormSubmit()
    }
    return
  }

  // 新增模式下，验证所有字段（包括 apiKey）
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      await handleFormSubmit()
    }
  })
}

// 处理表单提交逻辑
const handleFormSubmit = async () => {
  // 如果支持思考模式但未设置最大Token数，提示错误
  if (formData.supportThinking && (!formData.maxThinkingBudget || formData.maxThinkingBudget <= 0)) {
    ElMessage.warning('启用思考模式时，必须设置最大Token数')
    return
  }

  // 如果支持思考模式但默认开启思考，需要确保有最大Token数限制
  if (formData.supportThinking && formData.defaultEnableThinking) {
    if (!formData.maxThinkingBudget || formData.maxThinkingBudget <= 0) {
      ElMessage.warning('默认开启思考模式时，必须设置最大Token数')
      return
    }
    // 如果默认开启思考模式，必须设置默认Token数
    if (!formData.defaultThinkingBudget || formData.defaultThinkingBudget <= 0) {
      ElMessage.warning('默认开启思考模式时，必须设置默认Token数')
      return
    }
    // 默认Token数不能超过最大Token数
    if (formData.defaultThinkingBudget > formData.maxThinkingBudget) {
      ElMessage.warning('默认Token数不能大于最大Token数')
      return
    }
  }

  try {
    const submitData = { ...formData }
    
    // 编辑时处理API Key
    if (formData.id) {
      const currentApiKey = (submitData.apiKey || '').trim()
      const originalKey = (originalApiKey.value || '').trim()
      
      // 如果当前值为空且原始值也为空，移除该字段（不更新）
      if (!currentApiKey && !originalKey) {
        delete submitData.apiKey
      }
      // 如果当前值等于原始值，说明没有修改，移除该字段（不更新）
      else if (currentApiKey === originalKey) {
        delete submitData.apiKey
      }
      // 如果输入了新值（不等于原始值），则提交新值（包括从有值改为空，或从空改为有值）
      // 注意：如果新值为空字符串，需要明确设置为空字符串，而不是删除字段
    }

    if (formData.id) {
      // 更新时，id 包含在 submitData 中
      await aiModelApi.update(submitData)
      ElMessage.success('更新成功')
    } else {
      await aiModelApi.create(submitData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  // 重置表单数据，确保id被清除
  Object.assign(formData, {
    id: undefined,
    modelKey: '',
    label: '',
    modelName: '',
    baseUrl: '',
    apiKey: '',
    supportThinking: false,
    defaultEnableThinking: false,
    maxThinkingBudget: undefined,
    defaultThinkingBudget: undefined,
    sort: 0,
    status: 1,
    remark: ''
  })
  originalApiKey.value = ''
  showFormApiKey.value = false
}

// 脱敏显示API Key
const getMaskedApiKey = (apiKey: string | undefined, id: number | undefined): string => {
  if (!apiKey) return '-'
  if (id && visibleApiKeys.value[id]) {
    return apiKey
  }
  // 脱敏显示：保留前3位和后4位，中间用*代替
  if (apiKey.length <= 7) {
    return '******'
  }
  return apiKey.substring(0, 3) + '******' + apiKey.substring(apiKey.length - 4)
}

// 切换API Key显示/隐藏
const toggleApiKeyVisibility = (id: number) => {
  visibleApiKeys.value[id] = !visibleApiKeys.value[id]
}


// 复制API Key
const copyApiKey = (apiKey: string | undefined) => {
  if (!apiKey) {
    ElMessage.warning('API Key为空')
    return
  }
  navigator.clipboard.writeText(apiKey).then(() => {
    ElMessage.success('API Key已复制到剪贴板')
  }).catch(() => {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = apiKey
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('API Key已复制到剪贴板')
  })
}


onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.ai-model-container {
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

  .api-key-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    .api-key-text {
      flex: 1;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      word-break: break-all;
      cursor: pointer;
      color: #409eff;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .api-key-input-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;

    :deep(.el-input) {
      flex: 1;
    }

    .api-key-input-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }
  }

  .detail-dialog-content {
    .api-key-display {
      display: flex;
      gap: 8px;
      align-items: center;

      .api-key-display-input {
        flex: 1;
      }
    }
  }
}
</style>

