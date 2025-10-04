import { listSeries } from './storage.js';

const grid = document.getElementById('seriesGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('seriesSearch');

const renderSeries = seriesList => {
  if (!grid) return;
  grid.innerHTML = '';

  if (!seriesList.length) {
    emptyState?.classList.remove('hidden');
    grid.classList.add('hidden');
    return;
  }

  grid.classList.remove('hidden');
  emptyState?.classList.add('hidden');

  seriesList.forEach(series => {
    const card = document.createElement('article');
    card.className = 'series-card';

    const cover = document.createElement('img');
    cover.className = 'series-cover';
    cover.alt = `${series.title} cover`;
    cover.loading = 'lazy';
    cover.src = series.coverImage || 'https://placehold.co/400x600/111827/94a3b8?text=Cover';

    const meta = document.createElement('div');
    meta.className = 'series-meta';
    meta.innerHTML = `
      <h3>${series.title}</h3>
      <p>${series.description || 'No description yet.'}</p>
      <p><strong>${series.chapters.length}</strong> chapter${series.chapters.length === 1 ? '' : 's'}</p>
    `;

    const actions = document.createElement('div');
    actions.className = 'series-actions';

    const viewButton = document.createElement('a');
    viewButton.className = 'btn primary';
    const firstChapter = series.chapters[0];
    viewButton.href = firstChapter
      ? `reader.html?series=${series.id}&chapter=${firstChapter.id}`
      : 'admin.html';
    viewButton.textContent = firstChapter ? 'Read' : 'Add Chapter';

    const detailButton = document.createElement('a');
    detailButton.className = 'btn secondary';
    detailButton.href = `series.html#${series.id}`;
    detailButton.textContent = 'Details';

    actions.append(viewButton, detailButton);
    card.append(cover, meta, actions);
    grid.appendChild(card);
  });
};

const filterSeries = term => {
  const seriesList = listSeries();
  const filtered = seriesList.filter(series =>
    series.title.toLowerCase().includes(term.toLowerCase())
  );
  renderSeries(filtered);
};

if (grid) {
  const seriesList = listSeries();
  renderSeries(seriesList);

  searchInput?.addEventListener('input', event => {
    filterSeries(event.target.value);
  });
}
