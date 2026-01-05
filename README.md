# 智能衣橱后台管理系统

基于 Vue3 + TypeScript + Element Plus 构建的现代化后台管理系统。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Element Plus** - 基于 Vue 3 的组件库
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue 的状态管理库
- **Axios** - HTTP 客户端

## 功能模块

### 1. 数据字典管理（核心业务引擎）

- **字典类型管理**
  - 定义维度（如：clothing_category、clothing_color、clothing_season、clothing_fit）
  - 支持新增、编辑、删除、查询
  - 状态管理（启用/禁用）

- **字典数据管理**
  - 定义具体的选项值
  - 核心字段：
    - `label`：中文展示名（如："连帽衫"）
    - `value`：存储键值/英文（如："hoodie"）
    - `promptText`：AI提示词（关键字段，用于后端拼接AI指令）
    - `sort`：排序（决定生成Prompt时的顺序）
    - `status`：状态（禁用后AI Prompt里就不包含这个词）

### 2. AI模型配置中心

- **模型列表管理**
  - 展示所有接入的大模型（Qwen、GPT、DeepSeek 等）
  - 支持新增、编辑、删除、启用/禁用

- **模型配置**
  - 基础信息：Model Key、Model Name、Base URL
  - 凭证管理：API Key（加密存储，支持重置）
  - 思考模式配置：
    - 是否支持思考模式（supportThinking）
    - 默认是否开启思考模式（defaultEnableThinking）
    - **最大Token数（maxThinkingBudget）**：思考模式的风控阈值，防止费用爆炸

## 项目结构

```
smart-wardrobe-admin-web/
├── src/
│   ├── api/              # API接口定义
│   │   ├── dict.ts       # 数据字典API
│   │   └── aiModel.ts    # AI模型配置API
│   ├── assets/           # 静态资源
│   ├── layout/           # 布局组件
│   │   └── Index.vue     # 主布局
│   ├── router/           # 路由配置
│   │   └── index.ts
│   ├── types/            # TypeScript类型定义
│   │   └── index.ts
│   ├── utils/            # 工具函数
│   │   └── request.ts    # Axios请求封装
│   ├── views/            # 页面组件
│   │   ├── Dashboard.vue # 仪表盘
│   │   ├── Login.vue     # 登录页
│   │   ├── dict/         # 数据字典模块
│   │   │   ├── DictType.vue    # 字典类型管理
│   │   │   └── DictData.vue    # 字典数据管理
│   │   └── aiModel/      # AI模型配置模块
│   │       └── AiModelList.vue # AI模型列表
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── index.html            # HTML模板
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── vite.config.ts        # Vite配置
└── README.md             # 项目说明
```

## 安装与运行

### 前置要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0 或 pnpm >= 7.0.0

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

项目将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 预览生产构建

```bash
npm run preview
# 或
yarn preview
# 或
pnpm preview
```

## 开发说明

### API 接口

项目中的 API 请求默认代理到 `http://localhost:8080`，可在 `vite.config.ts` 中修改。

### 环境变量

可在项目根目录创建 `.env` 文件配置环境变量：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 类型定义

所有 TypeScript 类型定义在 `src/types/index.ts` 中，包括：

- `DictType`：字典类型
- `DictData`：字典数据
- `AiModel`：AI模型配置
- `PageParams`：分页参数
- `PageResult`：分页结果
- `ApiResponse`：API响应

## 核心设计理念

1. **配置驱动 AI**：AI 的提示词（Prompt）不再写死在代码里，而是通过"数据字典"动态生成
2. **中英映射**：数据库存储标准的英文 Key（给 AI 看），前端展示中文 Label（给用户看）
3. **风控与审计**：严格管理 AI 模型的 Token 消耗和 Key 安全

## 注意事项

1. **字典数据管理**：编辑字典数据时，`promptText` 字段用于后端拼接 AI 指令，多个关键词用逗号分隔
2. **AI模型配置**：
   - 启用思考模式时，必须设置最大Token数（风控阈值）
   - API Key 输入后将加密存储，编辑时留空表示不修改
3. **路由配置**：路由配置在 `src/router/index.ts` 中，可根据需要调整

## License

MIT

