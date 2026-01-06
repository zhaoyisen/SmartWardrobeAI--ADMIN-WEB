<template>
  <div class="admin-user-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>管理端用户管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
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
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
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
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="info" link size="small" @click="handleResetPassword(row)">重置密码</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作栏 -->
      <div v-if="selectedRows.length > 0" class="batch-actions">
        <el-button type="danger" @click="handleBatchDelete">批量删除 ({{ selectedRows.length }})</el-button>
      </div>

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
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            :disabled="!!formData.id"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!formData.id">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <div class="avatar-upload-container">
            <!-- 编辑时显示当前头像 -->
            <div v-if="formData.id && formData.avatar" class="avatar-preview">
              <el-avatar :src="formData.avatar" :size="80" />
              <div class="avatar-tip">当前头像</div>
            </div>
            <!-- 上传组件 -->
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="handleUpload"
              accept="image/*"
              :disabled="uploading"
            >
              <el-avatar v-if="formData.avatar" :src="formData.avatar" :size="80" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              <template #tip>
                <div class="el-upload__tip">
                  {{ formData.id ? '点击重新上传头像' : '点击上传头像' }}
                  <br />
                  支持 jpg/png/gif 格式，文件大小不超过 5MB
                </div>
              </template>
            </el-upload>
          </div>
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
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { adminUserApi } from '@/api/user'
import { storageApi } from '@/api/storage'
import { tokenUtils } from '@/utils/request'
import type { AdminUser, PageParams } from '@/types'

const loading = ref(false)
const tableData = ref<AdminUser[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const selectedRows = ref<AdminUser[]>([])

const pageParams = reactive<PageParams>({
  pageNum: 1,
  pageSize: 10
})

const searchForm = reactive({
  username: '',
  nickname: '',
  status: undefined as number | undefined
})

const formData = reactive<AdminUser>({
  username: '',
  password: '',
  nickname: '',
  avatar: '',
  status: 1
})

const formRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => (formData.id ? '编辑管理端用户' : '新增管理端用户'))

// 上传相关
const uploading = ref(false)

// 自定义上传处理
const handleUpload: UploadProps['beforeUpload'] = async (file) => {
  // 验证文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }

  // 验证文件大小
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }

  // 开始上传
  uploading.value = true
  try {
    const res = await storageApi.uploadFile(file)
    if (res && res.data) {
      const fileData = res.data as any
      if (fileData.fileUrl) {
        formData.avatar = fileData.fileUrl
        ElMessage.success('头像上传成功')
      } else {
        ElMessage.error('上传失败，未获取到文件URL')
      }
    } else {
      ElMessage.error('上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('头像上传失败')
  } finally {
    uploading.value = false
  }

  // 返回 false 阻止默认上传行为（因为我们使用自定义上传）
  return false
}

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...pageParams,
      ...searchForm
    }
    const res = await adminUserApi.getList(params)
    if (res && res.data) {
      const pageData = res.data as any
      tableData.value = pageData.records || []
      total.value = pageData.total || 0
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
  searchForm.username = ''
  searchForm.nickname = ''
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
    id: undefined,
    username: '',
    password: '',
    nickname: '',
    avatar: '',
    status: 1
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row: AdminUser) => {
  try {
    const res = await adminUserApi.getDetail(row.id!)
    if (res && res.data) {
      Object.assign(formData, {
        ...res.data,
        password: '' // 编辑时不显示密码
      })
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

// 切换状态
const handleToggleStatus = async (row: AdminUser) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await adminUserApi.updateStatus(row.id!, newStatus)
    ElMessage.success('状态更新成功')
    fetchData()
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

// 重置密码（重置为默认密码123456）
const handleResetPassword = async (row: AdminUser) => {
  try {
    await ElMessageBox.confirm('确定要将该用户的密码重置为默认密码（123456）吗？', '提示', {
      type: 'warning'
    })
    await adminUserApi.resetPassword(row.id!)
    ElMessage.success('密码已重置为：123456')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
    }
  }
}

// 删除
const handleDelete = async (row: AdminUser) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning'
    })
    await adminUserApi.delete(row.id!)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 选择变化
const handleSelectionChange = (selection: AdminUser[]) => {
  selectedRows.value = selection
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个用户吗？`, '提示', {
      type: 'warning'
    })
    const ids = selectedRows.value.map(row => row.id!).filter(id => id !== undefined)
    await adminUserApi.batchDelete(ids)
    ElMessage.success('批量删除成功')
    selectedRows.value = []
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
        const submitData = { ...formData }
        // 编辑时如果没有修改密码，则不传password字段
        if (formData.id && !submitData.password) {
          delete submitData.password
        }

        if (formData.id) {
          await adminUserApi.update(submitData)
          ElMessage.success('更新成功')
          
          // 如果编辑的是当前登录用户，刷新用户信息
          const currentUser = tokenUtils.getUserInfo()
          if (currentUser && currentUser.id === formData.id) {
            try {
              const res = await adminUserApi.getDetail(formData.id)
              if (res && res.data) {
                const userData = res.data as any
                // 更新 localStorage 中的用户信息
                tokenUtils.setUserInfo({
                  id: userData.id,
                  username: userData.username,
                  nickname: userData.nickname,
                  avatar: userData.avatar
                })
                // 触发自定义事件，通知布局组件刷新用户信息
                window.dispatchEvent(new CustomEvent('userInfoUpdated'))
              }
            } catch (error) {
              console.error('刷新用户信息失败:', error)
            }
          }
        } else {
          await adminUserApi.create(submitData)
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
.admin-user-container {
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

  .batch-actions {
    margin-top: 20px;
    padding: 10px 0;
  }

  .avatar-upload-container {
    display: flex;
    align-items: flex-start;
    gap: 20px;

    .avatar-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .avatar-tip {
        font-size: 12px;
        color: #909399;
      }
    }

    .avatar-uploader {
      :deep(.el-upload) {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.3s;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          border-color: #409eff;
        }
      }

      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
      }

      .el-upload__tip {
        margin-top: 8px;
        font-size: 12px;
        color: #909399;
        line-height: 1.5;
      }
    }
  }
}
</style>

