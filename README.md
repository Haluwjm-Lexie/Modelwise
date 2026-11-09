# Modelwise

> 选对模型，算清成本。

[在线体验](https://haluwjm-lexie.github.io/Modelwise/) · [问题反馈](https://github.com/Haluwjm-Lexie/Modelwise/issues)

Modelwise 是一个面向个人创作者、AI 产品经理、开发者与小团队的 AI 模型选型工具。

它不只展示模型资料，更帮助你在真实项目中回答三个问题：

- 这次任务应该选哪个模型？
- 不同模型的能力、用途和价格有什么差别？
- 我的项目每月大约要花多少钱？

---

## 核心功能

### 1. 模型资料库

集中整理 23 个国内外 AI 产品与模型生态，包括 ChatGPT、Claude、Gemini、DeepSeek、豆包、千问、Kimi、智谱、MiniMax、Grok、Cursor、MiMo 等。

每个产品页包含：

- 产品简介与官方入口
- 大事记
- 模型型号与定位
- 输入 / 输出 Token 价格
- 服务状态、来源与核查日期

### 2. AIHOT 主题大事记 + 官网补充

大事记不是单纯的“新模型列表”。

- AIHOT 已覆盖的产品：直接同步对应主题的大事记，包含模型、产品与公司动态。
- AIHOT 未覆盖的产品：以官网公开资料作为补充来源。
- 每条记录保留来源，避免把推测当成事实。

例如：[AIHOT · OpenAI / ChatGPT 主题](https://aihot.news/topics/openai)

### 3. 场景选型

从实际任务出发选择模型，例如：

- 写作与内容生产
- 代码开发
- 推理与研究
- 客服与知识库
- 多模态理解
- Agent / 工具调用

### 4. 型号对比

选择多个模型后，可横向比较其用途、能力、价格与适用场景，避免只看“模型名字新不新”。

### 5. 成本与收益

按 Token 用量估算调用成本，帮助个人和团队在“效果”与“预算”之间做出可解释的选择。

---

## 每周自动更新

Modelwise 使用 GitHub Actions 定时更新资料。

每周更新时会核查：

1. AIHOT 主题大事记；
2. 23 个产品是否有新模型、产品或公司动态；
3. 官方价格页面是否有变化；
4. 模型是否出现上线、迁移、弃用或下线。

更新原则：

- AIHOT 有对应主题：以 AIHOT 主题大事记为主；
- AIHOT 没有覆盖：查看该产品官网；
- 价格、可计算费用与服务状态：以官方资料为准；
- 没有可靠更新：不虚构、不强行新增。

仓库中的 `update-status.json` 会记录最近一次更新的核查结果。

---

## 本地运行

这是一个无需构建工具的静态网站。

```bash
git clone https://github.com/Haluwjm-Lexie/Modelwise.git
cd Modelwise
```

随后直接用浏览器打开 `index.html`，或使用 VS Code 的 Live Server 预览。

---

## 项目结构

```text
Modelwise/
├── index.html                 # 网站入口
├── design.css                 # 基础设计系统
├── visual-sync.css            # 紧凑时间轴与视觉补充
├── modelwise.js               # 页面与交互逻辑
├── catalog.json               # 产品、模型与大事记资料
├── pricing.json               # 模型价格资料
├── workbook-models.json       # 模型资料工作表
├── changelog.json             # 更新日志
├── update-status.json         # 最近一次自动核查状态
├── scripts/
│   └── weekly-update.mjs      # 每周更新脚本
└── .github/workflows/
    └── weekly-update.yml      # GitHub Actions 定时任务
```

---

## 数据来源

- [AIHOT](https://aihot.news/)
- 各模型与产品的官方网站、官方文档、官方定价页和官方公告

Modelwise 会尽量标明资料来源与核查日期，但 AI 产品与价格变化很快。实际采购、上线或商业决策前，请以厂商最终官方页面为准。

---

## 适合谁使用

- 不知道该选 ChatGPT、Claude、Gemini 还是 DeepSeek 的个人用户
- 需要给项目做模型选型的 AI 产品经理
- 需要估算 Token 成本的开发者与创业团队
- 想持续关注国内外 AI 模型变化的学习者
- 需要向客户、老板或面试官解释选型依据的人

---

## 路线图

- [x] 23 个产品资料库
- [x] AIHOT 主题大事记同步
- [x] 官网资料补充
- [x] 每周自动更新
- [x] 模型价格与成本估算
- [x] 多模型对比
- [ ] 面向真实项目的智能选型问答
- [ ] 一键生成可分享的选型报告
- [ ] 收藏模型后的重要更新提醒
- [ ] 统一任务集下的模型实测与评分体系

---

## 作者

由 **Lexie** 设计与构建。

Modelwise · 让每次模型选择更明白。
