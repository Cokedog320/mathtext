# `bosichong/PrimarySchoolMathematics` 调研笔记

调研日期：2026-07-18  
上游快照：[`e3c9e2c`](https://github.com/bosichong/PrimarySchoolMathematics/tree/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f)（`master`，2024-10-25）  
来源范围：只使用上游仓库的 README、配置与源代码。

## 结论先行

这个项目最值得 MathText 学习的不是 Vue 技术栈，而是它把“出一张卷子”拆成了几层可组合的产品能力：题型组、全局规则、试卷版式、配置预设、手工错题和打印流程。尤其值得借鉴的是“同一张卷子可加入多个题型组”“每个算数项分别设范围”“保存常用配置”“手工加入错题”“前端 A4 打印”等思路。[README 功能列表](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/readme.md#L20-L29)

它的出题内核不适合直接移植：采用随机生成后拒绝不合格结果的无限循环，没有去重、候选耗尽或最大尝试次数；校验依赖字符串正则与 `eval`；进退位只看个位且存在边界错误；仓库没有自动化测试脚本。MathText 已有的“合法候选池 + 配额 + 唯一键”方向更可靠，应吸收产品模型而不是复制算法。[生成循环](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/psm.js#L573-L592) · [`package.json`](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/package.json#L6-L32)

## 产品能力盘点

### 支持的题型

- 一步、两步、三步运算；每一步都能从加、减、乘、除中多选运算符。因此既能生成单一四则运算，也能生成不带括号的混合运算。[步数与运算符配置](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/AutoGenerateFormulas.vue#L3-L16) · [选项定义](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/AutoGenerateFormulas.vue#L122-L145)
- 可选“求结果”或“求算数项”。后者先算出结果，再随机把等号左侧的一个数字替换为下划线；它不是独立的逆运算生成器。[题型选项](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/OptionsDrawer.vue#L147-L164) · [缺项构造](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/psm.js#L330-L373)
- 可启用括号；生成器在相邻的两个算数项外随机放一对括号，再按规则验证整式。[界面开关](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/OptionsDrawer.vue#L11-L13) · [括号生成](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/psm.js#L281-L326)
- 除法可选随机、整除或有余数；除数不能为 0，且商必须为正。有余数模式被限制为一步、求结果题。[除法选项约束](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/OptionsDrawer.vue#L147-L164) · [除法校验](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/psm.js#L170-L218)
- 加法可筛选随机进位、进位、无进位；减法可筛选随机退位、退位、无退位。[设置界面](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/OptionsDrawer.vue#L15-L35) · [规则调用](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/psm.js#L221-L254)
- 支持手工录入特殊题或错题，输入时可用 `*`、`/`，显示时转换成乘除符号。[手工题界面与转换](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/CustomFormulas.vue#L1-L23) · [手工题组装](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/CustomFormulas.vue#L83-L94)

### 出题规则与难度配置

它没有“年级 / 难度等级”预设，而是把难度拆成细粒度规则：

1. 每一个算数项都有独立的最小值、最大值。
2. 每一步都有独立的可选运算符集合。
3. 最终结果另有独立的最小值、最大值。
4. 全局再叠加括号、进位、退位、余数、求结果 / 求算数项等约束。

这些设置在 UI 中直接暴露，[算数项与结果范围](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/AutoGenerateFormulas.vue#L10-L68)，生成前会被转换成各项范围、结果范围和每步符号集合。[参数转换](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/paperGenerator.js#L9-L39)

用户可以连续“添加口算题”，把多个配置不同的题型组加入同一张卷子；生成时每组按自己的题量出题，最后混合打乱。这是比单一全局题型更强的组卷模型。[添加题型组](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/AutoGenerateFormulas.vue#L157-L177) · [合并题型组](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/paperGenerator.js#L41-L61)

### 题量与试卷配置

- 每个题型组单独设置题量；全局设置生成几份卷子和每页列数。[题量输入](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/AutoGenerateFormulas.vue#L59-L74) · [卷数与列数](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/OptionsDrawer.vue#L44-L62)
- 生成时用“每卷总题数 × 卷数”做 1000 题上限保护，但没有按可行候选数量预检，也没有给单项输入设置合理的上下限。[总量保护](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/views/Home.vue#L153-L167)
- 默认配置为 30 题、3 份、3 列、一步加法、各项 1–9、结果 1–9。[默认值](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/views/Home.vue#L57-L84)
- 最多保存 10 个命名配置；配置以 JSON 存在浏览器 `localStorage`，无需账号。[保存数量限制](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/AutoGenerateFormulas.vue#L179-L198) · [本地存储实现](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/configStorage.js#L4-L18)

### 答案、竖式、打印与导出

- 当前代码没有单独的答案页或答案键。普通题只输出带空等号的题面；“求算数项”会显示结果并隐藏一个算数项，但这仍是题面，不是答案页。[题面字符串生成](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/psm.js#L330-L373)
- UI 有“口算解题 / 竖式解题”，但当前前端打印实现并不把算式排成真正的竖式；它只是把每题下边距从 `16px` 增加到 `160px`，给学生留竖式演算空间。[解题方式选项](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/OptionsDrawer.vue#L37-L43) · [打印间距实现](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/views/Print.vue#L41-L58)
- 试卷标题、副标题、列数、卷数均可配置；预览使用 210mm 宽的 A4 样式并设置分页。点击打印调用浏览器 `window.print()`，浏览器支持时可由用户选择“另存为 PDF”。[A4 预览与打印](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/views/Print.vue#L1-L18) · [打印调用](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/views/Print.vue#L61-L96) · [A4 样式](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/views/Print.vue#L112-L154)
- 文件名可选“卷子标题 + 时间”或“仅时间”，由打印页的 `document.title` 控制。[文件名规则](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/enum.js#L1-L8) · [标题设置](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/views/Print.vue#L61-L73)
- 仓库还保留了向 `/api/psm` 请求 ZIP 的旧代码，但当前主页实际调用的是前端 `createFormulasGenerator` 后跳转打印页，并未调用该 API。因此不应把 ZIP 下载视为当前主流程已验证能力。[未使用的 API 封装](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/apis/paper.js#L1-L64) · [当前生成路径](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/views/Home.vue#L45-L51) · [实际调用](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/views/Home.vue#L153-L167)

## MathText 值得吸收的设计

### 高优先级

1. **题型组式组卷。** 让用户把“20 以内进位加法 10 题”“100 以内退位减法 10 题”等多个题型组加入同一张卷子，再按组配额生成和整体混排。这能自然表达教学中的混合复习，又不会牺牲每组质量控制。
2. **常用配置预设。** 将完整配置保存为本地命名预设，特别适合家长或老师反复生成同一训练目标。MathText 可先做本地持久化，不必引入账号体系。
3. **手工错题与自动题混编。** 产品思路非常贴近日常教学：自动题负责覆盖面，错题负责针对性。实现时应把手工题也建模为正式题型组，并纳入去重、排版和答案模型。
4. **题量与可行性反馈。** 上游只有总量上限，MathText 可以更进一步：在用户选择规则时显示“可生成 N 道唯一题”，若请求量超过候选数，明确说明缩减原因。这正好延续现有候选池去重策略。

### 中优先级

5. **每个算数项分别设范围。** 对乘法的“二位数 × 一位数”、除法的“二位数 ÷ 一位数”等非对称题型很有价值。界面不必直接暴露任意数字输入，可先提供教学友好的数位/区间预设，再给高级用户展开精确范围。
6. **打印工作流细节。** 标题、副标题、姓名/日期/用时/正确数、列数、文件名隐私选项都很实用。MathText 可保留实时 A4 预览，并增加答案页开关、页数溢出警告和真实打印尺寸测试。
7. **当前卷内容摘要。** 上游在生成按钮旁显示已加入哪些题型组及题量，能减少复杂配置后的误操作。[内容摘要](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/views/Home.vue#L113-L118)

## 不应照搬的实现

1. **无限拒绝采样。** `generate()` 不断随机试题，直到列表长度达到请求量；没有唯一键、候选耗尽检测或最大尝试次数。配置无解时会永久循环，配置空间小时会大量重复。[生成循环](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/psm.js#L573-L592)
2. **进退位判定不完整。** 加减法只比较个位；加法还使用 `个位和 > 10`，把恰好等于 10 的进位误判为不进位，也无法识别十位或更高位发生的进退位。[进位实现](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/psm.js#L409-L450)
3. **字符串正则 + `eval`。** 算式先拼成字符串，再用正则逐段匹配并多次 `eval`；这使规则验证、答案计算、括号和显示符号紧耦合，也不利于扩展分数、小数或可解释步骤。[结果校验](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/psm.js#L152-L167) · [逐段验证](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/psm.js#L110-L150)
4. **无偏性不足的打乱。** 两处都使用随机比较器调用 `sort`，不能保证均匀洗牌；MathText 应继续使用明确的 Fisher–Yates 或已测试的随机抽样策略。[单组打乱](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/psm.js#L577-L591) · [整卷打乱](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/paperGenerator.js#L43-L53)
5. **功能承诺与当前主流程有漂移。** 手工题 UI 会创建 `customFormulaList`，但当前前端生成器先把这类题组过滤掉，之后也没有再合并回来；因此“手工错题混编”的产品思想值得学，当前实现不能直接复用。[手工题组](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/components/home/CustomFormulas.vue#L83-L94) · [过滤手工题](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/paperGenerator.js#L9-L12) · [生成器余下流程](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/src/utils/paperGenerator.js#L41-L65)
6. **缺少自动化验证。** `package.json` 只有开发、构建和预览命令，没有测试脚本；对随机生成器和打印布局来说风险很高。[脚本与依赖](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/package.json#L6-L32)
7. **不要为借鉴功能迁移框架。** 上游使用 Vue 3、Pinia、Element Plus、Vite；这些并不是上述产品能力成立的前提。MathText 可以在现有 React + TypeScript + Vite 架构内实现同样的领域模型。[上游技术栈](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/readme.md#L61-L66) · [依赖](https://github.com/bosichong/PrimarySchoolMathematics/blob/e3c9e2c1f3e01d9ef4df6c04d673a87c5fa6228f/package.json#L16-L32)

## 建议转化为 MathText 路线图

1. 先增加“唯一候选数量”提示和题量不足解释，巩固刚完成的竖式去重体验。
2. 把当前单一配置抽象为可排序的题型组列表，每组保存规则、目标题量和实际生成题量。
3. 增加本地命名预设，并提供内置的教学预设；避免一开始暴露过多自由数字字段。
4. 增加手工题 / 错题题型组，统一经过题目规范化、去重、答案计算和 A4 排版。
5. 增加答案页开关和打印溢出测试；PDF 仍可沿用现有前端导出路径。

