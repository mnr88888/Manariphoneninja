'use client';

import { useState, useRef, useEffect } from 'react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
}

const BANNER = [
  'محاكي الطرفية — iOS Terminal',
  'اكتب "مساعدة" لعرض الأوامر المتاحة',
  '',
];

export default function TerminalApp() {
  const [lines, setLines] = useState<TerminalLine[]>(
    BANNER.map((text, i) => ({ id: 'b' + i, type: 'system' as const, text }))
  );
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [fs, setFs] = useState<Record<string, string[]>>({
    '/': ['الملفات', 'المستندات', 'الصور', 'readme.txt'],
  });
  const [cwd, setCwd] = useState('/');

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const push = (type: TerminalLine['type'], text: string) =>
    setLines((prev) => [...prev, { id: 'l' + Date.now() + Math.random(), type, text }]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;

    push('input', `${cwd} $ ${cmd}`);
    setHistory((h) => [cmd, ...h]);
    setHistoryIdx(-1);

    const [base, ...args] = cmd.split(/\s+/);

    switch (base) {
      case 'مساعدة':
      case 'help':
        push('output', 'الأوامر المتاحة:');
        push('output', '  مساعدة          عرض هذه القائمة');
        push('output', '  مسار            عرض المسار الحالي');
        push('output', '  محتويات         عرض ملفات المجلد الحالي');
        push('output', '  انتقل <مجلد>    الانتقال إلى مجلد');
        push('output', '  اقرأ <ملف>      عرض محتوى ملف');
        push('output', '  أنشئ <ملف>      إنشاء ملف جديد');
        push('output', '  احذف <ملف>      حذف ملف');
        push('output', '  تاريخ           عرض الأوامر السابقة');
        push('output', '  انه للاسفل       امسح الشاشة');
        push('output', '  الوقت           عرض الوقت الحالي');
        break;

      case 'مسار':
      case 'pwd':
        push('output', cwd);
        break;

      case 'محتويات':
      case 'ls': {
        const items = fs[cwd] ?? [];
        if (items.length === 0) push('output', '(فارغ)');
        else items.forEach((f) => push('output', f));
        break;
      }

      case 'انتقل':
      case 'cd': {
        const target = args[0];
        if (!target || target === '..') {
          setCwd('/');
          push('output', 'الانتقال إلى /');
        } else {
          const path = target.startsWith('/') ? target : `${cwd === '/' ? '' : cwd}/${target}`;
          if (fs[path]) {
            setCwd(path);
            push('output', `الانتقال إلى ${path}`);
          } else {
            push('error', `المجلد غير موجود: ${target}`);
          }
        }
        break;
      }

      case 'اقرأ':
      case 'cat': {
        const target = args[0];
        const items = fs[cwd] ?? [];
        if (!target) {
          push('error', 'الاستخدام: اقرأ <ملف>');
        } else if (items.includes(target)) {
          push('output', `محتوى ${target}:`);
          push('output', 'هذا ملف نصي تجريبي في نظام المحاكاة.');
          push('output', 'يمكنك تعديله باستخدام أوامر إنشاء وحذف.');
        } else {
          push('error', `الملف غير موجود: ${target}`);
        }
        break;
      }

      case 'أنشئ':
      case 'touch': {
        const target = args[0];
        if (!target) {
          push('error', 'الاستخدام: أنشئ <ملف>');
        } else {
          setFs((prev) => ({
            ...prev,
            [cwd]: [...(prev[cwd] ?? []), target],
          }));
          push('output', `تم إنشاء: ${target}`);
        }
        break;
      }

      case 'احذف':
      case 'rm': {
        const target = args[0];
        if (!target) {
          push('error', 'الاستخدام: احذف <ملف>');
        } else {
          setFs((prev) => {
            const list = (prev[cwd] ?? []).filter((f) => f !== target);
            return { ...prev, [cwd]: list };
          });
          push('output', `تم الحذف: ${target}`);
        }
        break;
      }

      case 'تاريخ':
      case 'history':
        history.forEach((h, i) => push('output', `${i + 1}. ${h}`));
        break;

      case 'انه': // مسح الشاشة
      case 'clear':
        setLines([]);
        break;

      case 'الوقت':
      case 'date': {
        const d = new Date();
        push('output', d.toLocaleString('ar-SA'));
        break;
      }

      case 'منطق':
      case 'echo':
        push('output', args.join(' '));
        break;

      default:
        push('error', `أمر غير معروف: ${base}. اكتب "مساعدة" للمزيد.`);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-black font-mono">
      <div className="h-12 shrink-0" />

      {/* Output */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-3">
        {lines.map((l) => (
          <p
            key={l.id}
            className={`whitespace-pre-wrap text-[13px] leading-relaxed ${
              l.type === 'error'
                ? 'text-[#FF6B6B]'
                : l.type === 'input'
                  ? 'text-[#34C759]'
                  : l.type === 'system'
                    ? 'text-white/50'
                    : 'text-white/90'
            }`}
            dir="rtl"
          >
            {l.text}
          </p>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex shrink-0 items-center gap-2 border-t border-white/10 px-4 py-3">
        <span className="text-[#34C759] text-[13px]">{cwd} $</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              runCommand(input);
              setInput('');
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              const next = Math.min(historyIdx + 1, history.length - 1);
              if (next >= 0) {
                setHistoryIdx(next);
                setInput(history[next]);
              }
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              const next = historyIdx - 1;
              if (next < 0) {
                setHistoryIdx(-1);
                setInput('');
              } else {
                setHistoryIdx(next);
                setInput(history[next]);
              }
            }
          }}
          className="flex-1 bg-transparent text-[13px] text-[#34C759] outline-none"
          dir="rtl"
          autoComplete="off"
        />
      </div>

      <div className="flex shrink-0 justify-center pb-1.5">
        <div className="h-[5px] w-36 rounded-full bg-white/80" />
      </div>
    </div>
  );
}
