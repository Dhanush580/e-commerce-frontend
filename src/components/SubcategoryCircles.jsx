import React from 'react';
import './SubcategoryCircles.css';

// items: [{ value, label, image }]
// value: current selected, onChange: (value) => void
const SubcategoryCircles = ({ items, value, onChange }) => {
  return (
    <div className="subcat-circles">
      <div className="subcat-circles-inner">
        {items.map((it) => (
          <button
            key={it.value || 'all'}
            className={`subcat-circle ${value === it.value ? 'active' : ''}`}
            onClick={() => onChange(it.value)}
            aria-pressed={value === it.value}
            title={it.label}
          >
            <div className="subcat-circle-img">
              {it.image ? (
                <img src={it.image} alt={it.label} />
              ) : (
                <div className="subcat-circle-placeholder">{it.label?.charAt(0) || '?'}</div>
              )}
            </div>
            <span className="subcat-circle-label">{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubcategoryCircles;
