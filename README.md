# Modelwise

Modelwise 是一个面向个人和客户项目的大模型选型工具。

它帮助用户：

- 了解不同 AI 产品和模型；
- 比较模型能力与适用场景；
- 估算 API 使用成本；
- 分析个人使用和客户项目的投入产出；
- 查看模型发布、更新与生命周期变化。

## 主要功能

### 模型资料库

收录国内外常见 AI 产品、模型系列、使用场景和官方资料。

### 成本与收益

根据输入 token、输出 token、调用次数和项目投入，估算每月 API 成本、项目总成本、净收益和 ROI。

### 更新日志

持续记录模型新增、型号变化、价格变化、迁移和停用信息。

## 自动更新

Modelwise 使用 GitHub Actions 每周检查一次模型资料：

1. 从 AIHOT 发现近期 AI 动态；
2. 使用 DeepSeek 整理候选变化；
3. 根据官方来源核对型号和价格；
4. 更新模型资料和更新日志；
5. 自动重新部署网站。

价格只有在拥有官方来源和明确文字 token 单价时，才会标记为可计算。

## 项目地址

- 在线使用：部署后填写 GitHub Pages 地址
- 项目仓库：https://github.com/Haluwjm-Lexie/Modelwise
- Modelwise GitHub Pages deployment
