import React, { memo, useEffect, useMemo, useRef, useState } from "react";

/**
 * Headless dropdown (no external CSS) with optional search.
 *
 * Props:
 *  - options: [{ key: string, label: string }]
 *  - value: string | undefined
 *  - onChange: (key: string | "") => void
 *  - placeholder?: string
 *  - searchable?: boolean (default false)
 *  - clearable?: boolean (default false) — shows "Clear filter" when selected
 *  - align?: 'left' | 'right' (default 'left')
 *  - width?: string (tailwind width class; default 'w-56')
 *  - maxHeightClass?: string (default 'max-h-[60vh]')
 *  - buttonClassName?: string — styling for the trigger button
 *  - menuClassName?: string — extra classes for menu container
 */
function SelectMenu({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  searchable = false,
  clearable = false,
  align = "left",
  width = "w-56",
  maxHeightClass = "max-h-[60vh]",
  buttonClassName = "",
  menuClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [q, setQ] = useState("");
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const selected = useMemo(
    () => options.find(o => o.key === value),
    [options, value]
  );

  const filtered = useMemo(() => {
    if (!searchable || !q.trim()) return options;
    const s = q.trim().toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(s));
  }, [options, q, searchable]);

  // open/close helpers
  useEffect(() => {
    const onDoc = (e) => {
      if (!open) return;
      const t = e.target;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, [open]);

  // keyboard nav when menu is open
  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const opt = filtered[activeIndex];
        if (opt) {
          onChange?.(opt.key);
          setOpen(false);
          btnRef.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, activeIndex, filtered, onChange]);

  // keep activeIndex in sync with current selection / filter results
  useEffect(() => {
    const i = Math.max(0, filtered.findIndex(o => o.key === value));
    setActiveIndex(i >= 0 ? i : 0);
  }, [value, filtered]);

  // focus search when opening
  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open, searchable]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={[
          "px-4 py-1 rounded-lg text-[13px] font-medium shadow-sm",
          "text-gray-700 bg-white border border-gray-300",
          "flex items-center justify-between gap-2 min-w-[160px]",
          "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200",
          buttonClassName,
        ].join(" ")}
        title={selected?.label || placeholder}
      >
        <span className="truncate">{selected?.label || placeholder}</span>
        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={[
            "absolute z-50 mt-2",
            align === "left" ? "left-0" : "right-0",
            width,
            "bg-white border border-gray-200 rounded-md shadow-md overflow-hidden",
            menuClassName,
          ].join(" ")}
        >
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          )}
          <ul className={["py-1 overflow-auto", maxHeightClass].join(" ")}>
            {clearable && value ? (
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onChange?.(""); setOpen(false); btnRef.current?.focus(); }}
                  className="w-full text-left px-3 py-2 text-xs md:text-sm text-gray-700 hover:bg-gray-50"
                >
                  Clear filter
                </button>
              </li>
            ) : null}

            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs md:text-sm text-gray-500">No results</li>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = opt.key === value;
                const isActive = idx === activeIndex;
                return (
                  <li key={opt.key}>
                    <button
                      type="button"
                      role="menuitem"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        onChange?.(opt.key);
                        setOpen(false);
                        btnRef.current?.focus();
                      }}
                      className={[
                        "w-full text-left px-3 py-2 text-xs md:text-sm transition-colors",
                        isActive ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50",
                        isSelected && "font-semibold",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default memo(SelectMenu);
