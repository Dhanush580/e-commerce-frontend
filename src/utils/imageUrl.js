// Returns a displayable image URL from various shapes:
// - absolute URLs returned as-is
// - '/images/:id' returned as-is
// - '/uploads/...' returned as-is (dev proxy will handle)
// - bare ObjectId -> '/images/:id'
// - filename like 'image-*.jpg' -> tries '/uploads/filename'
// Accepts a string or a product object.
const API_BASE = (import.meta?.env?.VITE_API_URL || '').replace(/\/$/, '');

function normalizeAbsolute(u) {
	try {
		const abs = new URL(u);
		if (!API_BASE) return u;
		const api = new URL(API_BASE);
		// If the absolute URL points to our backend paths but with a different host or insecure protocol,
		// rewrite to use the configured API base to avoid mixed content and CORS issues.
		if (abs.pathname.startsWith('/images') || abs.pathname.startsWith('/uploads')) {
			return `${API_BASE}${abs.pathname}${abs.search || ''}`;
		}
		// Generic upgrade: if absolute is http and API base is https, try upgrading protocol
		if (abs.protocol === 'http:' && api.protocol === 'https:') {
			return u.replace(/^http:\/\//i, 'https://');
		}
		return u;
	} catch (_) {
		return u;
	}
}

function prefix(path) {
  if (!path) return path;
  // In dev, API_BASE may be empty and Vite proxy will handle relative paths.
  return API_BASE ? `${API_BASE}${path}` : path;
}

export function resolveImageUrl(input) {
	let u = input;
	if (input && typeof input === 'object') {
		const img = input.image || (Array.isArray(input.images) && input.images[0]);
		u = img || '';
	}
	if (!u) return 'https://via.placeholder.com/500x500?text=No+Image';
		if (/^https?:\/\//i.test(u)) return normalizeAbsolute(u);
	if (/^\/images\//.test(u)) return prefix(u);
	if (/^\/uploads\//.test(u)) return prefix(u);
	if (/^[a-f\d]{24}$/i.test(u)) return prefix(`/images/${u}`);
	// Fallback: looks like a filename from legacy disk storage
	if (/^image-\d{10,}-\d+\.[a-z0-9]+$/i.test(u)) return prefix(`/uploads/${u}`);
	return u;
}

