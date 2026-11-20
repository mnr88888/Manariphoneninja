'use client';

import { useState, useCallback } from 'react';

/**
 * Functional iOS-style calculator app (Arabic interface).
 * Demonstrates state preservation: the OS keeps this component mounted
 * (hidden) when you switch away, so your calculation is preserved.
 */
export default function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [previous, setPrevious] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = useCallback(
    (digit: string) => {
      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
      } else {
        setDisplay(display === '0' ? digit : display + digit);
      }
    },
    [display, waitingForOperand]
  );

  const inputDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPrevious(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const toggleSign = useCallback(() => {
    setDisplay((d) => {
      if (d === '0') return d;
      return d.startsWith('-') ? d.slice(1) : '-' + d;
    });
  }, []);

  const percent = useCallback(() => {
    setDisplay((d) => String(parseFloat(d) / 100));
  }, []);

  const compute = useCallback(
    (a: number, b: number, op: string): number => {
      switch (op) {
        case '+':
          return a + b;
        case '−':
          return a - b;
        case '×':
          return a * b;
        case '÷':
          return b === 0 ? 0 : a / b;
        default:
          return b;
      }
    },
    []
  );

  const handleOperator = useCallback(
    (nextOp: string) => {
      const current = parseFloat(display);
      if (previous == null) {
        setPrevious(current);
      } else if (operator && !waitingForOperand) {
        const result = compute(previous, current, operator);
        setPrevious(result);
        setDisplay(String(result));
      }
      setOperator(nextOp);
      setWaitingForOperand(true);
    },
    [display, previous, operator, waitingForOperand, compute]
  );

  const equals = useCallback(() => {
    if (previous == null || operator == null) return;
    const current = parseFloat(display);
    const result = compute(previous, current, operator);
    setDisplay(String(result));
    setPrevious(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [display, previous, operator, compute]);

  // Format display with Arabic-friendly grouping
  const formatDisplay = (val: string) => {
    if (val === 'Error') return val;
    const [intPart, decPart] = val.split('.');
    const isNeg = intPart.startsWith('-');
    const digits = isNeg ? intPart.slice(1) : intPart;
    const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    let result = isNeg ? '-' + grouped : grouped;
    if (decPart != null) result += '.' + decPart;
    return result;
  };

  const Btn = ({
    label,
    onClick,
    variant = 'dark',
    wide = false,
    active = false,
  }: {
    label: string;
    onClick: () => void;
    variant?: 'dark' | 'light' | 'accent' | 'op';
    wide?: boolean;
    active?: boolean;
  }) => {
    const base =
      'flex h-[72px] items-center justify-center rounded-full text-2xl font-medium transition-all active:brightness-125 select-none';
    const variants = {
      dark: 'bg-[#333333] text-white hover:bg-[#3a3a3a]',
      light: 'bg-[#a5a5a5] text-black hover:bg-[#b0b0b0]',
      accent: 'bg-[#ff9f0a] text-white hover:bg-[#ffb030]',
      op: active
        ? 'bg-white text-[#ff9f0a]'
        : 'bg-[#ff9f0a] text-white hover:bg-[#ffb030]',
    };
    return (
      <button
        onClick={onClick}
        className={`${base} ${variants[variant]} ${
          wide ? 'col-span-2 pl-8 text-right' : ''
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-black">
      {/* Status spacer */}
      <div className="h-12 shrink-0" />

      {/* Display */}
      <div className="flex flex-1 flex-col items-end justify-end px-6 pb-3">
        <div className="w-full text-right">
          {/* Operator hint */}
          {operator && previous != null && (
            <div className="mb-1 text-lg text-white/40">
              {formatDisplay(String(previous))} {operator}
            </div>
          )}
          <div
            className="font-light text-white tabular-nums leading-none"
            style={{
              fontSize: display.length > 8 ? '2.5rem' : '4rem',
              minHeight: '4rem',
            }}
          >
            {formatDisplay(display)}
          </div>
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-3 px-3 pb-6">
        <Btn label="AC" variant="light" onClick={clearAll} />
        <Btn label="±" variant="light" onClick={toggleSign} />
        <Btn label="٪" variant="light" onClick={percent} />
        <Btn
          label="÷"
          variant="op"
          active={operator === '÷'}
          onClick={() => handleOperator('÷')}
        />

        <Btn label="٧" variant="dark" onClick={() => inputDigit('7')} />
        <Btn label="٨" variant="dark" onClick={() => inputDigit('8')} />
        <Btn label="٩" variant="dark" onClick={() => inputDigit('9')} />
        <Btn
          label="×"
          variant="op"
          active={operator === '×'}
          onClick={() => handleOperator('×')}
        />

        <Btn label="٤" variant="dark" onClick={() => inputDigit('4')} />
        <Btn label="٥" variant="dark" onClick={() => inputDigit('5')} />
        <Btn label="٦" variant="dark" onClick={() => inputDigit('6')} />
        <Btn
          label="−"
          variant="op"
          active={operator === '−'}
          onClick={() => handleOperator('−')}
        />

        <Btn label="١" variant="dark" onClick={() => inputDigit('1')} />
        <Btn label="٢" variant="dark" onClick={() => inputDigit('2')} />
        <Btn label="٣" variant="dark" onClick={() => inputDigit('3')} />
        <Btn
          label="+"
          variant="op"
          active={operator === '+'}
          onClick={() => handleOperator('+')}
        />

        <Btn label="٠" variant="dark" wide onClick={() => inputDigit('0')} />
        <Btn label="." variant="dark" onClick={inputDot} />
        <Btn label="=" variant="accent" onClick={equals} />
      </div>

      {/* Home indicator */}
      <div className="flex shrink-0 justify-center pb-1.5">
        <div className="h-[5px] w-36 rounded-full bg-white/80" />
      </div>
    </div>
  );
}
