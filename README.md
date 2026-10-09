# AMEI Home + 月抛模拟器

这是一个基于 Vue 3 + Vite 的主页项目，包含两部分：

- 主页（`src/`）：个人信息、链接按钮、侧栏入口。
- 月抛模拟器（`public/月抛模拟器 (Final Edition).html` + `public/simulator.js`）：独立静态互动页。

## 功能概览

### 主页功能

- 开场加载动画与背景图预加载。
- 左右侧滑面板：
  - 左侧：互联网大厂模拟器（外部页面 iframe）
  - 右侧：月抛模拟器（本地静态页面）
- 底部一言文案拉取（`hitokoto`）。

### 模拟器功能

- 身份选择（含彩蛋项）。
- 双模式玩法：主动找人 / 接单模式。
- 经济系统：金钱、日常成本、房租周期。
- 心理系统：惊恐、急性应激、抑郁倾向、失眠。
- 行为系统：口交/性交/肛交（含防护与风险差异）。
- 事件系统：聊天博弈、突发安全事件、行为后意外分支。
- 商店系统：试纸、PrEP、PEP、心理咨询、休息。

## 快速开始

```bash
npm install
npm run dev
```

启动后访问默认地址（通常为 `http://localhost:5173`）。

## 构建与预览

```bash
npm run build
npm run preview
```

构建产物输出目录：`dist/`。

## 质量脚本

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run test:smoke
```

说明：`test:smoke` 当前执行一次构建流程，作为最小可用性检查。

## 项目结构

```text
src/
  App.vue
  main.js
  style.css
  components/
    HeroSection.vue
    EmoDiary.vue
    SlidePanel.vue
  views/
    Home.vue
  constants/
    emoDiary.js

public/
  月抛模拟器 (Final Edition).html
  simulator.js

index.html
vite.config.js
```

## 维护指引

### 调整数值

- 优先修改 `public/simulator.js` 中的 `CONFIG`。
- 常改项：起始资源、行为收益、压力增长、房租与日成本。

### 扩展内容

- 标签池：`ALL_TAGS`、`IDENTITY_TAGS`、`PROVIDER_TAGS`。
- 事件池：`SAFETY_EVENTS` 与行为后意外模板。
- 统计面板：`getStatsHTML()`。

### 注意事项

- 模拟器逻辑已从内联脚本拆分为 `public/simulator.js`，新增逻辑尽量放在该文件。
- 如需改 UI 结构，优先修改 `public/月抛模拟器 (Final Edition).html`，避免把大量逻辑再写回内联脚本。

## 安全与边界说明

- 本项目为风险教育模拟，不构成医疗、法律或心理治疗建议。
- 游戏中的身份/标签用于场景建模，不应被当作现实中的风险定论。
- 现实中若发生暴露风险，请尽快咨询正规医疗机构并进行专业检测。

## 致谢

- 月抛模拟器改编自 [arathustr](https://arathustr.github.io/fun/3/) 的作品，在此基础上拆分逻辑并扩展了经济、心理、商店等系统。
- 主页一言文案来自 [Hitokoto](https://hitokoto.cn/)，背景图来自 [dmoe.cc](https://www.dmoe.cc/)。

## 许可证

本项目基于 [GNU General Public License v3.0](LICENSE) 开源。

Copyright (c) 2026 AMEINEKO
