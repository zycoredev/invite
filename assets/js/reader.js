import { getSeries, getChapter, saveProgress, getProgress } from './storage.js';

const params = new URLSearchParams(window.location.search);
const seriesId = params.get('series');
const chapterId = params.get('chapter');

const seriesTitle = document.getElementById('seriesTitle');
const chapterTitle = document.getElementById('chapterTitle');
const pageContainer = document.getElementById('pageContainer');
const chapterSelect = document.getElementById('chapterSelect');
const backButton = document.getElementById('backButton');
const prevChapterBtn = document.getElementById('prevChapter');
const nextChapterBtn = document.getElementById('nextChapter');
const readingProgress = document.getElementById('readingProgress');

const init = () => {
  if (!seriesId || !chapterId) {
    window.location.href = 'index.html';
    return;
  }

  const series = getSeries(seriesId);
  if (!series) {
    window.location.href = 'index.html';
    return;
  }

  seriesTitle.textContent = series.title;

  chapterSelect.innerHTML = '';
  series.chapters.forEach(chapter => {
    const option = document.createElement('option');
    option.value = chapter.id;
    option.textContent = chapter.title;
    if (chapter.id === chapterId) option.selected = true;
    chapterSelect.appendChild(option);
  });

  const currentChapter = getChapter(seriesId, chapterId);
  if (!currentChapter) {
    window.location.href = 'index.html';
    return;
  }

  chapterTitle.textContent = currentChapter.title;
  renderPages(currentChapter);
  setupNavigation(series, currentChapter);
  restoreProgress(seriesId, chapterId);
};

const renderPages = chapter => {
  pageContainer.innerHTML = '';
  chapter.pages
    .sort((a, b) => a.index - b.index)
    .forEach(page => {
      const wrapper = document.createElement('figure');
      wrapper.className = 'reader-page';
      const img = document.createElement('img');
      img.src = page.src;
      img.alt = `${chapter.title} page ${page.index + 1}`;
      img.loading = 'lazy';
      wrapper.appendChild(img);
      pageContainer.appendChild(wrapper);
    });
};

const setupNavigation = (series, currentChapter) => {
  const chapterIndex = series.chapters.findIndex(ch => ch.id === currentChapter.id);
  const prevChapter = series.chapters[chapterIndex - 1];
  const nextChapter = series.chapters[chapterIndex + 1];

  const navigateTo = chapter => {
    if (!chapter) return;
    window.location.href = `reader.html?series=${series.id}&chapter=${chapter.id}`;
  };

  prevChapterBtn.disabled = !prevChapter;
  nextChapterBtn.disabled = !nextChapter;

  prevChapterBtn.onclick = () => navigateTo(prevChapter);
  nextChapterBtn.onclick = () => navigateTo(nextChapter);

  backButton.onclick = () => {
    window.history.length > 1 ? window.history.back() : (window.location.href = 'series.html');
  };

  chapterSelect.onchange = event => {
    const targetChapter = series.chapters.find(ch => ch.id === event.target.value);
    navigateTo(targetChapter);
  };
};

const restoreProgress = (seriesId, chapterId) => {
  const saved = getProgress({ seriesId, chapterId });
  if (saved) {
    setTimeout(() => {
      window.scrollTo({ top: saved.scrollOffset, behavior: 'auto' });
    }, 50);
  }
};

let saveTimer;
window.addEventListener('scroll', () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (!seriesId || !chapterId) return;
    saveProgress({ seriesId, chapterId, scrollOffset: window.scrollY });
    if (readingProgress) {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = totalHeight > 0 ? Math.min(100, Math.round((window.scrollY / totalHeight) * 100)) : 0;
      readingProgress.textContent = `Progress saved: ${percent}%`;
    }
  }, 300);
});

init();
