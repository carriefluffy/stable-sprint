import React from 'react';
import type { ReactNode } from 'react';

export interface StatusItem {
  label: string;
  value: ReactNode;
  light?: 'live' | 'beta' | 'soon' | 'warn' | 'error';
}

export interface StatusBarProps {
  items: StatusItem[];
  right?: ReactNode;
  className?: string;
}

/**
 * Compact Sega HUD strip. Label + value rhythm, status lights paired with
 * text (never color-only). Used as the global system/network/wallet strip.
 */
export const StatusBar: React.FC<StatusBarProps> = ({ items, right, className }) => (
  <div
    className={[
      'flex items-center gap-3 sm:gap-5 px-4 py-2.5 max-w-5xl mx-auto w-full flex-wrap',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')}
    role="status"
  >
    {items.map((it) => (
      <div key={it.label} className="flex items-center gap-1.5">
        <span className="tech-label text-white/45" style={{ fontSize: '13px' }}>
          {it.label}:
        </span>
        <div className="flex items-center gap-1.5">
          {it.light && (
            <span aria-hidden="true" className={`status-light status-light-${it.light}`} />
          )}
          <span className="tech-value text-cream" style={{ fontSize: '13px', fontWeight: 'bold' }}>
            {it.value}
          </span>
        </div>
      </div>
    ))}
    {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
  </div>
);
