<template>
  <div class="app-user-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>App端用户管理</span>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="searchForm.nickname" placeholder="请输入昵称" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="注册来源">
          <el-select
            v-model="searchForm.registerSource"
            placeholder="请选择注册来源"
            clearable
            style="width: 150px"
          >
            <el-option label="手机号" value="phone" />
            <el-option label="微信" value="wechat" />
            <el-option label="QQ" value="qq" />
            <el-option label="其他" value="other" />
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
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120">
          <template #default="{ row }">
            <span>{{ row.username || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="120">
          <template #default="{ row }">
            <span>{{ row.nickname || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130">
          <template #default="{ row }">
            <span>{{ row.phone || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.email || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.gender === 1" type="primary">男</el-tag>
            <el-tag v-else-if="row.gender === 2" type="danger">女</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="registerSource" label="注册来源" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ getRegisterSourceLabel(row.registerSource) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="180" />
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '封禁' : '解封' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pageParams.page"
          v-model:page-size="pageParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑App端用户"
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
        <el-form-item label="用户名">
          <el-input v-model="formData.username" placeholder="用户名（可选）" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio :label="0">未知</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="formData.birthday"
            type="date"
            placeholder="请选择生日"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">封禁</el-radio>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { appUserApi } from '@/api/user'
import type { AppUser, PageParams } from '@/types'

const loading = ref(false)
const tableData = ref<AppUser[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const pageParams = reactive<PageParams>({
  page: 1,
  pageSize: 10
})

const searchForm = reactive({
  username: '',
  nickname: '',
  phone: '',
  status: undefined as number | undefined,
  registerSource: ''
})

const formData = reactive<AppUser>({
  nickname: '',
  phone: '',
  email: '',
  gender: 0,
  birthday: '',
  status: 1
})

const formRules: FormRules = {
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 获取注册来源标签
const getRegisterSourceLabel = (source?: string) => {
  const map: Record<string, string> = {
    phone: '手机号',
    wechat: '微信',
    qq: 'QQ',
    other: '其他'
  }
  return source ? map[source] || source : '-'
}

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...pageParams,
      ...searchForm
    }
    const res = await appUserApi.getList(params)
    if (res && res.data) {
      // 兼容两种数据结构：res.data.list 或 res.data.data.list
      const data = res.data.data || res.data
      tableData.value = data.list || []
      total.value = data.total || 0
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageParams.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.nickname = ''
  searchForm.phone = ''
  searchForm.status = undefined
  searchForm.registerSource = ''
  handleSearch()
}

// 分页变化
const handleSizeChange = () => {
  fetchData()
}

const handlePageChange = () => {
  fetchData()
}

// 编辑
const handleEdit = async (row: AppUser) => {
  try {
    const res = await appUserApi.getDetail(row.id!)
    if (res && res.data) {
      Object.assign(formData, res.data?.data || res.data || {})
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

// 切换状态（封禁/解封）
const handleToggleStatus = async (row: AppUser) => {
  try {
    const action = row.status === 1 ? '封禁' : '解封'
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
      type: 'warning'
    })
    const newStatus = row.status === 1 ? 0 : 1
    await appUserApi.updateStatus(row.id!, newStatus)
    ElMessage.success(`${action}成功`)
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('更新状态失败:', error)
    }
  }
}

// 删除
const handleDelete = async (row: AppUser) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？删除后数据无法恢复！', '提示', {
      type: 'warning'
    })
    await appUserApi.delete(row.id!)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid && formData.id) {
      try {
        await appUserApi.update(formData.id, formData)
        ElMessage.success('更新成功')
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
.app-user-container {
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

