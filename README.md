# 个人主页模板 · Personal Homepage Template

面向保研、考研和求职的中文个人主页模板，采用纸张质感与章节阅读布局。下载即可打开，包含研究、项目、简历、荣誉和成长故事；可以在页面内编辑文字、保存修改并导出 HTML。

- 25 篇成长写作示例，从童年到大学，每篇附填写提示。
- 8 个原创 SVG 插图与证书占位、4 份实际 PDF 示例材料。
- 科研摘要展开、附件预览、移动端菜单和键盘操作。
- 纯静态 HTML/CSS/JavaScript，无第三方运行依赖，可离线使用。
- 使用 MIT 许可证，允许修改、复用和分发；保留许可证及版权声明。

## 获取模板

仓库：[firewildgod/personal-homepage-template](https://github.com/firewildgod/personal-homepage-template)。

可以点击 GitHub 的 **Use this template** 建立自己的仓库，也可以从 [Releases](https://github.com/firewildgod/personal-homepage-template/releases) 下载完整分享包，或点击 **Code → Download ZIP** 下载源码。Git 用户可运行：

```sh
git clone https://github.com/firewildgod/personal-homepage-template.git
```

这是一个可以直接在浏览器打开的静态个人主页。林川、星桥大学、成长故事、课程记录、奖项、论文和项目均为虚构，页面与附件中的数字也仅作排版示例。

## 打开与编辑

1. 双击 `index.html` 查看主页；侧栏包含科研、项目、简历、荣誉、成长章节和填写指南。
2. 点击侧栏底部的「编辑示例」。虚线范围内的文字可以直接修改；编辑时点击卡片内的文字不会跳转。
3. 点击底部「资料与链接设置」，统一修改姓名、学校/专业/身份、邮箱与简历 PDF 路径。姓名和首页身份会同步，正文中的经历、作者与奖项需逐项填写。
4. 「保存到浏览器」只在当前浏览器保存，换电脑不会带走这些修改。「导出 HTML」生成包含修改的 `index.html`；用它替换本文件夹中的同名文件。
5. 分享时必须带上整个 `assets` 文件夹。单独发送 HTML 会丢失样式、交互和附件。

「恢复文件内容」清除当前浏览器保存的修改，重新载入当前 HTML 文件。它不会撤销已经导出并替换进文件的修改。请保留一份未填写的模板。

## 按用途组织内容

| 用途 | 首页优先展示 | 每条经历如何写 |
| --- | --- | --- |
| 保研 | 研究兴趣、课程基础、代表研究、可核查成果 | 问题 → 文献/方法 → 自己的贡献 → 实验结果与局限 |
| 考研/复试 | 基础课程、毕业设计、专业训练、未来学习计划 | 专业基础 → 一次具体实践 → 对问题的理解 → 希望继续学习什么 |
| 求职 | 岗位方向、技能、实习/项目、交付成果 | 背景 → 负责范围 → 实现与协作 → 可验证的结果 |

不必填满全部栏目。没有论文时，可将「科研」改为课程研究、复现实验或毕业设计；没有奖项时，可以展示作品、课程成果与实践记录。不要将虚构示例当作个人成果使用。

成长章节采用「虚构故事＋写作提示」。童年到大学不必逐年记录，选对当下方向有解释力的转折。写清场景、行动、变化，避免替别人下判断；公开版本可省略家庭隐私、具体住址和他人姓名。

## 替换附件

| 文件 | 用途 |
| --- | --- |
| `assets/template/resume-sample.pdf` | 虚构简历示例 |
| `assets/template/transcript-sample.pdf` | 虚构课程记录示例 |
| `assets/template/paper-one-sample.pdf` | CampusFlow 研究展示示例 |
| `assets/template/paper-two-sample.pdf` | StudyLens 研究展示示例 |
| `assets/template/award-modeling.svg` | 虚构建模奖项 |
| `assets/template/award-design.svg` | 虚构应用设计奖项 |
| `assets/template/scholarship.svg` | 虚构奖学金 |
| `assets/template/language-certificate.svg` | 虚构语言能力展示 |
| `assets/template/project-demo.svg` | 项目流程图示例 |

可以用自己的材料替换同名文件；更换文件名或格式时，请同步修改 `index.html` 的 `href`、`data-pdf-src` 与 `openCert(...)` 路径。PDF 使用 `openCert('pdf', '相对路径.pdf', '标题')`，图片使用 `openCert('img', '相对路径.svg', '标题')`。简历路径也可以在资料设置中修改。部分浏览器不能嵌入 PDF 时，使用下载/打开链接查看。

真实证书公开前可遮盖身份证号、学号、证书编号、二维码、签名及不必要的联系方式；论文应准确区分计划、草稿、投稿、录用和正式发表，并提供相应证据。仓库链接须换成实际可访问的地址。

## 文件结构与部署

```text
index.html                  页面结构、内容与原有主体样式
assets/template/template.css  模板补充样式
assets/template/template.js   导航、预览、编辑、保存与导出
assets/template/*.svg          原创示例图和证书占位
assets/template/*.pdf          虚构示例材料
README.md                   本说明
LICENSE                     MIT 许可证
build.mjs                   可选静态打包脚本
package.json                可选构建命令，无第三方依赖
.openai/hosting.json         无 Site 身份的静态托管配置
```

打开模板无需安装依赖，也无需联网。若托管平台需要构建目录，在安装 Node.js 的环境运行 `node build.mjs`，将生成的 `dist` 目录作为静态站点根目录。

分享这个演示模板时，请保留「虚构示例」标注，让使用者能够区分样稿与真实成果。制作自己的个人主页时，先逐页替换人物、作者、时间、指标和附件，再按需要删除已替换内容旁的示例标签与填写提示。请只分享本模板文件夹或其 ZIP；原项目的私人材料与历史备份不属于开源内容。

## 许可证与贡献

代码、原创 SVG 和虚构 PDF 示例材料按 [MIT License](LICENSE) 提供。再分发时保留许可证及版权声明。个人填写后新增的照片、论文与证书，请自行确认其使用与公开范围。

欢迎提交 Issue 或 Pull Request 改进布局、交互和写作提示。示例内容请继续使用虚构人物与成果，不要提交个人证件、真实成绩单、密钥、浏览器保存数据或构建产物。
