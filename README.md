# hex_playground
[![kjspkg-available](https://github-production-user-asset-6210df.s3.amazonaws.com/79367505/250114674-fb848719-d52e-471b-a6cf-2c0ea6729f1c.svg)](https://kjspkglookup.modernmodpacks.site/#hex-playground-yc-19)

咒法学 & KubeJS试验田 ~~爆改新生魔艺~~

## 主要功能（&涉及文件）
1. 自定义法术注册
    - `startup_scripts/*`
    - `assets/*`
    - `server_scripts/MiscCommands.js`：全面重载命令`/hexcasting reloadCustomPatterns`
1. 核心iota与序列化文本（以注册名为基础）
    - `server_scripts/Parser.js`：解析命令`/hexParse`
    - `client_scripts/ClipboardReader.js`：其中读取剪贴板相关指令客户端侧逻辑
1. 非平衡QoL道具调整
    - `startup_scripts/ItemStack.js`：施法道具可堆叠
    - `server_scripts/CoreMerge.js`
        - 单核心合成，按顺序短路执行：
            - 若副手有核心则接续其存储iota
            - 若副手有已写入施法道具则接续其已写入iota
            - 若画布有内容则按顺序添加
        - 双(核心/施法道具)无序合成，自动清除内容+重命名