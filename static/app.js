(function () {
  'use strict';

  // ── DOM refs ──────────────────────────────────
  const quoteText = document.getElementById('quote-text');
  const quoteAuthor = document.getElementById('quote-author');
  const quoteCategories = document.getElementById('quote-categories');
  const authorInput = document.getElementById('authorInput');
  const categoryInput = document.getElementById('categoryInput');
  const newBtn = document.getElementById('newBtn');
  const clearBtn = document.getElementById('clearBtn');

  // ── Fetch a random quote (with optional filters) ──
  async function fetchQuote() {
    const author = authorInput.value.trim();
    const category = categoryInput.value.trim();
    const params = new URLSearchParams();
    if (author) params.append('author', author);
    if (category) params.append('category', category);

    try {
      const resp = await fetch('/api/quote?' + params.toString());
      if (!resp.ok) {
        const err = await resp.json();
        quoteText.textContent = err.error || 'No quotes found.';
        quoteText.classList.add('error');
        quoteAuthor.textContent = '';
        quoteCategories.textContent = '';
        return;
      }

      const data = await resp.json();
      quoteText.textContent = '\u201C' + data.text + '\u201D';
      quoteText.classList.remove('error');
      quoteAuthor.textContent = '\u2014 ' + data.author;
      quoteCategories.textContent = data.categories.join(' \u00B7 ');
    } catch (e) {
      quoteText.textContent = 'Could not reach the server.';
      quoteText.classList.add('error');
      quoteAuthor.textContent = '';
      quoteCategories.textContent = '';
    }
  }

  // ── Populate datalists for autocomplete ───────
  async function populateDatalist(url, datalistId) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) return;
      const items = await resp.json();
      const dl = document.getElementById(datalistId);
      dl.innerHTML = '';
      items.forEach(function (item) {
        const opt = document.createElement('option');
        opt.value = item;
        dl.appendChild(opt);
      });
    } catch (_) {
      // Silently ignore – autocomplete is a nice‑to‑have.
    }
  }

  // ── Event listeners ───────────────────────────
  newBtn.addEventListener('click', fetchQuote);

  clearBtn.addEventListener('click', function () {
    authorInput.value = '';
    categoryInput.value = '';
    fetchQuote();
  });

  // Allow pressing Enter in either input to trigger a new quote.
  authorInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') fetchQuote();
  });
  categoryInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') fetchQuote();
  });

  // ── Bootstrap ─────────────────────────────────
  populateDatalist('/api/authors', 'authorList');
  populateDatalist('/api/categories', 'categoryList');
  fetchQuote();
})();
