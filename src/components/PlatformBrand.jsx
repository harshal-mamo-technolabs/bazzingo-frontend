import React from 'react';
import {
  applyPlatformBrandToText,
  getPlatformLogoPath,
  getPlatformName,
  isLumriaBrandEnabled,
} from '../config/accessControl';

export function PlatformLogo({ className = '', style, alt }) {
  return (
    <img
      src={getPlatformLogoPath()}
      alt={alt || `${getPlatformName()} logo`}
      className={className}
      style={style}
    />
  );
}

export function PlatformWordmark({ className = '', style, onClick }) {
  const brandName = getPlatformName().toUpperCase();
  const accentClass = 'text-[#FF6B3E]';
  const bodyClass = 'text-black';

  if (isLumriaBrandEnabled()) {
    // Render the configured brand name (getPlatformName) generically so the
    // header wordmark always reflects PLATFORM_BRAND_CONTROLS. First and last
    // letters take the accent colour to match the house style.
    const letters = brandName.split('');
    return (
      <h1 className={className} style={style} onClick={onClick}>
        {letters.map((ch, i) => (
          <span key={i} className={i === 0 || i === letters.length - 1 ? accentClass : bodyClass}>
            {ch}
          </span>
        ))}
      </h1>
    );
  }

  return (
    <h1 className={className} style={style} onClick={onClick}>
      <span className={accentClass}>B</span>
      <span className={bodyClass}>AZZIN</span>
      <span className={accentClass}>G</span>
      <span className={accentClass}>O</span>
    </h1>
  );
}

/**
 * Compact brand lockup: brain icon + the dynamic brand name as text. Use this
 * where a baked-in logo image would otherwise hardcode the brand (e.g. generated
 * reports and certificates), so the mark always reflects PLATFORM_BRAND_CONTROLS.
 */
export function PlatformLockup({ className = '', iconClassName = 'h-8 w-auto', textClassName = 'text-2xl' }) {
  const name = getPlatformName().toUpperCase();
  const first = name.slice(0, 1);
  const last = name.length > 1 ? name.slice(-1) : '';
  const middle = name.length > 2 ? name.slice(1, -1) : '';
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img src="/header/bxs_brain.png" alt="" className={iconClassName} style={{ objectFit: 'contain' }} />
      <span className={`font-extrabold tracking-wide leading-none ${textClassName}`}>
        <span style={{ color: '#FF6B3E' }}>{first}</span>
        <span style={{ color: '#111827' }}>{middle}</span>
        {last && <span style={{ color: '#FF6B3E' }}>{last}</span>}
      </span>
    </div>
  );
}

export function PlatformBrandText({ text, className, as: Tag = 'span' }) {
  const safeText = typeof text === 'string' ? text : '';
  return <Tag className={className}>{applyPlatformBrandToText(safeText)}</Tag>;
}

export default PlatformLogo;
