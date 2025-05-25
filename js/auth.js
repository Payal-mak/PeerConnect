const Auth = {
  login(username, department, year, collegeId) {
    const users = JSON.parse(localStorage.getItem('peerconnect-users') || '[]');
    let user = users.find(u => u.username === username && u.collegeId === collegeId);

    if (!user) {
      user = {
        id: `user${Date.now()}`,
        username,
        name: username,
        department,
        year,
        collegeId,
        skills: [],
        interests: [],
        bio: '',
        theme: localStorage.getItem('peerconnect-theme') || 'light'
      };
      users.push(user);
      localStorage.setItem('peerconnect-users', JSON.stringify(users));
    }

    localStorage.setItem('peerconnect-current-user', JSON.stringify(user));
    window.location.href = 'browse.html';
  },

  register(username, department, year, collegeId) {
    const users = JSON.parse(localStorage.getItem('peerconnect-users') || '[]');
    if (users.find(u => u.username === username || u.collegeId === collegeId)) {
      showToast('Error', 'User already exists with this username or college ID');
      return;
    }

    const newUser = {
      id: `user${Date.now()}`,
      username,
      name: username,
      department,
      year,
      collegeId,
      skills: [],
      interests: [],
      bio: '',
      theme: localStorage.getItem('peerconnect-theme') || 'light'
    };

    users.push(newUser);
    localStorage.setItem('peerconnect-users', JSON.stringify(users));
    localStorage.setItem('peerconnect-current-user', JSON.stringify(newUser));
    window.location.href = 'browse.html';
  },

  logout() {
    localStorage.removeItem('peerconnect-current-user');
    window.location.href = 'index.html';
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('peerconnect-current-user'));
  },

  updateTheme(userId, theme) {
    const users = JSON.parse(localStorage.getItem('peerconnect-users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].theme = theme;
      localStorage.setItem('peerconnect-users', JSON.stringify(users));
      const currentUser = JSON.parse(localStorage.getItem('peerconnect-current-user'));
      if (currentUser && currentUser.id === userId) {
        currentUser.theme = theme;
        localStorage.setItem('peerconnect-current-user', JSON.stringify(currentUser));
      }
    }
    localStorage.setItem('peerconnect-theme', theme);
  }
};

// Debug: Log the current pathname
console.log('Current pathname in auth.js:', window.location.pathname);

// Check if user is logged in
function checkAuth() {
    const currentUser = localStorage.getItem('peerconnect-current-user');
    if (!currentUser && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
    } else if (currentUser && window.location.href.includes('index.html')) {
        window.location.href = 'browse.html';
    }
}

// Run auth check on all pages
checkAuth();

// Handle logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('peerconnect-current-user');
        window.location.href = 'index.html';
    });
}

// Initialize login/register for index.html
// Modify the path check to be more flexible
if (window.location.pathname.includes('index.html') || 
    window.location.pathname === '/' || 
    window.location.pathname.endsWith('/') || 
    window.location.pathname.endsWith('/PeerConnect/')) {
  
  console.log('Running login/register setup for index.html');

  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const usernameInput = document.getElementById('username');
    const departmentInput = document.getElementById('department');
    const yearInput = document.getElementById('year');
    const collegeIdInput = document.getElementById('collegeId');
  
    // Debug: Check if buttons are found
    console.log('loginBtn:', loginBtn);
    console.log('registerBtn:', registerBtn);
  
    if (!loginBtn || !registerBtn || !usernameInput || !departmentInput || !yearInput || !collegeIdInput) {
      console.error('One or more DOM elements not found');
      return;
    }
  
    loginBtn.addEventListener('click', () => {
      try {
        const username = usernameInput.value.trim();
        const department = departmentInput.value.trim();
        const year = yearInput.value;
        const collegeId = collegeIdInput.value.trim();
  
        console.log('Login clicked:', { username, department, year, collegeId });
  
        if (!username || !department || !year || !collegeId) {
          showToast('Error', 'Please fill in all fields');
          return;
        }
  
        Auth.login(username, department, year, collegeId);
      } catch (error) {
        console.error('Error during login:', error);
        showToast('Error', 'An error occurred during login');
      }
    });
  
    registerBtn.addEventListener('click', () => {
      try {
        const username = usernameInput.value.trim();
        const department = departmentInput.value.trim();
        const year = yearInput.value;
        const collegeId = collegeIdInput.value.trim();
  
        console.log('Register clicked:', { username, department, year, collegeId });
  
        if (!username || !department || !year || !collegeId) {
          showToast('Error', 'Please fill in all fields');
          return;
        }
  
        Auth.register(username, department, year, collegeId);
      } catch (error) {
        console.error('Error during register:', error);
        showToast('Error', 'An error occurred during registration');
      }
    });
  });
} else {
  console.log('Not on index.html, skipping login/register setup');
}