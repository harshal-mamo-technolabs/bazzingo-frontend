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
    return (
      <h1 className={className} style={style} onClick={onClick}>
        <span className={accentClass}>L</span>
        <span className={bodyClass}>UMR</span>
        <span className={accentClass}>I</span>
        <span className={accentClass}>A</span>
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

export function PlatformBrandText({ text, className, as: Tag = 'span' }) {
  const safeText = typeof text === 'string' ? text : '';
  return <Tag className={className}>{applyPlatformBrandToText(safeText)}</Tag>;
}

export default PlatformLogo;
