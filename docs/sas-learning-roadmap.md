# SAS/SP 知识库建设地图 · 2026-11-20

> 核心原则：**速查只写答案，专题才讲体系**。SAS Assistant 过往讨论整理 + 用户本次新增需求；均使用匿名/虚构示例。
> 范围说明：历史复盘来自当前项目可检索对话/记录与已提供的代码线索，不保证穷尽所有历史聊天。无法复核的细节不应宣称“已经通过 SAS 实测”。

## 信息架构

- `/sas-notes/`：持续编号 01、02……的短笔记（问题、结论、最短代码、必要边界）
- `/sas-learning/`：系统教程索引（SQL、FREQ、统计汇总、POWER、图形），每项分基础／常用／进阶
- `docs/sas-learning-roadmap.md`：维护优先级、历史线索、已做/待做以及 SAS 官方资料索引
- 入口保持：`sp.769967.xyz` 首页 SAS 实战笔记始终第一位

## 已证实存在的历史实际问题（先沉淀）

|优先级|主题|实际讨论/需求|需提醒的边界|
|---|---|---|---|
|P0|ODS Unicode + 上/下标|ODS TAGSETS.RTF 与 ODS RTF 上标解析差异；`~`/ `^` ESCAPECHAR；截图的 `007E` / `0025`|U+007E 是 ~；U+0025 是 %；ODS 目的地/字体影响呈现|
|P0|PROC REPORT 跨列标题|COLUMN 分组“Alcohol History（col3-col6）”“Smoking History（col7-col10）”；曾涉及 Excel 分组标题|列分组展示 ≠ GROUP 变量分组；RTF raw 控制字非跨目的地通用|
|P0|ODS RTF 版式与分页|COMPUTE BEFORE _PAGE_、LINE 对齐、TITLE、分页、末尾空白页、ODS CLOSE 文件锁|HEADSKIP 不是所有空行根因；需检查 FINAL 占位行及目标目的地|
|P0|PROC SQL 去重/分母|COUNT DISTINCT USUBJID、GROUP BY、HAVING、条件 JOIN 后行数膨胀、dummy补零|表壳 N 来自定义的人群，不应由交叉表合计随意替代|
|P0|PRX 正则+部分日期|YYYY-MM-UK、YYYY-UK-UK、剂量文本数字、单位括号拆取、时间窗|日期插补遵循项目 SAP/Spec；某些版本 PRX `/u` 修饰符无效|
|P0|TFL n(%)|PROC FORMAT PICTURE + INPUT/PUT + CATX 清理外部空格|格式中的 99.95-high=(100) 会覆盖高于 100 的值|
|P1|PROC TRANSPOSE/shell|缺少未观测治疗组字段；N/n(%) 空行补齐|数据结构固定与统计分母必须独立核对|
|P1|PROC SGPLOT 图形|浓度–时间曲线首尾连接异常、最大值标注、访视顺序、QC|首尾连线可能因顺序、group 和数据结构；需用新数据复现定位|
|P1|PROC FREQ|过去涉及分类汇总 TFL，但尚无完整由基础到进阶的系列|频数行数≠去重受试者人数；row/col/table % 分母不同|
|P1|PROC MEANS/SUMMARY/UNIVARIATE|多次 TFL 的 n/Mean/SD、几何均值需求；需要系统化教程|CLASS/NWAY、缺失、CV、几何均值定义与分位数算法|
|P2|PROC POWER/GLMPOWER|本次明确新增，过去无足够可复核的实战记录|规划计算需预设检验、效应、SD、α、Power、分配比例|
|P2|统计模型|PROC GLM/MIXED/LOGISTIC/PHREG 与 ADaM 协变量、模型输出|以 SAP 模型为准；显著性解释/数据选择/QC 分开|
|P2|XPT/SAS7BDAT和批量导出|LIBNAME XPORT、ODS EXCEL、Excel sheet 与 log 警告|数据传输版本/编码及保密要求|
|P2|宏和数据步|宏变量比较、FIRST./LAST.、SET/MERGE、属性截断与隐式转换|不能把宏字符串操作与 DATA step 变量混为一谈|

## 专题路线（每页三层）

|专题|基础|常用 SP 场景|进阶 + QC|
|---|---|---|---|
|SQL|SELECT/WHERE/ORDER BY|GROUP BY、COUNT DISTINCT、JOIN|HAVING、EXISTS、1:N join、zero shell、单独分母|
|FREQ|TABLES 单维/二维|BY/group、OUT=、OUTPCT、MISSING|ODS 输出、CHISQ/EXACT、n vs 人数、分类补零|
|统计汇总|MEANS/CLASS/VAR|SUMMARY NWAY、OUTPUT、UNIVARIATE|CV、P25/P75、几何均值、分位算法、缺失/展示位数|
|POWER|α、power、effect size|TWOSAMPLEMEANS、TWOSAMPLEFREQ|分配比例、敏感性分析、模拟/模型假设|
|图形|SGPLOT SERIES/SCATTER|组均值+误差线、X/Y 轴、图例|SGPANEL、排序与断线、输出分辨率、布局 QC|

## 质量标准

- **代码标记**：实测（已由用户报告）/ 文档示意（SAS 官方语法但未在本项目运行）/ 待核对。
- **最短代码**：尽可能让使用者复制 `sashelp.class` 等公开数据演示，避免依赖真实项目表名。
- **每节一个 QC 问题**：行数、去重、分母、缺失、格式、排序、输出 ODS 的核查。
- **索引锚点**：`/sas-notes/#note-NN` 稳定，既有 01–04 永不重排。
- **公开安全**：绝不上传真实受试者数据、赞助商文件、企业宏源码、保密方案/Spec。
- **版本与部署**：GitHub commit 与 Cloudflare Pages 发布分开验证；不得把代码提交说成线上已核验。

## 主要官方资料

- ODS ESCAPECHAR: https://support.sas.com/documentation/cdl/en/odsug/65308/HTML/default/p11xia2ltavr8ln17srq8vn4rnqc.htm
- PROC REPORT COLUMN: https://support.sas.com/documentation/cdl/en/proc/61895/HTML/default/a002473625.htm
- PROC SQL SELECT: https://support.sas.com/documentation/cdl/en/proc/61895/HTML/default/a002473678.htm
- PROC FREQ TABLES: https://support.sas.com/documentation/cdl/en/statug/63962/HTML/default/statug_freq_sect010.htm
- PROC MEANS: https://support.sas.com/documentation/cdl/en/proc/61895/HTML/default/a002473537.htm
- PROC SUMMARY: https://support.sas.com/documentation/cdl/en/proc/61895/HTML/default/a002473735.htm
- PROC UNIVARIATE: https://support.sas.com/documentation/cdl/en/procstat/70116/HTML/default/procstat_univariate_syntax01.htm
- PROC POWER: https://support.sas.com/documentation/cdl/en/statug/68162/HTML/default/statug_power_syntax.htm
- PROC SGPLOT: https://support.sas.com/documentation/cdl/en/grstatproc/62603/HTML/default/sgplot-stmt.htm
- PRX functions: https://support.sas.com/documentation/cdl/en/lefunctionsref/63354/HTML/default/p1vz3ljudbd756n19502acxazevk.htm

## V0.3.1 已完成：解释性专题

- ✅ PK 浓度 Table：`/sas-learning/pk-concentration/`，定义与公式完整覆盖 N、n、n of BLQ、Mean、SD、CV%、Median、Min、Max、GeoMean、GeoSD、GeoCV%；以 10/20/40 浓度说明算术/几何尺度，并提供可独立检查的 SAS 示例。
- ✅ PROC REPORT/RTF：`/sas-learning/report-rtf/`，分清跨列组标题与 RTF STYLE、CELLWIDTH、原始 `~R/RTF` 控制字，增加对照与版式 QC。
- ✅ 速查页：原 06 保留跨列核心，新增 09 PK 统计量、10 RTF 设置，目录持续 01–10 可折叠。
- 待验证：真实用户所在 SAS 版本对 raw RTF 头部效果和 ODS TAGSETS.RTF 选项的表现、Shell 中 Geostd/CVB% 的确切定义及 BLQ/NC/N 口径。
- 原则补充：概念型主题不能为了短小而删掉定义、公式、为什么和使用条件；速查与深学各承担不同任务。
