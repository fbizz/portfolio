const projectsContainer = document.querySelector('#content.cards');
const filterButtons = [...document.querySelectorAll('.filter[data-filter]')];
const activeFilters = {
  context: new Set(),
  discipline: new Set()
};
let projects = [];

function formatProjectNumber(number) {
  if (number === null || number === undefined) return '--';
  return String(number).padStart(2, '0');
}

function formatShortYear(year) {
  if (!year) return '----';
  return String(year);
}

function normalizeFilter(value) {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'freelancing' || normalized === 'self employed') {
    return 'freelance';
  }
  return normalized;
}

function createTitle(title, projectNumber) {
  const heading = document.createElement('h3');
  heading.className = 'card__title';

  title.trim().split(/\s+/).forEach((word, index) => {
    const span = document.createElement('span');
    const useSerif = (index + (projectNumber || 0)) % 2 === 1;
    span.className = useSerif
      ? 'card__title-word card__title-word--serif'
      : 'card__title-word card__title-word--sans';
    span.textContent = word;
    heading.append(span);
  });

  return heading;
}

function createProjectCard(project) {
  const article = document.createElement('article');
  article.className = 'card';
  article.setAttribute(
    'aria-label',
    `Projekt ${formatProjectNumber(project.number)}: ${project.title}`
  );

  const link = document.createElement('a');
  link.className = 'card__link';
  link.href = `./project.html?slug=${encodeURIComponent(project.slug)}`;
  link.setAttribute('aria-label', `Projekt ${project.title} öffnen`);

  const content = document.createElement('div');
  content.className = 'card__content';

  const cover = project.previewImages?.[0] || project.headerImages?.[0];
  if (cover) {
    const visual = document.createElement('div');
    visual.className = 'card__visual';

    const image = document.createElement('img');
    image.className = 'card__image';
    image.src = cover.url;
    image.alt = cover.name || `${project.title} Vorschau`;
    image.loading = 'lazy';
    visual.append(image);
    link.append(visual);
  }

  const title = createTitle(project.title, project.number);

  const meta = document.createElement('div');
  meta.className = 'card__meta';
  meta.setAttribute('aria-label', 'Projektinformationen');

  const tag = document.createElement('span');
  tag.className = 'card__tag';
  tag.textContent =
    project.filterTags?.find((value) =>
      ['apprenticeship', 'freelance', 'freelancing', 'bm', 'bachelor'].includes(
        normalizeFilter(value)
      )
    ) || project.category;

  const year = document.createElement('span');
  year.className = 'card__year';
  year.textContent = formatShortYear(project.year);

  meta.append(tag, year);
  content.append(title, meta);
  link.append(content);
  article.append(link);

  return article;
}

function showStatus(message, isError = false) {
  projectsContainer.replaceChildren();

  const status = document.createElement('p');
  status.className = `cards__status${isError ? ' cards__status--error' : ''}`;
  status.textContent = message;
  projectsContainer.append(status);
}

function projectMatchesFilters(project) {
  const tags = new Set((project.filterTags || []).map(normalizeFilter));

  return Object.entries(activeFilters).every(([, selected]) => {
    if (!selected.size) return true;
    return [...selected].some((filter) => tags.has(normalizeFilter(filter)));
  });
}

function renderProjects() {
  const visibleProjects = projects.filter(projectMatchesFilters);

  if (!visibleProjects.length) {
    showStatus('Keine Projekte entsprechen dieser Auswahl.');
    return;
  }

  projectsContainer.replaceChildren(
    ...visibleProjects.map(createProjectCard)
  );
}

async function loadProjects() {
  try {
    const response = await fetch('/api/projects');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Projekte konnten nicht geladen werden.');
    }

    projects = data.projects;

    if (!projects.length) {
      showStatus('Zurzeit sind keine Projekte veröffentlicht.');
      return;
    }

    renderProjects();
  } catch (error) {
    console.error('Error loading projects:', error);
    showStatus('Projekte konnten nicht geladen werden.', true);
  }
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const group = button.closest('[data-filter-group]')?.dataset.filterGroup;
    const value = button.dataset.filter;
    if (!group || !value) return;

    const selected = activeFilters[group];
    if (selected.has(value)) {
      selected.delete(value);
    } else {
      selected.add(value);
    }

    button.setAttribute('aria-pressed', String(selected.has(value)));
    renderProjects();
  });
});

if (projectsContainer) {
  loadProjects();
}
