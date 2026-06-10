console.log("Fetching projects from Notion...");

async function fetchProjects() {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Projects:', data);
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
}

fetchProjects();