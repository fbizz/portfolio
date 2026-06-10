const projectsContainer = document.querySelector('#content.cards');

function splitTitle(title) {
  const words = title.trim().split(/\s+/);

  if (words.length === 1) {
    return [words[0], ''];
  }

  return [words[0], words.slice(1).join(' ')];
}

function formatProjectNumber(number) {
  if (number === null || number === undefined) return '--';
  return String(number).padStart(2, '0');
}

function formatShortYear(year) {
  if (!year) return '--';
  return String(year).slice(-2);
}

function createProjectCard(project) {
  const [titleTop, titleBottom] = splitTitle(project.title);
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
  visual.className = 'card__visual card__visual--feature';
  visual.setAttribute('aria-hidden', 'true');

  const cover = project.mockupImages?.[0] || project.headerImages?.[0];
  if (cover) {
    const image = document.createElement('img');
    image.className = 'card__image';
    image.src = cover.url;
    image.alt = '';
    image.loading = 'lazy';
    visual.append(image);
  }

  const overlay = document.createElement('div');
  overlay.className = 'card__image-overlay';
  visual.append(overlay);

  const ghost = document.createElement('div');
  ghost.className = 'card__ghost';
  ghost.setAttribute('aria-hidden', 'true');

  const top = document.createElement('div');
  top.className = 'card__ghost-top';
  top.textContent = titleTop;

  const bottom = document.createElement('div');
  bottom.className = 'card__ghost-bottom';
  bottom.textContent = titleBottom;

  ghost.append(top, bottom);

  const meta = document.createElement('div');
  meta.className = 'card__meta';
  meta.setAttribute('aria-label', 'Projektinformationen');

  const number = document.createElement('span');
  number.className = 'card__no';
  number.textContent = formatProjectNumber(project.number);

  const tag = document.createElement('span');
  tag.className = 'card__tag';
  tag.textContent = `${project.category}  *  ${formatShortYear(project.year)}`;

  meta.append(number, tag);
  link.append(visual, ghost, meta);
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
