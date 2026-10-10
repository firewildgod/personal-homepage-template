/* Offline personal homepage template. Example records are fictional. */
'use strict';
const TEMPLATE_STORAGE_KEY = document.body.dataset.templateStorage || 'portfolio-template-v1';
const chapterMap = { childhood:'childhood-index', primary:'primary-index', middle:'middle-index', high:'high-index', college:'college-index' };
const chapterFragments = { childhood:['c1','c2','c3','c4'], primary:['p1','p2','p3','p4','p5'], middle:['m1','m2','m3','m4','m5'], high:['h1','h2','h3','h4','h5'], college:['u1','u2','u3','u4','u5','u6'] };
let isEditMode = false;
let lastCertFocus = null;
let lastSettingsFocus = null;
let toastTimer;
const getEditables = () => document.querySelectorAll('[data-edit]');

function showPage(id, updateHash = true) {
  const page = document.getElementById('page-' + id);
  if (!page) return;
  document.querySelectorAll('.page').forEach(el => el.classList.toggle('active', el === page));
  const main = document.getElementById('main');
  main.scrollTop = 0;
  main.classList.remove('theme-c','theme-p','theme-m','theme-h','theme-u');
  const chapter = Object.keys(chapterMap).find(key => chapterMap[key] === id || chapterFragments[key].some(f => id === 'fragment-' + f));
  if (chapter) main.classList.add('theme-' + chapterFragments[chapter][0][0]);
  document.body.classList.toggle('reading-mode', id.startsWith('fragment-'));
  document.querySelectorAll('[data-nav-page]').forEach(el => {
    const current = el.dataset.navPage === (chapter || id === 'auto-index' ? 'auto' : id);
    el.classList.toggle('active', current);
    if (current) el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current');
  });
  const sub = document.getElementById('sub-auto');
  if (chapter || id === 'auto-index') sub?.classList.add('open');
  const subIds = ['auto-index', ...Object.values(chapterMap)];
  document.querySelectorAll('.nav-sub-btn').forEach((el,i) => {
    const current = subIds[i] === (chapter ? chapterMap[chapter] : id);
    el.classList.toggle('active', current);
    if (current) el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current');
  });
  if (id === 'resume') {
    const frame = document.getElementById('resume-frame');
    if (frame && !frame.getAttribute('src')) frame.src = frame.dataset.pdfSrc;
  }
  page.querySelectorAll('img[data-lazy-src]').forEach(img => { if (!img.getAttribute('src')) img.src = img.dataset.lazySrc; });
  page.querySelectorAll('.lazy-img').forEach(img => img.classList.add('loaded'));
  page.querySelectorAll('.reveal, .reveal-left, .reveal-scale, .reveal-blur, .reveal-stagger').forEach(el => el.classList.add('visible'));
  const hero = page.querySelector('.welcome-banner-content');
  hero?.classList.add('hero-text-ready');
  if (updateHash && location.hash !== '#' + id) {
    try { history.pushState(null,'','#' + id); } catch (_) { /* file previews may restrict history */ }
  }
  closeMenu();
}
function showFragment(id) { showPage('fragment-' + id); }
function showChapterIndex(chapter) { showPage(chapterMap[chapter]); }
function toggleSection(btn,id) {
  const sub = document.getElementById('sub-' + id);
  if (!sub) return showPage(id);
  const open = !sub.classList.contains('open');
  sub.classList.toggle('open',open); btn.classList.toggle('open',open);
  btn.setAttribute('aria-expanded',String(open));
  if (open) showPage('auto-index');
}
function toggleNewsMore(btn) {
  const expanded = btn.classList.toggle('expanded');
  document.querySelectorAll('.news-item-extra').forEach(el => el.style.display = expanded ? 'flex' : 'none');
  btn.textContent = expanded ? '收起动态 ↑' : '查看更多 ↓';
  btn.setAttribute('aria-expanded',String(expanded));
}
function togglePaperAbstract(id,btn) {
  const expanded = document.getElementById(id).classList.toggle('expanded');
  btn.setAttribute('aria-expanded',String(expanded));
  btn.innerHTML = (expanded ? '收起摘要 ' : '展开摘要 ') + '<span class="peb-arrow">▼</span>';
}

function openCert(type,src,title) {
  const modal = document.getElementById('cert-modal');
  const body = document.getElementById('cert-box-body');
  lastCertFocus = document.activeElement;
  document.getElementById('cert-box-title').textContent = title;
  body.replaceChildren();
  let media;
  if (type === 'img') { media = document.createElement('img'); media.alt = title; }
  else if (type === 'pdf') { media = document.createElement('iframe'); media.title = title; }
  else if (type === 'video') { media = document.createElement('video'); media.controls = true; }
  else return;
  media.src = type === 'pdf' ? src + '#toolbar=1&view=FitH' : src;
  body.append(media); modal.classList.add('active'); modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  document.getElementById('cert-close').focus();
}
function closeCert() {
  const modal = document.getElementById('cert-modal');
  modal.classList.remove('active'); modal.setAttribute('aria-hidden','true');
  document.getElementById('cert-box-body').replaceChildren();
  document.body.style.overflow = '';
  lastCertFocus?.focus(); lastCertFocus = null;
}
function showToast(message) {
  const toast = document.getElementById('edit-toast');
  toast.textContent = message; toast.style.display = 'block';
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.style.display = 'none',4000);
}
function enterEditMode() {
  closeMenu();
  isEditMode = true; document.body.classList.add('edit-active');
  getEditables().forEach(el => el.contentEditable = 'true');
  showToast('点击虚线内文字修改；姓名、邮箱和附件路径可在「资料与链接设置」中修改。');
}
function exitEditMode() {
  getEditables().forEach(el => el.removeAttribute('contenteditable'));
  isEditMode = false; document.body.classList.remove('edit-active');
}
function snapshotEdits() {
  const texts = {};
  getEditables().forEach(el => { texts[el.dataset.editKey] = el.innerHTML; });
  return { version:1, texts, profile:readProfile() };
}
function saveEdits() {
  try { localStorage.setItem(TEMPLATE_STORAGE_KEY,JSON.stringify(snapshotEdits())); showToast('已保存到当前浏览器。分享前请导出 HTML。'); }
  catch (_) { showToast('当前浏览器不能保存本地修改，请使用「导出 HTML」保存。'); }
}
function safeEditableHTML(value) {
  const fragment = document.createElement('template'); fragment.innerHTML = String(value);
  const clean = document.createElement('div');
  function append(source,target) {
    source.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) target.append(document.createTextNode(node.textContent));
      else if (node.nodeType === Node.ELEMENT_NODE) {
        if (['SCRIPT','STYLE','IFRAME','OBJECT'].includes(node.tagName)) return;
        if (['BR','STRONG','EM','B','I'].includes(node.tagName)) { const el = document.createElement(node.tagName.toLowerCase()); target.append(el); append(node,el); }
        else {
          const block = ['DIV','P','LI'].includes(node.tagName);
          if (block && target.lastChild && target.lastChild.nodeName !== 'BR') target.append(document.createElement('br'));
          append(node,target);
          if (block && node.nextSibling && target.lastChild?.nodeName !== 'BR') target.append(document.createElement('br'));
        }
      }
    });
  }
  append(fragment.content,clean); return clean.innerHTML;
}
function loadEdits() {
  try {
    const saved = JSON.parse(localStorage.getItem(TEMPLATE_STORAGE_KEY) || 'null');
    if (!saved || saved.version !== 1) return;
    getEditables().forEach(el => { if (typeof saved.texts?.[el.dataset.editKey] === 'string') el.innerHTML = safeEditableHTML(saved.texts[el.dataset.editKey]); });
    if (saved.profile) applyProfile(saved.profile);
  } catch (_) { /* damaged or blocked local storage never prevents reading */ }
}
function resetEdits() {
  if (!confirm('清除本浏览器保存的修改，并恢复当前 HTML 文件中的内容？')) return;
  try { localStorage.removeItem(TEMPLATE_STORAGE_KEY); } catch (_) {}
  location.reload();
}
function readProfile() {
  return {
    name: document.querySelector('[data-profile="name"]')?.textContent.trim() || '林川',
    identity: document.querySelector('[data-profile="identity"]')?.textContent.trim() || '星桥大学 · 计算机科学与技术 · 本科',
    email: document.querySelector('a[href^="mailto:"]')?.getAttribute('href').slice(7) || 'lin.chuan@example.com',
    resume: document.getElementById('resume-frame')?.dataset.pdfSrc.split('#')[0] || 'assets/template/resume-sample.pdf'
  };
}
function applyProfile(profile) {
  document.querySelectorAll('[data-profile="name"]').forEach(el => el.textContent = profile.name);
  document.querySelectorAll('[data-profile="signature"]').forEach(el => el.textContent = '— ' + profile.name);
  document.querySelectorAll('[data-profile="identity"]').forEach(el => el.textContent = profile.identity);
  document.querySelectorAll('[data-profile="email"]').forEach(el => el.textContent = profile.email);
  document.querySelectorAll('a[href^="mailto:"]').forEach(el => el.setAttribute('href','mailto:' + profile.email));
  const frame = document.getElementById('resume-frame');
  if (frame) { frame.dataset.pdfSrc = profile.resume + '#toolbar=1&view=FitH'; frame.removeAttribute('src'); if (frame.closest('.page').classList.contains('active')) frame.src = frame.dataset.pdfSrc; }
  document.querySelectorAll('a[data-resume-link]').forEach(el => el.setAttribute('href',profile.resume));
  document.title = profile.name + ' · 个人主页模板';
}
function openSettings() {
  const profile = readProfile();
  for (const key of ['name','identity','email','resume']) document.getElementById('setting-' + key).value = profile[key];
  const modal = document.getElementById('template-settings');
  lastSettingsFocus = document.activeElement; modal.classList.add('active'); modal.setAttribute('aria-hidden','false');
  document.getElementById('settings-status').textContent = '';
  document.getElementById('setting-name').focus();
}
function closeSettings() {
  const modal = document.getElementById('template-settings');
  modal.classList.remove('active'); modal.setAttribute('aria-hidden','true');
  lastSettingsFocus?.focus(); lastSettingsFocus = null;
}
function validAssetPath(value) {
  return /^(?!\/\/)(?!.*(?:^|\/)\.\.(?:\/|$))[^<>"'\s\\]+\.pdf$/i.test(value) && !/^[a-z]+:/i.test(value) && !value.startsWith('/');
}
function saveProfile(event) {
  event.preventDefault();
  const profile = {};
  for (const key of ['name','identity','email','resume']) profile[key] = document.getElementById('setting-' + key).value.trim();
  if (!validAssetPath(profile.resume)) { document.getElementById('settings-status').textContent = '请填写站点内的 PDF 相对路径，例如 assets/template/resume-sample.pdf。'; return; }
  applyProfile(profile); closeSettings(); saveEdits();
}
function exportHTML() {
  const clone = document.documentElement.cloneNode(true);
  clone.querySelectorAll('[data-runtime]').forEach(el => el.remove());
  clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
  clone.querySelectorAll('.page').forEach(el => { el.classList.toggle('active',el.id === 'page-welcome'); el.style.removeProperty('pointer-events'); });
  clone.querySelector('#cert-modal')?.classList.remove('active');
  clone.querySelector('#cert-modal')?.setAttribute('aria-hidden','true');
  clone.querySelector('#cert-box-body')?.replaceChildren();
  clone.querySelector('#resume-frame')?.removeAttribute('src');
  clone.querySelector('#intro-overlay')?.remove();
  const body = clone.querySelector('body'); body.classList.remove('edit-active','reading-mode'); body.style.removeProperty('overflow');
  body.dataset.templateStorage = 'portfolio-template-export-' + Date.now();
  const blob = new Blob(['<!DOCTYPE html>\n' + clone.outerHTML],{type:'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = 'index.html'; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  showToast('已导出 index.html；与 assets 文件夹一起保存或分享。');
}

function closeMenu() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('active');
  const button = document.getElementById('hamburger'); button?.classList.remove('open'); button?.setAttribute('aria-expanded','false');
}
function toggleMenu() {
  const open = !document.getElementById('sidebar').classList.contains('open');
  document.getElementById('sidebar').classList.toggle('open',open);
  document.getElementById('sidebar-overlay').classList.toggle('active',open);
  document.getElementById('hamburger').classList.toggle('open',open);
  document.getElementById('hamburger').setAttribute('aria-expanded',String(open));
}
function setupTemplate() {
  // Keep navigation usable while editing the content of another page.
  document.querySelectorAll('#sidebar .sidebar-nav [data-edit]').forEach(el => el.removeAttribute('data-edit'));
  getEditables().forEach((el,index) => { if (!el.dataset.editKey) el.dataset.editKey = (el.closest('.page')?.id || 'profile') + ':' + index; });
  document.querySelectorAll('a[href="assets/template/resume-sample.pdf"]').forEach(el => el.dataset.resumeLink = '');
  const controls = document.createElement('div'); controls.dataset.runtime = '';
  controls.innerHTML = `<button id="hamburger" aria-label="打开导航菜单" aria-expanded="false" aria-controls="sidebar" onclick="toggleMenu()"><span></span><span></span><span></span></button>
    <div id="sidebar-overlay" onclick="closeMenu()"></div>
    <div id="edit-toolbar"><span>● 编辑示例</span><button class="ebtn ebtn-save" onclick="saveEdits()">保存到浏览器</button><button class="ebtn ebtn-exit" onclick="openSettings()">资料与链接设置</button><button class="ebtn ebtn-export" onclick="exportHTML()">导出 HTML</button><button class="ebtn ebtn-exit" onclick="exitEditMode()">退出编辑</button><button class="ebtn ebtn-reset" onclick="resetEdits()">恢复文件内容</button></div>
    <div id="edit-toast" role="status" aria-live="polite"></div>
    <div id="template-settings" class="template-settings" role="dialog" aria-modal="true" aria-labelledby="settings-title" aria-hidden="true"><form class="template-settings-panel" onsubmit="saveProfile(event)"><h2 id="settings-title">资料与链接设置</h2><p>先填写姓名和方向，再替换各卡片与 PDF。这里只保存到当前浏览器，导出 HTML 后才会写入可分享文件。</p><label>姓名<input id="setting-name" required maxlength="40"></label><label>学校 · 专业 · 身份<input id="setting-identity" required maxlength="120"></label><label>联系邮箱<input id="setting-email" type="email" required maxlength="120"></label><label>简历 PDF 相对路径<input id="setting-resume" required maxlength="200"></label><p class="settings-status" id="settings-status" role="alert"></p><div class="settings-actions"><button class="secondary" type="button" onclick="closeSettings()">取消</button><button type="submit">应用并保存</button></div></form></div>`;
  document.body.append(controls);
  document.querySelectorAll('[onclick]').forEach(el => {
    if (!['BUTTON','A','INPUT','FORM'].includes(el.tagName) && !el.closest('[data-runtime]') && el.id !== 'cert-backdrop') {
      el.tabIndex = 0; el.setAttribute('role','button');
      el.addEventListener('keydown',event => { if (['Enter',' '].includes(event.key) && event.target === el && !isEditMode) { event.preventDefault(); el.click(); } });
    }
  });
  // Editing a field inside a navigation card must keep the user on that page.
  document.addEventListener('click',event => { if (isEditMode && event.target.closest('[data-edit]')) { event.preventDefault(); event.stopImmediatePropagation(); } },true);
  document.addEventListener('paste',event => {
    if (!isEditMode || !event.target.closest('[data-edit]')) return;
    event.preventDefault(); document.execCommand('insertText',false,event.clipboardData.getData('text/plain'));
  });
  document.addEventListener('input',event => {
    const field = event.target.closest('[data-profile]');
    if (!isEditMode || !field) return;
    const key = field.dataset.profile;
    if (!['name','identity','email'].includes(key)) return;
    const value = field.textContent.trim();
    document.querySelectorAll('[data-profile="' + key + '"]').forEach(el => { if (el !== field) el.textContent = value; });
    if (key === 'name') {
      document.querySelectorAll('[data-profile="signature"]').forEach(el => el.textContent = '— ' + value);
      document.title = value + ' · 个人主页模板';
    }
    if (key === 'email') document.querySelectorAll('a[href^="mailto:"]').forEach(el => el.setAttribute('href','mailto:' + value));
  });
  loadEdits();
  showPage(location.hash.slice(1) || 'welcome',false);
  if (!document.querySelector('.page.active')) showPage('welcome',false);
  document.querySelectorAll('img.lazy-img').forEach(img => img.classList.add('loaded'));
  const intro = document.getElementById('intro-overlay');
  if (intro) { setTimeout(() => { intro.classList.add('done'); setTimeout(() => intro.remove(),800); },450); }
}
document.addEventListener('keydown',event => {
  const settings = document.getElementById('template-settings');
  const cert = document.getElementById('cert-modal');
  if (event.key === 'Escape') { if (settings?.classList.contains('active')) closeSettings(); else if (cert.classList.contains('active')) closeCert(); else closeMenu(); }
  const modal = settings?.classList.contains('active') ? settings : cert.classList.contains('active') ? cert : null;
  if (modal && event.key === 'Tab') {
    const focusables = Array.from(modal.querySelectorAll('button,input,iframe,a[href]'));
    const first = focusables[0], last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
window.addEventListener('hashchange',() => showPage(location.hash.slice(1),false));
window.addEventListener('resize',() => { if (window.innerWidth > 768) closeMenu(); });
setupTemplate();
