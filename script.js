console.log("Fetching projects from Notion...");

async function fetchProjects() {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Filter only published projects
    const publishedProjects = data.results.filter(project => {
      return project.properties.Published?.checkbox === true;
    });
    
    console.log('Published Projects:', publishedProjects);
    return publishedProjects;
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
}

fetchProjects();