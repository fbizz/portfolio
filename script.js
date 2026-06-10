require('dotenv').config();

const token = process.env.NOTION_TOKEN;
const dataSourceId = process.env.NOTION_PROJECTS_DATA_SOURCE_ID;

async function fetchProjects() {
  const response = await fetch(
    `https://api.notion.com/v1/databases/${dataSourceId}/query`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
    }
  );
  const data = await response.json();
  return data;
}

fetchProjects().then((projects) => {
  console.log(projects);
});