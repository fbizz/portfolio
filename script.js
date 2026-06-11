const projectsContainer = document.querySelector('#content.cards');

function formatProjectNumber(number) {
  if (number === null || number === undefined) return '--';
  return String(number).padStart(2, '0');
}

function formatShortYear(year) {
  if (!year) return '--';
  return String(year).slice(-2);
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

  const visual = document.createElement('div');
  visual.className = 'card__visual';

  const cover = project.previewImages?.[0] || project.headerImages?.[0];
  if (cover) {
    const image = document.createElement('img');
    image.className = 'card__image';
    image.src = cover.url;
    image.alt = cover.name || `${project.title} Vorschau`;
    image.loading = 'lazy';
    visual.append(image);
  } else {
    visual.classList.add('card__visual--empty');
  }

  const overlay = document.createElement('div');
  overlay.className = 'card__image-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  visual.append(overlay);

  const number = document.createElement('span');
  number.className = 'card__no';
  number.textContent = formatProjectNumber(project.number);
  visual.append(number);

  const content = document.createElement('div');
  content.className = 'card__content';

  const title = document.createElement('h3');
  title.className = 'card__title';
  title.textContent = project.title;

  const meta = document.createElement('div');
  meta.className = 'card__meta';
  meta.setAttribute('aria-label', 'Projektinformationen');

  const tag = document.createElement('span');
  tag.className = 'card__tag';
  tag.textContent = project.category;

  const year = document.createElement('span');
  year.className = 'card__year';
  year.textContent = formatShortYear(project.year);

  meta.append(tag, year);
  content.append(title, meta);
  link.append(visual, content);
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

async function loadProjects() {
  try {
    const response = await fetch('/api/projects');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Projekte konnten nicht geladen werden.');
    }

    if (!data.projects.length) {
      showStatus('Zurzeit sind keine Projekte veröffentlicht.');
      return;
    }

    projectsContainer.replaceChildren(
      ...data.projects.map(createProjectCard)
    );
  } catch (error) {
    console.error('Error loading projects:', error);
    showStatus('Projekte konnten nicht geladen werden.', true);
  }
}

if (projectsContainer) {
  loadProjects();
}
