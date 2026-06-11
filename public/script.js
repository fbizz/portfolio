const projectsContainer = document.querySelector('#content.cards');
const filtersContainer = document.querySelector('.project-filters');
const contextFilterValues = new Set([
  'apprenticeship',
  'freelance',
  'bm',
  'bachelor'
]);
let projects = [];
let availableTagOptions = [];

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
  if (
    normalized === 'freelancing' ||
    normalized === 'self employed' ||
    normalized === 'selbstständig' ||
    normalized === 'selbständig'
  ) {
    return 'freelance';
  }
  return normalized;
}

function getProjectFilterValues(project, group) {
  const values = new Set((project.filterTags || []).map(normalizeFilter));
  if (group !== 'context') return values;

  const context = [
    project.category,
    project.institution,
    project.role
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    context.includes('freelance') ||
    context.includes('self employed') ||
    context.includes('selbstständig') ||
    context.includes('selbständig') ||
    context.includes('freiberuf')
  ) {
    values.add('freelance');
  }
  if (context.includes('bachelor')) values.add('bachelor');
  if (
    context.includes('apprenticeship') ||
    context.includes('apprentice') ||
    context.includes('ausbildung') ||
    context.includes('auszubild') ||
    context.includes('lehre') ||
    context.includes('lernend') ||
    context.includes('lehrling')
  ) {
    values.add('apprenticeship');
  }
  if (
    context.includes('berufsmatur') ||
    context.includes('bm ') ||
    context.endsWith(' bm')
  ) {
    values.add('bm');
  }

  return values;
}

function getAvailableFilters() {
  const filters = {
    context: new Map(),
    discipline: new Map()
  };

  availableTagOptions.forEach((tag) => {
    const normalizedValue = normalizeFilter(tag);
    const group = contextFilterValues.has(normalizedValue)
      ? 'context'
      : 'discipline';
    filters[group].set(normalizedValue, tag);
  });

  projects.forEach((project) => {
    getProjectFilterValues(project, 'context').forEach((normalizedValue) => {
      if (!contextFilterValues.has(normalizedValue)) return;

      const label =
        (project.filterTags || []).find(
          (tag) => normalizeFilter(tag) === normalizedValue
        ) ||
        {
          apprenticeship: 'Apprenticeship',
          freelance: 'Freelance',
          bm: 'BM',
          bachelor: 'Bachelor'
        }[normalizedValue];

      filters.context.set(normalizedValue, label);
    });

    (project.filterTags || []).forEach((tag) => {
      const normalizedValue = normalizeFilter(tag);
      if (contextFilterValues.has(normalizedValue)) return;
      filters.discipline.set(normalizedValue, tag);
    });
  });

  return filters;
}

function createFilterButton(value, label) {
  const button = document.createElement('button');
  button.className = 'filter';
  button.type = 'button';
  button.dataset.filter = value;
  button.setAttribute('aria-pressed', 'false');
  button.textContent = label;
  return button;
}

function renderFilters() {
  const availableFilters = getAvailableFilters();

  Object.entries(availableFilters).forEach(([group, values]) => {
    const groupElement = document.querySelector(
      `[data-filter-group="${group}"]`
    );
    if (!groupElement) return;

    const sortedValues = [...values.entries()].sort(([, labelA], [, labelB]) =>
      labelA.localeCompare(labelB, 'de', { sensitivity: 'base' })
    );

    if (group === 'discipline') {
      const rows = [];

      for (let index = 0; index < sortedValues.length; index += 4) {
        const row = document.createElement('div');
        row.className = 'project-filters__row';
        row.append(
          ...sortedValues
            .slice(index, index + 4)
            .map(([value, label]) => createFilterButton(value, label))
        );
        rows.push(row);
      }

      groupElement.replaceChildren(...rows);
    } else {
      groupElement.replaceChildren(
        ...sortedValues.map(([value, label]) =>
          createFilterButton(value, label)
        )
      );
    }

    groupElement.parentElement.hidden = !sortedValues.length;
  });
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
  const groups = [...document.querySelectorAll('[data-filter-group]')];

  return groups.every((groupElement) => {
    const group = groupElement.dataset.filterGroup;
    const selected = [
      ...groupElement.querySelectorAll('.filter[aria-pressed="true"]')
    ].map((button) => button.dataset.filter);

    if (!selected.length) return true;
    const values = getProjectFilterValues(project, group);
    return selected.some((filter) =>
      values.has(normalizeFilter(filter))
    );
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
    availableTagOptions = data.tagOptions || [];

    if (!projects.length) {
      showStatus('Zurzeit sind keine Projekte veröffentlicht.');
      return;
    }

    renderFilters();
    renderProjects();
  } catch (error) {
    console.error('Error loading projects:', error);
    showStatus('Projekte konnten nicht geladen werden.', true);
  }
}

filtersContainer?.addEventListener('click', (event) => {
  const button = event.target.closest('.filter[data-filter]');
  if (!button || !filtersContainer.contains(button)) return;

  const isActive = button.getAttribute('aria-pressed') === 'true';
  button.setAttribute('aria-pressed', String(!isActive));
  renderProjects();
});

if (projectsContainer) {
  loadProjects();
}
