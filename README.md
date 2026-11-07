# Modelwise

Modelwise 是一个面向个人和客户项目的大模型选型与成本收益工具。

## GitHub Actions 更新

`.github/workflows/weekly-update.yml` 每周一运行一次，也可以在 GitHub Actions 页面手动运行。它会读取 AIHOT 的近期动态，把候选变化交给 DeepSeek 整理，再将核验结果写入站点数据。

在仓库 Settings → Secrets and variables → Actions 中配置：

- `DEEPSEEK_API_KEY`：DeepSeek API 密钥
- `MODELWISE_API_BASE`：需要同步的 Modelwise API 地址（可选）
- `MODELWISE_API_TOKEN`：对应的写入令牌（可选）

价格必须有官方来源和明确的文字 token 单价才会进入可算价数据；没有明确价格的型号可以记录，但不会被标为可算价。
