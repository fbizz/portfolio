import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_PROJECTS_DATA_SOURCE_ID =
  process.env.NOTION_PROJECTS_DATA_SOURCE_ID;
const NOTION_API_VERSION = '2025-09-03';

app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

function getPlainText(items = []) {
  return items.map((item) => item.plain_text ?? '').join('').trim();
}

function getTextProperty(property) {
  if (!property) return '';

  if (property.type === 'title') {
    return getPlainText(property.title);
  }

  if (property.type === 'rich_text') {
    return getPlainText(property.rich_text);
  }

  return '';
}

function getRollupValues(property) {
  if (property?.type !== 'rollup') return [];

  const { rollup } = property;
  if (rollup.type === 'array') return rollup.array;
  return [rollup];
}

function getRollupText(property) {
  return getRollupValues(property)
    .map((item) => {
      if (item.type === 'rich_text') return getPlainText(item.rich_text);
      if (item.type === 'title') return getPlainText(item.title);
      if (item.type === 'number') return item.number?.toString() ?? '';
      if (item.type === 'date') return item.date?.start ?? '';
      if (item.type === 'place') {
        return item.place?.name ?? item.place?.address ?? '';
      }
      return '';
    })
    .filter(Boolean)
    .join(', ');
}

function getFiles(property) {
  if (property?.type !== 'files') return [];

  return property.files
    .map((file) => ({
      name: file.name,
      url: file.type === 'file' ? file.file.url : file.external.url
    }))
    .filter((file) => file.url);
}

function getPropertyValues(property) {
  if (!property) return [];

  if (property.type === 'multi_select') {
    return property.multi_select.map((option) => option.name);
  }

  if (property.type === 'select') {
    return property.select?.name ? [property.select.name] : [];
  }

  if (property.type === 'rich_text' || property.type === 'title') {
    const value = getTextProperty(property);
    return value ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
  }

  if (property.type === 'rollup') {
    return getRollupValues(property)
      .flatMap((item) => {
        if (item.type === 'multi_select') {
          return item.multi_select.map((option) => option.name);
        }
        if (item.type === 'select') return item.select?.name || [];
        if (item.type === 'rich_text') return getPlainText(item.rich_text);
        if (item.type === 'title') return getPlainText(item.title);
        return [];
      })
      .flatMap((value) => String(value).split(','))
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [];
}

function getFilterTags(properties) {
  const propertyNames = [
    'Filter-Tags',
    'Filter Tags',
    'Filter-Tags ',
    'Tags',
    'Tag',
    'Context',
    'Discipline'
  ];

  return [
    ...new Set(
      propertyNames.flatMap((name) => getPropertyValues(properties[name]))
    )
  ];
}

function normalizeCategory(institution) {
  const category = institution.trim();
  if (!category) return 'Projekt';
  if (['self employed', 'selbstständig'].includes(category.toLowerCase())) {
    return 'Freelancing';
  }
  return category;
}

function inferContextTags(institution, role) {
  const context = `${institution} ${role}`.toLowerCase();
  const tags = [];

  if (
    context.includes('self employed') ||
    context.includes('selbstständig') ||
    context.includes('selbständig') ||
    context.includes('freelance') ||
    context.includes('freiberuf')
  ) {
    tags.push('Freelance');
  }
  if (context.includes('bachelor')) tags.push('Bachelor');
  if (
    context.includes('apprenticeship') ||
    context.includes('apprentice') ||
    context.includes('ausbildung') ||
    context.includes('auszubild') ||
    context.includes('lehre') ||
    context.includes('lernend') ||
    context.includes('lehrling')
  ) {
    tags.push('Apprenticeship');
  }
  if (
    context.includes('berufsmatur') ||
    context.includes('bm ') ||
    context.endsWith(' bm')
  ) {
    tags.push('BM');
  }

  return tags;
}

function normalizeProject(page) {
  const properties = page.properties;
  const institution = getRollupText(properties.Institution);
  const role = getRollupText(properties.Role);
  const filterTags = [
    ...new Set([
      ...getFilterTags(properties),
      ...inferContextTags(institution, role)
    ])
  ];

  return {
    id: page.id,
    title: getTextProperty(properties.Title),
    slug: getTextProperty(properties.Slug),
    number: properties.Nmb?.number ?? null,
    year: properties.Year?.number ?? null,
    category: normalizeCategory(institution),
    filterTags,
    role,
    institution,
    location: getRollupText(properties.Location),
    start: getRollupText(properties.Start),
    end: getRollupText(properties.End),
    description: getTextProperty(properties.Description),
    responsibility: getTextProperty(properties.Responsibility),
    targetAudience: getTextProperty(properties['Target-Audience']),
    challenges: getTextProperty(properties.Challenges),
    verdict: getTextProperty(properties.Verdict),
    previewImages: getFiles(
      properties['Preview-Img'] || properties['Preview Img']
    ),
    headerImages: getFiles(properties['Header-Img']),
    sketchImages: getFiles(properties['Sketch-Img']),
    mockupImages: getFiles(properties['Mockup-Img'])
  };
}

async function queryProjects(body) {
  if (!NOTION_TOKEN || !NOTION_PROJECTS_DATA_SOURCE_ID) {
    const error = new Error(
      'Missing NOTION_TOKEN or NOTION_PROJECTS_DATA_SOURCE_ID'
    );
    error.status = 500;
    throw error;
  }

  const response = await fetch(
    `https://api.notion.com/v1/data_sources/${NOTION_PROJECTS_DATA_SOURCE_ID}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || `Notion API error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

app.get('/api/projects', async (req, res, next) => {
  try {
    const data = await queryProjects({
      filter: {
        property: 'Published',
        checkbox: {
          equals: true
        }
      },
      sorts: [
        {
          property: 'Nmb',
          direction: 'ascending'
        }
      ],
      page_size: 100
    });

    const projects = data.results
      .map(normalizeProject)
      .filter((project) => project.title && project.slug);

    res.set('Cache-Control', 'no-store');
    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

app.get('/api/projects/:slug', async (req, res, next) => {
  try {
    const data = await queryProjects({
      filter: {
        and: [
          {
            property: 'Published',
            checkbox: {
              equals: true
            }
          },
          {
            property: 'Slug',
            rich_text: {
              equals: req.params.slug
            }
          }
        ]
      },
      page_size: 1
    });

    const page = data.results[0];
    if (!page) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.set('Cache-Control', 'no-store');
    res.json({ project: normalizeProject(page) });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error('API error:', error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500).json({
    error: error.message || 'Could not load projects'
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
