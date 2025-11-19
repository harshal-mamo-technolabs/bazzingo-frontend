import React, { useEffect, useRef, useState, memo } from "react";
import TranslatedText from "../TranslatedText.jsx";

/**
 * A headless-style dropdown that looks consistent across browsers.
 * No external CSS; only utility classes. Accessible + keyboard friendly.
 *
 * Props:
 *  - options: [{ key: 'last7Days', label: 'Last 7 Days' }, ...]
 *  - value: currently selected key
 *  - onChange: (key) => void
 *  - className: optional extra classes for the trigger
 *  - align: 'left' | 'right' (default 'right')
 *  - width: tailwind width (default 'w-44')
 */
const TimeRangeDropdown = ({
  options = [],
  value,
  onChange,
  className = "",
  align = "right",
  width = "w-44",
  buttonLabel, // optional: override visible label
  fullWidth = false,
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(
    Math.max(0, options.findIndex(o => o.key === value))
  );

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const selected = options.find(o => o.key === value);
  const label = buttonLabel || selected?.label || "Select";

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      const t = e.target;
      if (buttonRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, [open]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i => Math.min(options.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i => Math.max(0, i - 1));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const opt = options[activeIndex];
        if (opt) {
          onChange?.(opt.key);
          setOpen(false);
          buttonRef.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, activeIndex, options, onChange]);

  // Ensure activeIndex follows value changes
  useEffect(() => {
    const i = options.findIndex(o => o.key === value);
    if (i >= 0) setActiveIndex(i);
  }, [value, options]);

  return (
    <div className={["relative inline-block text-left", fullWidth ? "w-full" : ""].join(" ")}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={[
          "px-4 py-2 rounded-lg text-xs md:text-sm font-medium",
          "text-gray-700 bg-white border border-gray-300",
          "flex items-center justify-between gap-2",
          fullWidth ? "w-full" : "min-w-[160px]",
          "shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200",
          className
        ].join(" ")}
      >
        <span className="truncate">
          <TranslatedText text={label} />
        </span>
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
            "bg-white border border-gray-200 rounded-md shadow-md overflow-hidden"
          ].join(" ")}
        >
          <ul className="max-h-64 overflow-auto py-1">
            {options.map((opt, idx) => {
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
                      buttonRef.current?.focus();
                    }}
                    className={[
                      "w-full text-left px-3 py-2 text-xs md:text-sm",
                      "transition-colors",
                      isActive ? "bg-orange-50 text-orange-600" : "text-gray-700",
                      !isActive && "hover:bg-gray-50",
                      isSelected && "font-semibold"
                    ].join(" ")}
                  >
                    <TranslatedText text={opt.label} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default memo(TimeRangeDropdown);
