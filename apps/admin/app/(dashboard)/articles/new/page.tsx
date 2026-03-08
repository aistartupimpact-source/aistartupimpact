'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Save, ChevronDown, Image as ImageIcon, Hash, Clock, Globe,
  Settings2, X, CheckCircle, Upload, Bold, Italic, Underline,
  Heading1, Heading2, Quote, List, ListOrdered, Code, Link2, Minus, Type, Eye,
  Plus, ImagePlus,
} from 'lucide-react';

export default function NewArticlePage() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string>('status');
  const editorRef = useRef<HTMLDivElement>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);

  // Toolbar
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedRange = useRef<Range | null>(null);

  // Plus menu
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [plusBtnPos, setPlusBtnPos] = useState<number | null>(null);

  // Preview
  const [showPreview, setShowPreview] = useState(false);

  // Settings
  const [status, setStatus] = useState('DRAFT');
  const [scheduleDate, setScheduleDate] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [articleType, setArticleType] = useState('NEWS');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [sponsored, setSponsored] = useState(false);
  const [slug, setSlug] = useState('');
  const [coverUploaded, setCoverUploaded] = useState(false);

  // Save
  const [lastSaved, setLastSaved] = useState('just now');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Stats
  const [wordCount, setWordCount] = useState(0);
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  useEffect(() => {
    if (title && !slug) setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  }, [title]);

  const updateStats = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, []);

  // Track cursor for plus button
  const trackCursorLine = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode || !editorRef.current?.contains(sel.anchorNode)) {
      setPlusBtnPos(null);
      setShowPlusMenu(false);
      return;
    }
    let node: Node | null = sel.anchorNode;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const el = node as HTMLElement;
    if (!el || !editorWrapRef.current) { setPlusBtnPos(null); return; }
    const text = el.textContent || '';
    if (text.trim() === '') {
      const wrapRect = editorWrapRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setPlusBtnPos(elRect.top - wrapRect.top);
    } else {
      setPlusBtnPos(null);
      setShowPlusMenu(false);
    }
  }, []);

  // Floating toolbar
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !editorRef.current?.contains(sel.anchorNode)) {
      setShowToolbar(false);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    setToolbarPos({ x: rect.left + rect.width / 2 - editorRect.left, y: rect.top - editorRect.top - 50 });
    setShowToolbar(true);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  };
  const restoreSelection = () => {
    if (savedRange.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange.current);
    }
  };

  const format = (cmd: string, value?: string) => {
    restoreSelection();
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      restoreSelection();
      document.execCommand('createLink', false, linkUrl.trim());
      editorRef.current?.focus();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const doSave = (newStatus?: string) => {
    if (newStatus) setStatus(newStatus);
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setLastSaved(t);
      setSaveMsg(newStatus === 'PUBLISHED' ? 'Published!' : newStatus === 'IN_REVIEW' ? 'Submitted for review' : 'Saved');
      setTimeout(() => setSaveMsg(''), 2500);
    }, 400);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`w-10 h-6 rounded-full relative transition-colors ${value ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <span className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${value ? 'left-5' : 'left-1'}`} />
    </button>
  );

  const TBtn = ({ icon: Icon, cmd, value, label }: { icon: typeof Bold; cmd: string; value?: string; label?: string }) => (
    <button onMouseDown={(e) => { e.preventDefault(); format(cmd, value); }} title={label || cmd} className="p-1.5 hover:bg-white/20 rounded transition-colors">
      <Icon className="w-4 h-4" />
    </button>
  );

  const settingsPanels = [
    { id: 'status', label: 'Status & Schedule', icon: Clock },
    { id: 'category', label: 'Category & Tags', icon: Hash },
    { id: 'cover', label: 'Cover Image', icon: ImageIcon },
    { id: 'seo', label: 'SEO Settings', icon: Globe },
    { id: 'options', label: 'Article Options', icon: Settings2 },
  ];

  const plusMenuItems = [
    { icon: Heading1, label: 'Heading', desc: 'Large section heading', action: () => format('formatBlock', 'h2') },
    { icon: Heading2, label: 'Subheading', desc: 'Smaller section heading', action: () => format('formatBlock', 'h3') },
    { icon: Type, label: 'Body Text', desc: 'Normal paragraph', action: () => format('formatBlock', 'p') },
    { icon: Quote, label: 'Blockquote', desc: 'Highlighted quote', action: () => format('formatBlock', 'blockquote') },
    { icon: List, label: 'Bullet List', desc: 'Unordered list', action: () => format('insertUnorderedList') },
    { icon: ListOrdered, label: 'Numbered List', desc: 'Ordered list', action: () => format('insertOrderedList') },
    { icon: Code, label: 'Code Block', desc: 'Monospace snippet', action: () => { document.execCommand('formatBlock', false, 'pre'); editorRef.current?.focus(); } },
    { icon: Minus, label: 'Divider', desc: 'Horizontal line', action: () => { document.execCommand('insertHorizontalRule'); editorRef.current?.focus(); } },
    {
      icon: ImagePlus, label: 'Image', desc: 'Upload or embed', action: () => {
        document.execCommand('insertHTML', false, '<figure style="margin:24px 0"><img src="https://placehold.co/720x400/f8f9fa/6b7280?text=Image+Placeholder" alt="" style="width:100%;border-radius:12px" /><figcaption style="text-align:center;font-size:14px;color:#9ca3af;margin-top:8px" contenteditable="true">Add caption…</figcaption></figure><p><br></p>');
        editorRef.current?.focus();
      }
    },
  ];

  const editorClasses = `min-h-[500px] focus:outline-none font-jakarta text-[18px] text-charcoal dark:text-gray-200 leading-[1.8] selection:bg-brand/20
    [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-200 dark:[&:empty]:before:text-gray-700 [&:empty]:before:pointer-events-none
    [&_h2]:font-sora [&_h2]:font-bold [&_h2]:text-[28px] [&_h2]:text-navy dark:[&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-tight
    [&_h3]:font-sora [&_h3]:font-bold [&_h3]:text-[22px] [&_h3]:text-navy dark:[&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:leading-tight
    [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:pl-5 [&_blockquote]:py-2 [&_blockquote]:my-6 [&_blockquote]:italic [&_blockquote]:text-gray-500 dark:[&_blockquote]:text-gray-400 [&_blockquote]:text-xl
    [&_a]:text-brand [&_a]:underline [&_a]:decoration-brand/30 [&_a]:underline-offset-2
    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-1
    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-1
    [&_pre]:bg-gray-100 dark:[&_pre]:bg-gray-800 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:text-sm [&_pre]:font-mono [&_pre]:text-brand [&_pre]:my-4 [&_pre]:overflow-x-auto
    [&_code]:bg-gray-100 dark:[&_code]:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-brand
    [&_hr]:my-8 [&_hr]:border-gray-200 dark:[&_hr]:border-gray-700
    [&_figure]:my-6 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-gray-400 [&_figcaption]:mt-2
    [&_img]:rounded-xl [&_img]:w-full [&_p]:mb-4 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic`;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6">
      {/* Top Bar */}
      <div className="h-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/articles" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Link>
          <div className="flex items-center gap-2 text-xs font-jakarta text-gray-400">
            {saving && <><Save className="w-3 h-3 animate-spin" /> Saving...</>}
            {saveMsg && <><CheckCircle className="w-3 h-3 text-green-500" /> <span className="text-green-500">{saveMsg}</span></>}
            {!saving && !saveMsg && <span>Draft in {title ? `"${title.slice(0, 30)}${title.length > 30 ? '…' : ''}"` : 'untitled'}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-jakarta text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-lg transition-colors ${sidebarOpen ? 'bg-gray-100 dark:bg-gray-800 text-navy dark:text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <Settings2 className="w-4 h-4" />
          </button>
          <button onClick={() => doSave()} className="px-3 py-1.5 text-sm font-jakarta text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Save</button>
          <button onClick={() => doSave('PUBLISHED')} disabled={!title} className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-semibold rounded-full transition-colors">Publish</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Canvas */}
        <div className={`${sidebarOpen ? 'w-[65%]' : 'flex-1'} overflow-y-auto bg-white dark:bg-gray-950 transition-all`}>
          <div className="max-w-[720px] mx-auto py-12 px-6">
            {/* Cover */}
            {coverUploaded ? (
              <div className="mb-8 relative group">
                <div className="w-full h-80 bg-gradient-to-br from-brand/20 to-brand/5 dark:from-brand/10 dark:to-brand/5 rounded-xl flex items-center justify-center">
                  <span className="text-sm text-brand font-jakarta">cover-image.webp</span>
                </div>
                <button onClick={() => setCoverUploaded(false)} className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setCoverUploaded(true)} className="w-full mb-8 py-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-center hover:border-brand/40 transition-colors group">
                <Upload className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto group-hover:text-brand/50 transition-colors" />
                <p className="text-xs text-gray-300 dark:text-gray-600 font-jakarta mt-1.5 group-hover:text-brand/50">Add a cover image</p>
              </button>
            )}

            {/* Title */}
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full font-sora font-extrabold text-[42px] text-navy dark:text-white placeholder:text-gray-200 dark:placeholder:text-gray-700 bg-transparent focus:outline-none leading-[1.15] tracking-tight" />
            {/* Subtitle */}
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Tell your story…" className="w-full font-jakarta text-xl text-gray-400 dark:text-gray-500 placeholder:text-gray-200 dark:placeholder:text-gray-700 bg-transparent focus:outline-none mt-4 leading-relaxed" />

            <div className="my-8 h-px bg-gray-100 dark:bg-gray-800" />

            {/* Rich Editor */}
            <div ref={editorWrapRef} className="relative">
              {/* Plus Button */}
              {plusBtnPos !== null && (
                <div className="absolute left-[-44px] transition-all" style={{ top: `${plusBtnPos}px` }}>
                  <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowPlusMenu(!showPlusMenu); }}
                    className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${showPlusMenu ? 'bg-brand border-brand text-white rotate-45' : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-brand hover:text-brand'}`}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Plus Insert Menu */}
              {showPlusMenu && plusBtnPos !== null && (
                <div className="absolute left-0 z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-64 py-2" style={{ top: `${plusBtnPos + 36}px` }}>
                  <p className="px-3 pb-1 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide font-jakarta">Insert Block</p>
                  {plusMenuItems.map(({ icon: Icon, label, desc, action }) => (
                    <button key={label} onMouseDown={(e) => { e.preventDefault(); action(); setShowPlusMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-navy dark:text-white font-jakarta">{label}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-jakarta">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Floating Toolbar */}
              {showToolbar && (
                <div className="absolute z-30 flex flex-col items-center gap-1" style={{ left: `${Math.max(0, toolbarPos.x - 150)}px`, top: `${toolbarPos.y}px`, transform: 'translateY(-4px)' }} onMouseDown={(e) => e.preventDefault()}>
                  <div className="flex items-center gap-0.5 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white rounded-lg shadow-xl">
                    <TBtn icon={Bold} cmd="bold" label="Bold (⌘B)" />
                    <TBtn icon={Italic} cmd="italic" label="Italic (⌘I)" />
                    <TBtn icon={Underline} cmd="underline" label="Underline (⌘U)" />
                    <div className="w-px h-5 bg-gray-600 mx-1" />
                    <TBtn icon={Heading1} cmd="formatBlock" value="h2" label="Heading" />
                    <TBtn icon={Heading2} cmd="formatBlock" value="h3" label="Subheading" />
                    <div className="w-px h-5 bg-gray-600 mx-1" />
                    <TBtn icon={Quote} cmd="formatBlock" value="blockquote" label="Quote" />
                    <button onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowLinkInput(!showLinkInput); setLinkUrl(''); }} title="Add link" className={`p-1.5 rounded transition-colors ${showLinkInput ? 'bg-white/30' : 'hover:bg-white/20'}`}>
                      <Link2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-gray-600 mx-1" />
                    <TBtn icon={Type} cmd="removeFormat" label="Clear formatting" />
                  </div>
                  {showLinkInput && (
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-900 dark:bg-gray-700 rounded-lg shadow-xl w-72">
                      <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddLink(); if (e.key === 'Escape') { setShowLinkInput(false); restoreSelection(); } }} placeholder="Paste or type a link…" className="flex-1 bg-transparent text-white text-sm font-jakarta placeholder:text-gray-400 focus:outline-none px-1" autoFocus />
                      <button onClick={handleAddLink} className="px-2 py-0.5 bg-brand text-white text-xs font-semibold rounded">Apply</button>
                    </div>
                  )}
                </div>
              )}

              {/* Editor */}
              <div ref={editorRef} contentEditable suppressContentEditableWarning
                onInput={() => { updateStats(); trackCursorLine(); }}
                onKeyUp={trackCursorLine}
                onClick={trackCursorLine}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') { e.preventDefault(); format('insertText', '    '); }
                  if (e.key === '/') {
                    const sel = window.getSelection();
                    if (sel && sel.anchorNode) {
                      const t = sel.anchorNode.textContent || '';
                      if (t.trim() === '' || t.trim() === '/') { e.preventDefault(); setShowPlusMenu(true); }
                    }
                  }
                  if (e.key === 'Escape') setShowPlusMenu(false);
                }}
                data-placeholder="Write your story… Press / to insert blocks"
                className={editorClasses}
              />
            </div>

            {/* Footer stats */}
            <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-400 dark:text-gray-500 font-jakarta">
              <div className="flex items-center gap-4">
                <span>{wordCount.toLocaleString()} words</span>
                <span>·</span>
                <span>{readTime} min read</span>
              </div>
              <span className="text-xs">Saved {lastSaved}</span>
            </div>
          </div>
        </div>

        {/* Settings Sidebar */}
        {sidebarOpen && (
          <div className="w-[340px] border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white">Settings</h3>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {settingsPanels.map((panel) => (
                <div key={panel.id}>
                  <button onClick={() => setActivePanel(activePanel === panel.id ? '' : panel.id)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-2"><panel.icon className="w-4 h-4 text-gray-400" /><span className="font-jakarta font-medium text-sm text-navy dark:text-white">{panel.label}</span></div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${activePanel === panel.id ? 'rotate-180' : ''}`} />
                  </button>
                  {activePanel === panel.id && (
                    <div className="px-4 pb-4 space-y-3">
                      {panel.id === 'status' && (<>
                        <div><label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Status</label><select className="input-field text-sm" value={status} onChange={(e) => setStatus(e.target.value)}><option value="DRAFT">Draft</option><option value="IN_REVIEW">In Review</option><option value="SCHEDULED">Scheduled</option><option value="PUBLISHED">Published</option></select></div>
                        <div><label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Schedule For</label><input type="datetime-local" className="input-field text-sm" value={scheduleDate} onChange={(e) => { setScheduleDate(e.target.value); if (e.target.value) setStatus('SCHEDULED'); }} /></div>
                      </>)}
                      {panel.id === 'category' && (<>
                        <div><label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Category</label><select className="input-field text-sm" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Select…</option>{['AI News', 'Deep Dive', 'Founder Stories', 'Tools & Reviews', 'Funding', 'Opinion'].map(c => <option key={c}>{c}</option>)}</select></div>
                        <div><label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Tags</label><input type="text" className="input-field text-sm" placeholder="AI, LLM, India…" value={tags} onChange={(e) => setTags(e.target.value)} />{tags && <div className="flex flex-wrap gap-1 mt-2">{tags.split(',').filter(t => t.trim()).map(t => <span key={t} className="px-2 py-0.5 bg-brand/10 text-brand text-[10px] font-semibold rounded-full">{t.trim()}</span>)}</div>}</div>
                        <div><label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Type</label><select className="input-field text-sm" value={articleType} onChange={(e) => setArticleType(e.target.value)}>{['NEWS', 'STORY', 'OPINION', 'GUIDE', 'COMPARISON', 'REPORT', 'SPONSORED'].map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}</select></div>
                      </>)}
                      {panel.id === 'cover' && (
                        <div onClick={() => setCoverUploaded(true)} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${coverUploaded ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-brand'}`}>
                          {coverUploaded ? (<><CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" /><p className="text-sm text-green-600 dark:text-green-400 font-jakarta font-semibold">Uploaded</p><button onClick={(e) => { e.stopPropagation(); setCoverUploaded(false); }} className="text-xs text-red-500 hover:underline mt-2">Remove</button></>) : (<><Upload className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" /><p className="text-sm text-gray-400 font-jakarta">Click to upload</p><p className="text-xs text-gray-300 dark:text-gray-600 font-jakarta mt-1">16:9 · PNG, JPG, WebP</p></>)}
                        </div>
                      )}
                      {panel.id === 'seo' && (<>
                        <div><label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 flex items-center justify-between font-jakarta">SEO Title<span className={`normal-case ${seoTitle.length > 60 ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'}`}>{seoTitle.length}/60</span></label><input type="text" className="input-field text-sm" placeholder="SEO title…" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} /></div>
                        <div><label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 flex items-center justify-between font-jakarta">Meta Description<span className={`normal-case ${metaDesc.length > 160 ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'}`}>{metaDesc.length}/160</span></label><textarea className="input-field text-sm" rows={3} placeholder="Meta description…" value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} /></div>
                        <div><label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Focus Keyword</label><input type="text" className="input-field text-sm" placeholder="Primary keyword…" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} /></div>
                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">No Index</span><Toggle value={noIndex} onChange={setNoIndex} /></div>
                      </>)}
                      {panel.id === 'options' && (<>
                        <div className="flex items-center justify-between py-2"><span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">Featured Article</span><Toggle value={featured} onChange={setFeatured} /></div>
                        <div className="flex items-center justify-between py-2"><span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">Pinned to Top</span><Toggle value={pinned} onChange={setPinned} /></div>
                        <div className="flex items-center justify-between py-2"><span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">Sponsored Content</span><Toggle value={sponsored} onChange={setSponsored} /></div>
                        <div><label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">URL Slug</label><input type="text" className="input-field text-sm" placeholder="article-url-slug" value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
                      </>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-[720px] mx-auto flex items-center justify-between py-3 px-6">
              <span className="text-sm text-gray-500 font-jakarta">Preview Mode</span>
              <div className="flex items-center gap-3">
                <button onClick={() => doSave('PUBLISHED')} disabled={!title} className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-semibold rounded-full transition-colors">Publish</button>
                <button onClick={() => setShowPreview(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
            </div>
          </div>
          <div className="max-w-[720px] mx-auto py-12 px-6">
            {coverUploaded && (
              <div className="w-full h-80 bg-gradient-to-br from-brand/20 to-brand/5 rounded-xl flex items-center justify-center mb-8">
                <span className="text-sm text-brand font-jakarta">cover-image.webp</span>
              </div>
            )}
            <h1 className="font-sora font-extrabold text-[42px] text-navy dark:text-white leading-[1.15] tracking-tight">{title || 'Untitled'}</h1>
            {subtitle && <p className="font-jakarta text-xl text-gray-400 dark:text-gray-500 mt-4 leading-relaxed">{subtitle}</p>}
            <div className="flex items-center gap-3 mt-6 text-sm text-gray-400 font-jakarta">
              {category && <span className="px-2.5 py-0.5 bg-brand/10 text-brand rounded-full text-xs font-semibold">{category}</span>}
              <span>{wordCount.toLocaleString()} words</span>
              <span>·</span>
              <span>{readTime} min read</span>
            </div>
            <div className="my-8 h-px bg-gray-100 dark:bg-gray-800" />
            <div className={editorClasses} dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || '<p style="color:#ccc;font-style:italic">No content yet…</p>' }} />
          </div>
        </div>
      )}
    </div>
  );
}
