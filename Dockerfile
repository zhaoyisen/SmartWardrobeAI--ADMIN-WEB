# 使用最轻量的 Nginx 镜像
FROM nginx:alpine

# 设置维护者信息 (可选)
LABEL maintainer="zhaoyisen"

# 关键步骤 1：把 Jenkins 打包好的 dist 文件夹拷进容器
COPY dist/ /usr/share/nginx/html/

# 关键步骤 2：把你写的 nginx 配置拷进去，覆盖默认的
COPY default.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 3000