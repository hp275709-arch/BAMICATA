import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Code, Layout, RotateCcw, Image, Save, Check } from 'lucide-react';
import { FlipPage } from '../types';

interface PageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: FlipPage[];
  onSavePages: (newPages: FlipPage[]) => void;
  onResetDefault: () => void;
  currentPageIndex: number;
}

export const PageEditorModal: React.FC<PageEditorModalProps> = ({
  isOpen,
  onClose,
  pages,
  onSavePages,
  onResetDefault,
  currentPageIndex,
}) => {
  const [localPages, setLocalPages] = useState<FlipPage[]>(pages);
  const [selectedIndex, setSelectedIndex] = useState<number>(Math.min(currentPageIndex, pages.length - 1));
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync when modal opens or pages change
  React.useEffect(() => {
    if (isOpen) {
      setLocalPages(pages);
      setSelectedIndex(Math.min(currentPageIndex, pages.length - 1));
      setJsonText(JSON.stringify(pages, null, 2));
      setJsonError(null);
      setSaveSuccess(false);
    }
  }, [isOpen, pages, currentPageIndex]);

  if (!isOpen) return null;

  const activePage = localPages[selectedIndex] || localPages[0];

  const updateActiveField = <K extends keyof FlipPage>(field: K, value: FlipPage[K]) => {
    const updated = [...localPages];
    updated[selectedIndex] = {
      ...updated[selectedIndex],
      [field]: value,
    };
    setLocalPages(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleAddItem = () => {
    const currentItems = activePage.items || [];
    updateActiveField('items', [...currentItems, ['New Item', 'Specification or detail']]);
  };

  const handleUpdateItem = (itemIdx: number, keyIdx: 0 | 1, val: string) => {
    const currentItems = [...(activePage.items || [])];
    if (!currentItems[itemIdx]) return;
    const itemCopy: [string, string] = [currentItems[itemIdx][0], currentItems[itemIdx][1]];
    itemCopy[keyIdx] = val;
    currentItems[itemIdx] = itemCopy;
    updateActiveField('items', currentItems);
  };

  const handleDeleteItem = (itemIdx: number) => {
    const currentItems = (activePage.items || []).filter((_, i) => i !== itemIdx);
    updateActiveField('items', currentItems);
  };

  const handleAddNewPage = () => {
    const newPage: FlipPage = {
      id: `page-${Date.now()}`,
      k: `CHAPTER ${String(localPages.length + 1).padStart(2, '0')}`,
      t: 'New Chapter<br>Title',
      c: 'A thoughtful paragraph exploring ideas, objects, and craftsmanship.',
      f: 'EDITORIAL SECTION',
      art: true,
    };
    const updated = [...localPages, newPage];
    setLocalPages(updated);
    setSelectedIndex(updated.length - 1);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleDeletePage = (idx: number) => {
    if (localPages.length <= 1) return;
    const updated = localPages.filter((_, i) => i !== idx);
    setLocalPages(updated);
    setSelectedIndex(Math.max(0, idx - 1));
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleMovePage = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= localPages.length) return;
    const updated = [...localPages];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setLocalPages(updated);
    setSelectedIndex(targetIdx);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setLocalPages(parsed);
        setJsonError(null);
      } else {
        setJsonError('JSON must be an array of page objects.');
      }
    } catch (err: unknown) {
      setJsonError((err as Error).message);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateActiveField('imageUrl', result);
        updateActiveField('art', true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSavePages(localPages);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[85vh] bg-[#18181b] border border-stone-800 rounded-sm shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-editorial-serif text-2xl text-stone-100 font-normal">
              Flipbook Page Studio
            </h2>
            <div className="flex items-center bg-stone-900 rounded-sm p-0.5 border border-stone-800 text-xs">
              <button
                onClick={() => setViewMode('visual')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xs transition-colors ${
                  viewMode === 'visual'
                    ? 'bg-stone-800 text-amber-300 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Layout size={13} />
                <span>Visual Editor</span>
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xs transition-colors ${
                  viewMode === 'json'
                    ? 'bg-stone-800 text-amber-300 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Code size={13} />
                <span>JSON Code</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset all pages to original sample edition?')) {
                  onResetDefault();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-400 hover:text-rose-300 bg-stone-900 hover:bg-stone-850 rounded-sm border border-stone-800 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset Default</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-sm transition-colors shadow-xs"
            >
              {saveSuccess ? <Check size={14} /> : <Save size={14} />}
              <span>{saveSuccess ? 'Saved!' : 'Save & View'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 rounded-sm hover:bg-stone-800 transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        {viewMode === 'visual' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Left page list sidebar */}
            <div className="w-64 border-r border-stone-800 bg-stone-950/60 flex flex-col">
              <div className="p-3 border-b border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                <span className="font-editorial-sans uppercase tracking-wider text-[11px]">
                  Pages ({localPages.length})
                </span>
                <button
                  onClick={handleAddNewPage}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-amber-300 bg-stone-900 hover:bg-stone-800 rounded-xs border border-stone-800 transition-colors"
                >
                  <Plus size={12} />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {localPages.map((p, idx) => {
                  const isSelected = idx === selectedIndex;
                  const cleanTitle = p.t.replace(/<br\s*\/?>/gi, ' ');
                  return (
                    <div
                      key={p.id || idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`w-full p-2.5 rounded-sm text-left flex items-center justify-between text-xs cursor-pointer border group transition-colors ${
                        isSelected
                          ? 'bg-stone-850 border-amber-400/50 text-stone-100'
                          : 'bg-transparent border-transparent hover:bg-stone-900 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[11px] text-amber-400/70 font-semibold shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="truncate">
                          <p className="font-editorial-serif text-stone-200 truncate">{cleanTitle}</p>
                          <p className="text-[10px] text-stone-500 font-editorial-sans uppercase truncate">
                            {p.k}
                          </p>
                        </div>
                      </div>

                      {/* Reorder / Delete shortcuts */}
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePage(idx, 'up');
                          }}
                          disabled={idx === 0}
                          className="p-1 hover:text-white disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePage(idx, 'down');
                          }}
                          disabled={idx === localPages.length - 1}
                          className="p-1 hover:text-white disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown size={12} />
                        </button>
                        {localPages.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(idx);
                            }}
                            className="p-1 hover:text-rose-400"
                            title="Delete page"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right form editor for active page */}
            {activePage && (
              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#18181b]">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-amber-400/80 font-mono">
                      Page {String(selectedIndex + 1).padStart(2, '0')} Editor
                    </span>
                    <h3 className="font-editorial-serif text-xl text-stone-100 font-normal">
                      Customize Content &amp; Layout
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMovePage(selectedIndex, 'up')}
                      disabled={selectedIndex === 0}
                      className="px-2.5 py-1 text-xs bg-stone-900 border border-stone-800 rounded-sm text-stone-300 disabled:opacity-30"
                    >
                      Move Earlier
                    </button>
                    <button
                      onClick={() => handleMovePage(selectedIndex, 'down')}
                      disabled={selectedIndex === localPages.length - 1}
                      className="px-2.5 py-1 text-xs bg-stone-900 border border-stone-800 rounded-sm text-stone-300 disabled:opacity-30"
                    >
                      Move Later
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Eyebrow */}
                  <div>
                    <label className="block text-xs font-editorial-sans text-stone-400 mb-1.5 uppercase tracking-wider">
                      Eyebrow / Category (k)
                    </label>
                    <input
                      type="text"
                      value={activePage.k || ''}
                      onChange={(e) => updateActiveField('k', e.target.value)}
                      placeholder="e.g. CHAPTER 01, ISSUE 01, WELCOME"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-750 rounded-sm text-stone-100 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Footer */}
                  <div>
                    <label className="block text-xs font-editorial-sans text-stone-400 mb-1.5 uppercase tracking-wider">
                      Footer Label (f)
                    </label>
                    <input
                      type="text"
                      value={activePage.f || ''}
                      onChange={(e) => updateActiveField('f', e.target.value)}
                      placeholder="e.g. DESIGN NOTES, LOOKBOOK, FLIPBOOK STUDIO"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-750 rounded-sm text-stone-100 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-editorial-sans text-stone-400 uppercase tracking-wider">
                      Title (t) — supports HTML &lt;br&gt; for editorial linebreaks
                    </label>
                    <button
                      type="button"
                      onClick={() => updateActiveField('t', activePage.t + '<br>')}
                      className="text-[11px] text-amber-300 hover:underline font-mono"
                    >
                      + Insert &lt;br&gt;
                    </button>
                  </div>
                  <input
                    type="text"
                    value={activePage.t || ''}
                    onChange={(e) => updateActiveField('t', e.target.value)}
                    placeholder="e.g. THE<br>NEW<br>FORM"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-750 rounded-sm text-stone-100 text-sm focus:outline-none focus:border-amber-400 font-editorial-serif text-lg"
                  />
                </div>

                {/* Body Copy */}
                <div>
                  <label className="block text-xs font-editorial-sans text-stone-400 mb-1.5 uppercase tracking-wider">
                    Copy Text / Narrative (c)
                  </label>
                  <textarea
                    rows={3}
                    value={activePage.c || ''}
                    onChange={(e) => updateActiveField('c', e.target.value)}
                    placeholder="An independent collection exploring everyday design..."
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-750 rounded-sm text-stone-100 text-sm focus:outline-none focus:border-amber-400 font-editorial-serif leading-relaxed"
                  />
                </div>

                {/* Image Section */}
                <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-editorial-sans text-stone-300 uppercase tracking-wider flex items-center gap-2">
                      <Image size={14} className="text-amber-400" />
                      <span>Page Visual / Photography (art)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(activePage.art || activePage.imageUrl)}
                        onChange={(e) => updateActiveField('art', e.target.checked)}
                        className="rounded-xs accent-amber-400"
                      />
                      <span>Show Image on Page</span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {activePage.imageUrl && (
                      <div className="w-24 h-24 rounded-xs overflow-hidden bg-stone-950 border border-stone-700 shrink-0">
                        <img
                          src={activePage.imageUrl}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        value={activePage.imageUrl || ''}
                        onChange={(e) => updateActiveField('imageUrl', e.target.value)}
                        placeholder="Image URL or upload custom file..."
                        className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-sm text-stone-200 text-xs focus:outline-none focus:border-amber-400"
                      />
                      <label className="inline-block px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-sm cursor-pointer transition-colors">
                        <span>Upload Custom Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Items List Section */}
                <div className="space-y-3 pt-2 border-t border-stone-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-editorial-sans text-stone-400 uppercase tracking-wider">
                      Item Rows (items)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1 text-xs text-amber-300 hover:underline"
                    >
                      <Plus size={12} />
                      <span>Add Item Row</span>
                    </button>
                  </div>

                  {activePage.items && activePage.items.length > 0 ? (
                    <div className="space-y-2">
                      {activePage.items.map(([name, desc], itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => handleUpdateItem(itemIdx, 0, e.target.value)}
                            placeholder="Item Name (e.g. Relaxed cotton shirt)"
                            className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-sm text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            value={desc}
                            onChange={(e) => handleUpdateItem(itemIdx, 1, e.target.value)}
                            placeholder="Detail (e.g. Soft structure · easy fit)"
                            className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-sm text-stone-300 text-xs focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(itemIdx)}
                            className="p-1.5 text-stone-500 hover:text-rose-400"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 italic font-editorial-serif">
                      No item rows on this page. Click &ldquo;Add Item Row&rdquo; if you want to feature products, specs, or materials.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Raw JSON editor mode */
          <div className="flex-1 flex flex-col p-6 bg-[#18181b]">
            <div className="flex items-center justify-between pb-2 text-xs text-stone-400">
              <span>Directly edit or paste the pages array in JSON format:</span>
              {jsonError && <span className="text-rose-400 font-mono">{jsonError}</span>}
            </div>
            <textarea
              value={jsonText}
              onChange={handleJsonChange}
              rows={20}
              className="flex-1 w-full p-4 bg-stone-950 font-mono text-xs text-amber-200 border border-stone-800 rounded-sm focus:outline-none focus:border-amber-400"
            />
          </div>
        )}
      </div>
    </div>
  );
};
