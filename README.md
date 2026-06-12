# Personal Portfolio

A custom portfolio website for Fabio Lozza, a multimedia and graphic designer based in Graubünden, Switzerland. The site combines an editorial visual identity with a Notion-powered project archive, allowing portfolio content to be managed without changing the codebase.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Notion API](https://img.shields.io/badge/Notion-API-000000?logo=notion&logoColor=white)](https://developers.notion.com/)

## Academic Context

This project was created as part of the **Web Technologies** module in the **Bachelor of Arts in Design, Interaction Design** program at the Zurich University of the Arts (ZHdK).

### Module Content

The module explores contemporary web technologies in theory and practice, with an introduction to the fundamentals of HTML, CSS, and JavaScript.

### Learning Objectives

- Understand the fundamentals of web technologies in practice
- Discuss the history and theory of web technologies from different perspectives
- Examine websites in terms of their implementation
- Create simple applications using HTML, CSS, and JavaScript

## Overview

This project is a lightweight, responsive portfolio built with semantic HTML, CSS, vanilla JavaScript, and Express. Project data, media, metadata, and downloadable files are retrieved from a Notion data source through a small server-side API.

The frontend is written in German and includes:

- A distinctive editorial landing page and CV section
- Dynamically generated project cards
- Context and discipline-based project filters
- Individual project detail pages
- Responsive image galleries for sketches and mockups
- Secure server-side access to the Notion API
- Proxied project documentation and file downloads
- Accessible navigation, loading states, and semantic markup

## Tech Stack

| Area          | Technology                           |
| ------------- | ------------------------------------ |
| Frontend      | HTML5, CSS3, vanilla JavaScript      |
| Backend       | Node.js, Express                     |
| CMS           | Notion API                           |
| Configuration | dotenv                               |
| Deployment    | Vercel-compatible server entry point |
| Typography    | Adobe Fonts                          |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm
- A Notion integration with access to the projects data source

### Installation

```bash
git clone https://github.com/fbizz/portfolio.git
cd portfolio
npm install
```

Create a `.env` file in the project root:

```env
NOTION_TOKEN=your_notion_integration_token
NOTION_PROJECTS_DATA_SOURCE_ID=your_projects_data_source_id
PORT=3000
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command       | Description                             |
| ------------- | --------------------------------------- |
| `npm start`   | Starts the Express server               |
| `npm run dev` | Starts the server in Node.js watch mode |

## Notion Configuration

The integration must be connected to the Notion data source identified by `NOTION_PROJECTS_DATA_SOURCE_ID`. Only entries with `Published` enabled are returned by the API.

The application reads the following properties:

| Property          | Expected type        | Purpose                          |
| ----------------- | -------------------- | -------------------------------- |
| `Title`           | Title                | Project name                     |
| `Slug`            | Rich text            | Unique URL identifier            |
| `Published`       | Checkbox             | Controls public visibility       |
| `Nmb`             | Number               | Project order and display number |
| `Year`            | Number               | Project year                     |
| `Tag`             | Multi-select         | Available filter options         |
| `Filter-Tags`     | Multi-select or text | Project context and disciplines  |
| `Institution`     | Rollup               | Institution or project category  |
| `Role`            | Rollup               | Role held during the project     |
| `Location`        | Rollup               | Project location                 |
| `Start` / `End`   | Rollup               | Project dates                    |
| `Description`     | Rich text            | Project introduction             |
| `Responsibility`  | Rich text            | Responsibilities                 |
| `Target-Audience` | Rich text            | Intended audience                |
| `Challenges`      | Rich text            | Project challenges               |
| `Verdict`         | Rich text            | Outcome or conclusion            |
| `Preview-Img`     | Files                | Project preview images           |
| `Header-Img`      | Files                | Detail page hero image           |
| `Sketch-Img`      | Files                | Sketch gallery                   |
| `Mockup-Img`      | Files                | Mockup gallery                   |
| `Video`           | URL                  | Video shown instead of mockups    |
| `Documentation`   | Files                | Downloadable documentation       |
| `Files`           | Files                | Additional downloads             |
| `Links`           | URL or rich text     | Additional external links        |

Projects are sorted by `Nmb` in ascending order. The `Slug` value must be unique because it is used to retrieve individual projects.

## API Routes

| Route                                            | Description                                       |
| ------------------------------------------------ | ------------------------------------------------- |
| `GET /api/projects`                              | Returns all published projects and filter options |
| `GET /api/projects/:slug`                        | Returns one published project                     |
| `GET /api/projects/:slug/download/:group/:index` | Proxies a Notion-hosted project file              |

The Notion token remains on the server and is never exposed to the browser.

## Project Structure

```text
portfolio/
├── public/
│   ├── favicon_io/       # Favicons and web app manifest
│   ├── img/              # Portrait and visual assets
│   ├── index.html        # Portfolio landing page
│   ├── project.html      # Project detail shell
│   ├── styles.css        # Main site styles
│   ├── project.css       # Project detail styles
│   ├── script.js         # Project listing and filters
│   └── project.js        # Project detail rendering
├── server.js             # Express server and Notion API adapter
├── package.json
└── README.md
```

## Deployment

The server exports the Express application for serverless deployment and only opens a local port when `VERCEL` is not set. For a Vercel deployment:

1. Import the repository into Vercel.
2. Add `NOTION_TOKEN` and `NOTION_PROJECTS_DATA_SOURCE_ID` as environment variables.
3. Deploy the project.

Make sure the Notion integration has access only to the data sources required by the portfolio.

## Author

**Fabio Lozza**

- GitHub: [@fbizz](https://github.com/fbizz)
- LinkedIn: [Fabio Lozza](https://www.linkedin.com/in/fabiolozza/?locale=en)
- Instagram: [@fabio.lozza](https://www.instagram.com/fabio.lozza/)

---

Built as a custom portfolio and content platform.
