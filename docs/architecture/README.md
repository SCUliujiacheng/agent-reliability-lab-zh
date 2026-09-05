# 架构制品验证

架构图由 `agent-reliability-lab.architecture.json` 生成，是一个自包含、可交互的 HTML 制品。

本制品对应[中文独立仓库](https://github.com/SCUliujiacheng/agent-reliability-lab-zh)；英文版本与英文架构说明继续保留在[英文原版仓库](https://github.com/SCUliujiacheng/agent-reliability-lab)。

## 交付回执

- diagram type：`architecture`
- quality profile：`showcase`
- repository evidence：在 revision `727f9614b60ddfd41adc1a7cb38e4c5c360ab3c3` 验证了 `17` 个引用
- specification SHA-256：`194b314e03049de183cecd4760ebf3d2dc77c064a0089bb9401d534bf747d25c`
- HTML SHA-256：`5468381d8d3bdeb520e7412c5a6b19877e12221140b03db3d4a0e4f6a7f97438`
- specification bytes：`8,731`
- HTML bytes：`725,243`
- structural checks：`9 / 9`
- composition：`0` errors，`0` warnings

## 视觉检查

以下视口的 containment 与 readability 检查均通过：

- 1440 × 900
- 1600 × 1000
- 1920 × 1080
- 2048 × 1320

所有视口的横向、纵向文档 overflow 均为零，最小投影节点文字高于 6 px 校验下限。自动回执仍保留 `visualReview: "pending"`：它只记录 containment，不代替主观视觉判断。

已人工检查 1440 × 900 与 2048 × 1320 的浅色、深色截图；中文节点、关系标签与三张说明卡均无裁切，未发现路线碰撞或含混 corridor，因此人工视觉检查通过，无需修正轮次。

`agent-reliability-lab-architecture.visual-check.html` 是四张检查截图的本地 contact sheet。主 HTML 仍是更完整的交付制品，支持主题切换、pan/zoom、搜索、guided views、关系追踪与离线导出。
