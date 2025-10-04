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

  emptyState?.classList.add('hidden');
  grid.classList.remove('hidden');

  seriesList.forEach(series => {
    const card = document.createElement('article');
    card.className = 'series-card';
    card.id = series.id;

    const cover = document.createElement('img');
    cover.className = 'series-cover';
    cover.loading = 'lazy';
    cover.src = series.coverImage || 'https://placehold.co/400x600/111827/94a3b8?text=Cover';
    cover.alt = `${series.title} cover`;

    const meta = document.createElement('div');
    meta.className = 'series-meta';
    meta.innerHTML = `
      <h3>${series.title}</h3>
      <p>${series.description || 'No description yet.'}</p>
    `;

    const chapterList = document.createElement('ul');
    chapterList.className = 'file-list';
    series.chapters.forEach(chapter => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `reader.html?series=${series.id}&chapter=${chapter.id}`;
      link.textContent = chapter.title;
      item.appendChild(link);
      chapterList.appendChild(item);
    });

    card.append(cover, meta, chapterList);
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

const seriesList = listSeries();
renderSeries(seriesList);

searchInput?.addEventListener('input', event => {
  filterSeries(event.target.value);
});
