// Initialize Connections Page
function initConnectionsPage() {
  const currentUser = Auth.getCurrentUser();
  
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // Load connections from localStorage
  let connections = safeParseJSON('peerconnect-connections', {});
  if (!connections[currentUser.id]) {
    connections[currentUser.id] = [];
  }

  // DOM Elements
  const connectionsList = document.getElementById('connections-list');
  const emptyConnections = document.getElementById('empty-connections');
  const themeToggle = document.getElementById('theme-toggle');
  const logoutBtn = document.getElementById('logout-btn');

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

  // Render connections
  function renderConnections() {
    connectionsList.innerHTML = '';
    
    const userConnections = connections[currentUser.id] || [];
    
    if (userConnections.length === 0) {
      emptyConnections.classList.remove('hidden');
      emptyConnections.innerHTML = `
        <div class="text-center py-12">
          <i data-feather="users" class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"></i>
          <p class="text-lg font-medium text-gray-600 dark:text-gray-300">No connections yet</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Start connecting with peers on the Browse page!</p>
          <a href="browse.html" class="mt-4 inline-block px-6 py-2 gradient-bg text-white rounded-lg font-medium hover:scale-105 transition-transform">Find Peers</a>
        </div>
      `;
      feather.replace();
      return;
    }
    
    emptyConnections.classList.add('hidden');
    
    // Get all users
    const allUsers = getAllUsers();
    
    userConnections.forEach(connectionId => {
      const user = allUsers.find(u => u.id === connectionId);
      if (user) {
        const connectionCard = createConnectionCard(user);
        connectionsList.appendChild(connectionCard);
      }
    });
  }

  // Create a connection card element
  function createConnectionCard(user) {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300';
    
    const skillsHTML = user.skills?.map(skill => 
      `<span class="inline-block bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs px-3 py-1 rounded-full mr-2 mb-2 font-medium">${skill}</span>`
    ).join('') || '';
    
    const interestsHTML = user.interests?.map(interest => 
      `<span class="inline-block bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs px-3 py-1 rounded-full mr-2 mb-2 font-medium">${interest}</span>`
    ).join('') || '';
    
    card.innerHTML = `
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-2 border-teal-500 dark:border-teal-400">
            <span class="text-xl font-bold text-gray-700 dark:text-gray-200">${user.name.charAt(0)}</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-heading font-bold text-gray-900 dark:text-white">${user.name}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${user.department} • ${user.year}</p>
              <p class="text-sm text-gray-600 dark:text-gray-300">College ID: ${user.collegeId}</p>
            </div>
            <button class="remove-connection-btn focus-outline p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors duration-200" data-user-id="${user.id}" aria-label="Remove connection with ${user.name}">
              <i data-feather="user-minus" class="w-5 h-5 text-red-500 dark:text-red-400"></i>
            </button>
          </div>
          ${user.bio ? `<p class="mt-3 text-gray-700 dark:text-gray-200 text-base">${user.bio}</p>` : ''}
          <div class="mt-4">
            ${skillsHTML ? `<p class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Skills:</p><div class="flex flex-wrap gap-1">${skillsHTML}</div>` : ''}
            ${interestsHTML ? `<p class="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-3 mb-2">Interests:</p><div class="flex flex-wrap gap-1">${interestsHTML}</div>` : ''}
          </div>
        </div>
      </div>
    `;
    
    // Add event listener to remove connection button
    const removeBtn = card.querySelector('.remove-connection-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => removeConnection(user.id));
    }
    
    return card;
  }

  // Remove a connection
  function removeConnection(userId) {
    let connections = safeParseJSON('peerconnect-connections', {});
    
    if (connections[currentUser.id]) {
      connections[currentUser.id] = connections[currentUser.id].filter(id => id !== userId);
      localStorage.setItem('peerconnect-connections', JSON.stringify(connections));
      
      // Show toast notification
      showToast('Connection Removed', `You're no longer connected with this student`);
      
      // Re-render connections
      renderConnections();
    }
  }

  // Initialize page
  renderConnections();
  feather.replace();
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initConnectionsPage);