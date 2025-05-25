function initProjectsPage() {
  const currentUser = Auth.getCurrentUser();
  
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // DOM Elements
  const projectsList = document.getElementById('projects-list');
  const emptyProjects = document.getElementById('empty-projects');
  const newProjectBtn = document.getElementById('new-project-btn');
  const newProjectModal = document.getElementById('new-project-modal');
  const closeProjectModal = document.getElementById('close-project-modal');
  const projectTitle = document.getElementById('project-title');
  const projectDescription = document.getElementById('project-description');
  const projectCollaborators = document.getElementById('project-collaborators');
  const createProjectBtn = document.getElementById('create-project-btn');
  const themeToggle = document.getElementById('theme-toggle');
  const logoutBtn = document.getElementById('logout-btn');

  // Load projects from localStorage
  let projects = safeParseJSON('peerconnect-projects', []);

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      Auth.updateTheme(currentUser.id, newTheme);
      document.body.setAttribute('data-theme', newTheme);
      updateThemeIcon();
    });
  }

  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      Auth.logout();
    });
  }

  // Update theme icon
  function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    icon.setAttribute('data-feather', document.body.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon');
    feather.replace();
  }

  // Set initial theme
  if (currentUser.theme) {
    document.body.setAttribute('data-theme', currentUser.theme);
    updateThemeIcon();
  }

  // Populate collaborators
  function populateCollaborators() {
    projectCollaborators.innerHTML = '<option value="">Select collaborators</option>';
    const connections = safeParseJSON('peerconnect-connections', {})[currentUser.id] || [];
    const allUsers = getAllUsers();
    
    connections.forEach(connectionId => {
      const user = allUsers.find(u => u.id === connectionId);
      if (user) {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        projectCollaborators.appendChild(option);
      }
    });
  }

  // Render projects
  function renderProjects() {
    projectsList.innerHTML = '';
    
    const userProjects = projects.filter(project => 
      project.ownerId === currentUser.id || project.collaborators.includes(currentUser.id)
    );
    
    if (userProjects.length === 0) {
      emptyProjects.classList.remove('hidden');
      emptyProjects.innerHTML = `
        <div class="text-center py-12">
          <i data-feather="folder" class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"></i>
          <p class="text-lg font-medium text-gray-600 dark:text-gray-300">No projects yet</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Create a new project to start collaborating!</p>
          <button id="start-new-project" class="mt-4 inline-block px-6 py-2 gradient-bg text-white rounded-lg font-medium hover:scale-105 transition-transform">New Project</button>
        </div>
      `;
      feather.replace();
      document.getElementById('start-new-project').addEventListener('click', () => {
        newProjectModal.classList.remove('hidden');
        populateCollaborators();
      });
      return;
    }
    
    emptyProjects.classList.add('hidden');
    
    userProjects.forEach(project => {
      const projectCard = createProjectCard(project);
      projectsList.appendChild(projectCard);
    });
  }

  // Create project card
  function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300';
    
    const allUsers = getAllUsers();
    const collaboratorNames = project.collaborators.map(id => {
      const user = allUsers.find(u => u.id === id);
      return user ? user.name : 'Unknown';
    }).join(', ');
    
    card.innerHTML = `
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">${project.title}</h3>
      <p class="text-gray-700 dark:text-gray-200 text-base mb-4">${project.description}</p>
      <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Collaborators:</strong> ${collaboratorNames || 'None'}</p>
    `;
    
    return card;
  }

  // New project modal
  newProjectBtn.addEventListener('click', () => {
    newProjectModal.classList.remove('hidden');
    populateCollaborators();
  });

  closeProjectModal.addEventListener('click', () => {
    newProjectModal.classList.add('hidden');
  });

  // Create project
  createProjectBtn.addEventListener('click', () => {
    const title = projectTitle.value.trim();
    const description = projectDescription.value.trim();
    const collaborators = Array.from(projectCollaborators.selectedOptions).map(opt => opt.value).filter(id => id);
    
    if (!title || !description) {
      showToast('Error', 'Please fill in all required fields');
      return;
    }
    
    const newProject = {
      id: `proj${Date.now()}`,
      ownerId: currentUser.id,
      title,
      description,
      collaborators,
      createdAt: new Date().toISOString()
    };
    
    projects.push(newProject);
    localStorage.setItem('peerconnect-projects', JSON.stringify(projects));
    
    showToast('Success', 'Project created successfully');
    newProjectModal.classList.add('hidden');
    projectTitle.value = '';
    projectDescription.value = '';
    projectCollaborators.selectedIndex = -1;
    renderProjects();
  });

  // Initial render
  renderProjects();
}

document.addEventListener('DOMContentLoaded', initProjectsPage);