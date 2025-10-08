import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage = 1, totalItems = 0, pageSize = 20, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const go = (p) => onPageChange?.(clamp(p, 1, totalPages));

  // Build a compact page list with ellipses
  const pages = [];
  const windowSize = 1; // neighbors on each side
  const add = (p) => pages.push(p);
  const addDots = (key) => pages.push(key);
  const start = Math.max(2, currentPage - windowSize);
  const end = Math.min(totalPages - 1, currentPage + windowSize);

  add(1);
  if (start > 2) addDots('dots-left');
  for (let p = start; p <= end; p++) add(p);
  if (end < totalPages - 1) addDots('dots-right');
  if (totalPages > 1) add(totalPages);

  return (
    <nav className="pgn" aria-label="Pagination">
      <button className="pgn-btn" onClick={() => go(1)} disabled={currentPage === 1} aria-label="First page">«</button>
      <button className="pgn-btn" onClick={() => go(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">‹</button>
      <ul className="pgn-list">
        {pages.map((p, idx) => (
          typeof p === 'number' ? (
            <li key={p}>
              <button
                className={`pgn-page${p === currentPage ? ' active' : ''}`}
                onClick={() => go(p)}
                aria-current={p === currentPage ? 'page' : undefined}
              >
                {p}
              </button>
            </li>
          ) : (
            <li key={`${p}-${idx}`} className="pgn-dots" aria-hidden>…</li>
          )
        ))}
      </ul>
      <button className="pgn-btn" onClick={() => go(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">›</button>
      <button className="pgn-btn" onClick={() => go(totalPages)} disabled={currentPage === totalPages} aria-label="Last page">»</button>
    </nav>
  );
};

export default Pagination;
