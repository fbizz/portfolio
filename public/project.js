const projectContainer = document.querySelector('#content');
const descriptionMeta = document.querySelector('meta[name="description"]');
const contextFilterValues = new Set([
  'apprenticeship',
  'freelance',
  'freelancing',
  'bm',
  'bachelor'
]);

function splitTitle(title) {
  const words = title.trim().split(/\s+/);
  return {
    first: words.shift() || '',
    rest: words.join(' ')
  };
}

function getDisciplineTag(project) {
  return project.filterTags?.find(
    (tag) => !contextFilterValues.has(tag.trim().toLowerCase())
  );
}

function imageAlt(file, fallback) {
  const name = file.name
    .replace(/\.[^.]+$/, '')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .trim();

  return name || fallback;
}

function createTextSection(title, text, options = {}) {
  if (!text) return null;

  const section = document.createElement('section');
  section.className = `project-notes${options.left ? ' project-notes--left' : ''}`;
  section.setAttribute('aria-label', title);

  const card = document.createElement('div');
  card.className = `project-notes__card${
    options.accent ? ' project-notes__card--accent' : ''
  }`;

  const heading = document.createElement('h2');
  heading.className = 'project-notes__title';
  heading.textContent = title;

  const paragraph = document.createElement('p');
  paragraph.textContent = text;

  card.append(heading, paragraph);
  section.append(card);
  return section;
}

function createPairedTextSection(items) {
  const visibleItems = items.filter((item) => item.text);
  if (!visibleItems.length) return null;

  const section = document.createElement('section');
  section.className = 'project-notes';
  section.setAttribute(
    'aria-label',
    visibleItems.map((item) => item.title).join(' und ')
  );

  visibleItems.forEach((item) => {
    const card = document.createElement('div');
    card.className = `project-notes__card${
      item.accent ? ' project-notes__card--accent' : ''
    }`;

    const heading = document.createElement('h2');
    heading.className = 'project-notes__title';
    heading.textContent = item.title;

    const paragraph = document.createElement('p');
    paragraph.textContent = item.text;

    card.append(heading, paragraph);
    section.append(card);
  });

  return section;
}

function createGallery(files, variant, label) {
  if (!files.length) return null;

  const section = document.createElement('section');
  section.className = `project-gallery project-gallery--${variant}`;
  section.setAttribute('aria-label', label);

  files.forEach((file, index) => {
    const shot = document.createElement('article');
    shot.className = 'project-shot';

    if (variant === 'sketches' && files.length % 2 === 1 && index === files.length - 1) {
      shot.classList.add('project-shot--span');
    }

    const image = document.createElement('img');
    image.src = file.url;
    image.alt = imageAlt(file, `${label} ${index + 1}`);
    image.loading = 'lazy';
    image.decoding = 'async';
    image.fetchPriority = 'low';

    shot.append(image);
    section.append(shot);
  });

  return section;
}

function getVideoThumbnail(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, '');
    let videoId = '';

    if (hostname === 'youtu.be') {
      videoId = parsedUrl.pathname.split('/').filter(Boolean)[0] || '';
    } else if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtube-nocookie.com'
    ) {
      videoId =
        parsedUrl.searchParams.get('v') ||
        parsedUrl.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ||
        '';
    }

    if (videoId) {
      return `https://i.ytimg.com/vi/${encodeURIComponent(
        videoId
      )}/hqdefault.jpg`;
    }

    if (hostname === 'vimeo.com' || hostname.endsWith('.vimeo.com')) {
      const vimeoId = parsedUrl.pathname.match(/\/(\d+)(?:$|\/)/)?.[1];
      if (vimeoId) {
        return `https://vumbnail.com/${encodeURIComponent(vimeoId)}.jpg`;
      }
    }
  } catch (error) {
    console.warn('Invalid video URL:', url, error);
  }

  return '';
}

function createVideoGallery(videoUrls, fallbackImages, projectTitle) {
  if (!videoUrls.length) return createGallery(fallbackImages, 'stacked', 'Mockups');

  const section = document.createElement('section');
  section.className = 'project-gallery project-gallery--stacked project-videos';
  section.setAttribute('aria-label', 'Videos');

  videoUrls.forEach((url, index) => {
    const thumbnail = getVideoThumbnail(url);
    const link = document.createElement('a');
    link.className = 'project-shot project-video';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute(
      'aria-label',
      `${projectTitle} Video ${index + 1} in neuem Tab öffnen`
    );

    if (thumbnail) {
      const image = document.createElement('img');
      image.src = thumbnail;
      image.alt = `${projectTitle} Video ${index + 1}`;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.fetchPriority = 'low';
      link.append(image);
    } else {
      link.classList.add('project-video--without-thumbnail');
    }

    const play = document.createElement('span');
    play.className = 'project-video__play';
    play.setAttribute('aria-hidden', 'true');
    play.textContent = 'PLAY';

    link.append(play);
    section.append(link);
  });

  return section;
}

function linkLabel(url, index) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return `Link ${index + 1}`;
  }
}

function createDownloads(project) {
  const groups = [
    {
      key: 'documentation',
      label: 'DOKUMENTATION',
      files: project.documentationFiles || []
    },
    {
      key: 'files',
      label: 'DATEIEN',
      files: project.additionalFiles || []
    },
    {
      key: 'links',
      label: 'LINKS',
      files: (project.links || []).map((url, index) => ({
        name: linkLabel(url, index),
        url
      })),
      external: true
    }
  ].filter((group) => group.files.length);

  if (!groups.length) return null;

  const section = document.createElement('section');
  section.className = 'project-downloads';
  section.setAttribute('aria-labelledby', 'project-downloads-title');

  const intro = document.createElement('div');
  intro.className = 'project-downloads__intro';

  const title = document.createElement('h2');
  title.id = 'project-downloads-title';
  title.className = 'project-downloads__title';
  title.textContent = 'WEITERE INFORMATIONEN';

  const description = document.createElement('p');
  description.className = 'project-downloads__description';
  description.textContent =
    'Zusätzliche Dokumente, Dateien und Links zu diesem Projekt.';

  intro.append(title, description);

  const groupList = document.createElement('div');
  groupList.className = 'project-downloads__groups';

  groups.forEach(({ key, label, files, external = false }) => {
    const group = document.createElement('div');
    group.className = 'project-downloads__group';

    const heading = document.createElement('h3');
    heading.className = 'project-downloads__group-title';
    heading.textContent = label;

    const fileList = document.createElement('ul');
    fileList.className = 'project-downloads__list';

    files.forEach((file, index) => {
      const item = document.createElement('li');
      item.className = 'project-downloads__item';

      const link = document.createElement('a');
      link.className = 'project-downloads__link';
      link.href = external
        ? file.url
        : `/api/projects/${encodeURIComponent(
            project.slug
          )}/download/${key}/${index}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${file.name} öffnen`);

      const name = document.createElement('span');
      name.className = 'project-downloads__file-name';
      name.textContent = file.name;

      link.append(name);
      item.append(link);
      fileList.append(item);
    });

    group.append(heading, fileList);
    groupList.append(group);
  });

  section.append(intro, groupList);
  return section;
}

function createMeta(project) {
  const values = [
    ['Rolle', project.role],
    ['Institution', project.institution],
    ['Ort', project.location]
  ].filter(([, value]) => value);

  if (!values.length) return null;

  const section = document.createElement('section');
  section.className = 'project-meta';
  section.setAttribute('aria-label', 'Projektinformationen');

  values.forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'project-meta__item';

    const labelElement = document.createElement('span');
    labelElement.className = 'project-meta__label';
    labelElement.textContent = label;

    const valueElement = document.createElement('span');
    valueElement.className = 'project-meta__value';
    valueElement.textContent = value;

    item.append(labelElement, valueElement);
    section.append(item);
  });

  return section;
}

function createHero(project) {
  const { first, rest } = splitTitle(project.title);
  const disciplineTag = getDisciplineTag(project);
  const section = document.createElement('section');
  section.className = 'project-hero';
  section.setAttribute('aria-label', 'Projektübersicht');

  const headerImage = project.headerImages[0];
  if (headerImage) {
    const image = document.createElement('img');
    image.className = 'project-hero__visual';
    image.src = headerImage.url;
    image.alt = imageAlt(headerImage, `${project.title} Titelbild`);
    image.loading = 'eager';
    image.decoding = 'async';
    image.fetchPriority = 'high';
    section.append(image);
  } else {
    section.classList.add('project-hero--without-image');
  }

  const titleBlock = document.createElement('div');
  titleBlock.className = 'project-hero__title-block';

  const tag = document.createElement('div');
  tag.className = 'project-hero__tag';
  tag.textContent = disciplineTag || '';

  const title = document.createElement('h1');
  title.className = 'project-hero__title';
  title.append(document.createTextNode(first));

  if (rest) {
    const displayTitle = document.createElement('span');
    displayTitle.className = 'type-display';
    displayTitle.textContent = rest;
    title.append(displayTitle);
  }

  const year = document.createElement('div');
  year.className = 'project-subtitle';
  year.textContent = project.year || '';

  const lead = document.createElement('p');
  lead.className = 'project-hero__lead';
  lead.textContent = project.description;

  if (disciplineTag) titleBlock.append(tag);
  titleBlock.append(title);
  if (project.year) titleBlock.append(year);
  section.append(titleBlock);
  if (project.description) section.append(lead);

  return section;
}

function renderProject(project) {
  const sections = [
    createHero(project),
    createMeta(project),
    createTextSection('VERANTWORTLICHKEITEN', project.responsibility, { left: true }),
    createPairedTextSection([
      { title: 'ZIELGRUPPE', text: project.targetAudience },
      { title: 'SCHWIERIGKEIT', text: project.challenges, accent: true }
    ]),
    createGallery(project.sketchImages, 'sketches', 'Skizzen'),
    createTextSection('DAS ERGEBNIS', project.verdict, { left: true }),
    createVideoGallery(
      project.videoUrls || [],
      project.mockupImages || [],
      project.title
    ),
    createDownloads(project)
  ].filter(Boolean);

  projectContainer.replaceChildren(...sections);
  document.title = `${project.title} — Fabio Lozza`;

  if (project.description) {
    descriptionMeta.content = project.description.slice(0, 160);
  }
}

function showError(message) {
  const state = document.createElement('section');
  state.className = 'project-state project-state--error';

  const heading = document.createElement('h1');
  heading.textContent = message;

  const link = document.createElement('a');
  link.href = './index.html#content';
  link.textContent = 'Zurück zu den Projekten';

  state.append(heading, link);
  projectContainer.replaceChildren(state);
}

async function loadProject() {
  const slug = new URLSearchParams(window.location.search).get('slug');

  if (!slug) {
    showError('Kein Projekt ausgewählt.');
    return;
  }

  try {
    const response = await fetch(`/api/projects/${encodeURIComponent(slug)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Projekt konnte nicht geladen werden.');
    }

    renderProject(data.project);
  } catch (error) {
    console.error('Error loading project:', error);
    showError(
      error.message === 'Project not found'
        ? 'Projekt nicht gefunden.'
        : 'Projekt konnte nicht geladen werden.'
    );
  }
}

loadProject();
