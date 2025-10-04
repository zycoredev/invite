const THEME_KEY = 'panelflow-theme';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const root = document.documentElement;
const toggle = document.getElementById('themeToggle');

const applyTheme = theme => {
  root.setAttribute('data-theme', theme);
  if (toggle) {
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'false' : 'true');
  }
  localStorage.setItem(THEME_KEY, theme);
};

const initTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved || (prefersDark.matches ? 'dark' : 'light');
  applyTheme(theme);
};

if (toggle) {
  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

prefersDark.addEventListener('change', event => {
  if (!localStorage.getItem(THEME_KEY)) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
});

initTheme();

const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}
