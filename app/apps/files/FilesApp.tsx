'use client';

import { useState, useMemo } from 'react';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  File,
  Plus,
  Trash2,
  ChevronLeft,
  ArrowRight,
  X,
  FolderPlus,
} from 'lucide-react';
import { usePersistentState, uid, formatArabicDate } from '../shared/utils';

interface SimFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'pdf';
  folder: string;
  size: string;
  content?: string;
  gradient?: string;
  timestamp: number;
}

const SAMPLE_FILES: SimFile[] = [
  {
    id: 'f1',
    name: 'تقرير المشروع.docx',
    type: 'document',
    folder: 'المستندات',
    size: '٢٤٥ كيلوبايت',
    content:
      'هذا تقرير المشروع الشهري.\nيتضمن التقرير ملخصاً للإنجازات والمهام القادمة.\n\n- إكمال المرحلة الأولى\n- بدء الاختبارات\n- إعداد النسخة التجريبية',
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: 'f2',
    name: 'صورة العائلة.jpg',
    type: 'image',
    folder: 'الصور',
    size: '١.٢ ميغابايت',
    gradient: 'linear-gradient(135deg, #FF9A56 0%, #FFD46B 100%)',
    timestamp: Date.now() - 86400000 * 5,
  },
  {
    id: 'f3',
    name: 'العقد.pdf',
    type: 'pdf',
    folder: 'المستندات',
    size: '٨٩٠ كيلوبايت',
    content: 'عقد إيجار\n\nالطرف الأول: ...\nالطرف الثاني: ...\n\nهذا مستند تجريبي للعرض فقط.',
    timestamp: Date.now() - 86400000 * 10,
  },
  {
    id: 'f4',
    name: 'ملاحظات الاجتماع.txt',
    type: 'document',
    folder: 'عمل',
    size: '١٢ كيلوبايت',
    content: 'ملاحظات اجتماع الاثنين:\n\n1. مراجعة خطة الربع القادم\n2. تعيين مسؤول جديد للجودة\n3. إطلاق الحملة التسويقية',
    timestamp: Date.now() - 3600000 * 6,
  },
];

export default function FilesApp() {
  const [files, setFiles] = usePersistentState<SimFile[]>('files-app', SAMPLE_FILES);
  const [folders, setFolders] = usePersistentState<string[]>('files-folders', [
    'المستندات',
    'الصور',
    'عمل',
  ]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [openFile, setOpenFile] = useState<SimFile | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const folderFiles = useMemo(
    () => files.filter((f) => f.folder === currentFolder),
    [files, currentFolder]
  );

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    setFolders((prev) => [...prev, newFolderName.trim()]);
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const deleteFolder = (name: string) => {
    setFolders((prev) => prev.filter((f) => f !== name));
    setFiles((prev) => prev.filter((f) => f.folder !== name));
  };

  /* ---------- File preview ---------- */
  if (openFile) {
    return (
      <div className="absolute inset-0 flex flex-col bg-white">
        <div className="h-12 shrink-0" />
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => setOpenFile(null)}
            className="flex items-center gap-1 text-[#007AFF]"
          >
            <ChevronLeft className="h-5 w-5" />
            رجوع
          </button>
          <button
            onClick={() => {
              setFiles((prev) => prev.filter((f) => f.id !== openFile.id));
              setOpenFile(null);
            }}
            className="text-[#FF3B30]"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {openFile.type === 'image' ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div
              className="h-80 w-full rounded-[18px]"
              style={{ backgroundImage: openFile.gradient }}
            />
          </div>
        ) : (
          <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-3">
            <h1 className="text-xl font-bold text-black">{openFile.name}</h1>
            <p className="mt-1 text-xs text-black/40">
              {openFile.size} · {formatArabicDate(openFile.timestamp)}
            </p>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-black">
              {openFile.content ?? 'لا توجد معاينة لهذا الملف'}
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ---------- Folder browser ---------- */
  const FileIcon = ({ type }: { type: SimFile['type'] }) =>
    type === 'image' ? (
      <ImageIcon className="h-5 w-5" />
    ) : type === 'pdf' ? (
      <File className="h-5 w-5" />
    ) : (
      <FileText className="h-5 w-5" />
    );

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
      <div className="h-12 shrink-0" />
      <div className="flex items-center justify-between px-4 pb-2">
        <h1 className="text-3xl font-bold text-black">
          {currentFolder ?? 'المتصفح'}
        </h1>
        <button
          onClick={() => setShowNewFolder(true)}
          className="text-[#007AFF]"
        >
          <FolderPlus className="h-6 w-6" />
        </button>
      </div>

      {currentFolder && (
        <button
          onClick={() => setCurrentFolder(null)}
          className="mr-4 flex items-center gap-1 self-start text-[17px] text-[#007AFF]"
        >
          <ArrowRight className="h-5 w-5" />
          المجلدات
        </button>
      )}

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        {!currentFolder ? (
          <>
            <p className="pb-1 pt-2 text-[13px] text-black/40">المجلدات</p>
            <div className="grid grid-cols-3 gap-3">
              {folders.map((f) => (
                <div key={f} className="relative">
                  <button
                    onClick={() => setCurrentFolder(f)}
                    className="flex w-full flex-col items-center gap-1 rounded-[12px] bg-white py-4"
                  >
                    <Folder className="h-10 w-10 fill-[#0A84FF]/20 text-[#0A84FF]" />
                    <span className="text-[12px] text-black">{f}</span>
                    <span className="text-[10px] text-black/40">
                      {files.filter((x) => x.folder === f).length} عنصر
                    </span>
                  </button>
                  <button
                    onClick={() => deleteFolder(f)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF3B30] text-white"
                  >
                    <span className="text-xs">−</span>
                  </button>
                </div>
              ))}
            </div>

            <p className="pb-1 pt-4 text-[13px] text-black/40">الملفات الحديثة</p>
            <div className="overflow-hidden rounded-[12px] bg-white">
              {files.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOpenFile(f)}
                  className="flex w-full items-center gap-3 border-b border-black/5 px-4 py-2.5 text-right last:border-0"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#0A84FF]/10 text-[#0A84FF]">
                    <FileIcon type={f.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] text-black">{f.name}</p>
                    <p className="text-[12px] text-black/40">
                      {f.folder} · {f.size}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {folderFiles.length === 0 ? (
              <p className="mt-16 text-center text-sm text-black/40">
                هذا المجلد فارغ
              </p>
            ) : (
              <div className="overflow-hidden rounded-[12px] bg-white">
                {folderFiles.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOpenFile(f)}
                    className="flex w-full items-center gap-3 border-b border-black/5 px-4 py-2.5 text-right last:border-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#0A84FF]/10 text-[#0A84FF]">
                      <FileIcon type={f.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] text-black">{f.name}</p>
                      <p className="text-[12px] text-black/40">{f.size}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles((prev) => prev.filter((x) => x.id !== f.id));
                      }}
                      className="text-[#FF3B30]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* New folder sheet */}
      {showNewFolder && (
        <div
          className="absolute inset-0 z-40 flex flex-col justify-end bg-black/40"
          onClick={() => setShowNewFolder(false)}
        >
          <div
            className="rounded-t-[20px] bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => setShowNewFolder(false)}>
                <X className="h-5 w-5 text-[#007AFF]" />
              </button>
              <span className="font-semibold">مجلد جديد</span>
              <button onClick={createFolder} className="font-semibold text-[#007AFF]">
                إضافة
              </button>
            </div>
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="اسم المجلد"
              className="w-full rounded-[10px] bg-black/5 px-3 py-2.5 outline-none"
              dir="rtl"
            />
          </div>
        </div>
      )}

      <div className="flex shrink-0 justify-center pb-1.5">
        <div className="h-[5px] w-36 rounded-full bg-black/80" />
      </div>
    </div>
  );
}
