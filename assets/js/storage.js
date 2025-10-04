const STORAGE_KEY = 'panelflow-library-v1';
const PROGRESS_KEY = 'panelflow-progress-v1';

const defaultLibrary = { series: {} };

const readStorage = key => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Storage read error', error);
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage write error', error);
  }
};

export const generateId = (prefix = 'id') => `${prefix}-${crypto.randomUUID()}`;

export const libraryStore = {
  load() {
    return { ...defaultLibrary, ...readStorage(STORAGE_KEY) };
  },
  save(library) {
    writeStorage(STORAGE_KEY, library);
  },
  reset() {
    writeStorage(STORAGE_KEY, defaultLibrary);
    writeStorage(PROGRESS_KEY, {});
  }
};

export const progressStore = {
  load() {
    return readStorage(PROGRESS_KEY) || {};
  },
  save(progress) {
    writeStorage(PROGRESS_KEY, progress);
  }
};

export const upsertSeries = async ({ title, description, coverImage }) => {
  const library = libraryStore.load();
  const existing = Object.values(library.series).find(
    series => series.title.toLowerCase() === title.trim().toLowerCase()
  );

  const seriesId = existing?.id || generateId('series');

  const series = {
    id: seriesId,
    title: title.trim(),
    description: description?.trim() || '',
    coverImage: coverImage || existing?.coverImage || '',
    chapters: existing?.chapters || {}
  };

  library.series[seriesId] = series;
  libraryStore.save(library);
  return series;
};

export const addChapter = async (seriesId, { title, pages }) => {
  const library = libraryStore.load();
  const series = library.series[seriesId];
  if (!series) throw new Error('Series not found');

  const chapterId = generateId('chapter');
  series.chapters[chapterId] = {
    id: chapterId,
    title: title.trim(),
    createdAt: new Date().toISOString(),
    pages
  };

  library.series[seriesId] = series;
  libraryStore.save(library);
  return series.chapters[chapterId];
};

export const listSeries = () => {
  const library = libraryStore.load();
  return Object.values(library.series).map(series => ({
    ...series,
    chapters: Object.values(series.chapters).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }));
};

export const getSeries = seriesId => {
  const library = libraryStore.load();
  const series = library.series[seriesId];
  if (!series) return null;
  return {
    ...series,
    chapters: Object.values(series.chapters).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  };
};

export const getChapter = (seriesId, chapterId) => {
  const series = getSeries(seriesId);
  if (!series) return null;
  return series.chapters.find(chapter => chapter.id === chapterId) || null;
};

export const saveProgress = ({ seriesId, chapterId, scrollOffset }) => {
  const progress = progressStore.load();
  progress[`${seriesId}:${chapterId}`] = {
    scrollOffset,
    updatedAt: Date.now()
  };
  progressStore.save(progress);
};

export const getProgress = ({ seriesId, chapterId }) => {
  const progress = progressStore.load();
  return progress[`${seriesId}:${chapterId}`] || null;
};

export const fileToDataUrl = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
