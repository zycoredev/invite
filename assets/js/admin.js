import { libraryStore, listSeries, upsertSeries, addChapter, fileToDataUrl } from './storage.js';

const form = document.getElementById('uploadForm');
const dropZone = document.getElementById('dropZone');
const hiddenFileInput = document.getElementById('chapterImages');
const fileList = document.getElementById('fileList');
const libraryList = document.getElementById('libraryList');
const clearLibrary = document.getElementById('clearLibrary');

let queuedFiles = [];

const refreshLibrary = () => {
  libraryList.innerHTML = '';
  const series = listSeries();
  if (!series.length) {
    libraryList.innerHTML = '<p class="empty-state">No chapters yet.</p>';
    return;
  }

  series.forEach(entry => {
    const item = document.createElement('article');
    item.className = 'library-item';
    item.innerHTML = `
      <h3>${entry.title}</h3>
      <p>${entry.description || 'No description.'}</p>
    `;

    const chapterList = document.createElement('ul');
    entry.chapters.forEach(chapter => {
      const li = document.createElement('li');
      li.textContent = `${chapter.title} • ${chapter.pages.length} pages`;
      chapterList.appendChild(li);
    });

    item.appendChild(chapterList);
    libraryList.appendChild(item);
  });
};

const updateFileList = () => {
  fileList.innerHTML = '';
  if (!queuedFiles.length) {
    fileList.innerHTML = '<li>No images selected.</li>';
    return;
  }

  const sorted = [...queuedFiles].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  sorted.forEach((file, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${file.name}`;
    fileList.appendChild(li);
  });
};

const handleFiles = files => {
  queuedFiles = [...queuedFiles, ...files];
  updateFileList();
};

const handleDrop = event => {
  event.preventDefault();
  dropZone.classList.remove('dragover');
  if (event.dataTransfer?.files?.length) {
    handleFiles([...event.dataTransfer.files]);
  }
};

dropZone?.addEventListener('click', () => hiddenFileInput.click());
dropZone?.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    hiddenFileInput.click();
  }
});

dropZone?.addEventListener('dragover', event => {
  event.preventDefault();
  dropZone.classList.add('dragover');
});

;['dragleave', 'dragend'].forEach(type => {
  dropZone?.addEventListener(type, () => dropZone.classList.remove('dragover'));
});

hiddenFileInput?.addEventListener('change', event => {
  if (event.target.files?.length) {
    handleFiles([...event.target.files]);
    hiddenFileInput.value = '';
  }
});

form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!queuedFiles.length) {
    alert('Please add at least one image.');
    return;
  }

  const data = new FormData(form);
  const seriesTitle = data.get('seriesTitle');
  const seriesDescription = data.get('seriesDescription');
  const chapterTitle = data.get('chapterTitle');
  const coverFile = data.get('coverImage');

  const coverImage = coverFile?.size ? await fileToDataUrl(coverFile) : null;
  const series = await upsertSeries({ title: seriesTitle, description: seriesDescription, coverImage });

  const pages = await Promise.all(
    [...queuedFiles]
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map(async (file, index) => ({
        id: `${series.id}-page-${index}`,
        index,
        name: file.name,
        src: await fileToDataUrl(file)
      }))
  );

  await addChapter(series.id, { title: chapterTitle, pages });
  form.reset();
  queuedFiles = [];
  updateFileList();
  refreshLibrary();
  alert('Chapter saved! You can now read it in the library.');
});

clearLibrary?.addEventListener('click', () => {
  if (confirm('This will remove all series and chapters. Continue?')) {
    libraryStore.reset();
    queuedFiles = [];
    updateFileList();
    refreshLibrary();
  }
});

refreshLibrary();
updateFileList();
