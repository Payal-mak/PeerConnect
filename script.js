// DOM Elements and Event Listeners on all pages
document.addEventListener('DOMContentLoaded', function() {
    // Apply saved theme preference
    applyTheme();
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            toggleDarkMode();
        });
    }
    
    // Check if user is logged in on protected pages
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'index.html' && !isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Logout button functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
    
    // Page-specific initializations
    if (currentPage === 'index.html' || !currentPage) {
        initLoginPage();
    } else if (currentPage === 'browse.html') {
        initBrowsePage();
    } else if (currentPage === 'messages.html') {
        initMessagesPage();
    } else if (currentPage === 'profile.html') {
        initProfilePage();
    } else if (currentPage === 'projects.html') {
        initProjectsPage();
    }
});

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user data
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Initialize Login/Signup Page
function initLoginPage() {
    // If already logged in, redirect to browse page
    if (isLoggedIn()) {
        window.location.href = 'browse.html';
        return;
    }
    
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Show login/signup tabs
    window.showTab = function(tabName) {
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => tab.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
    };
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'browse.html';
            } else {
                alert('Invalid username or password');
            }
        });
    }
    
    // Signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('signup-username').value;
            const department = document.getElementById('signup-department').value;
            const universityId = document.getElementById('signup-university-id').value;
            const password = document.getElementById('signup-password').value;
            
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if username already exists
            if (users.some(u => u.username === username)) {
                alert('Username already taken');
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now().toString(),
                username,
                department,
                universityId,
                password
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            window.location.href = 'browse.html';
        });
    }
}

// Initialize Browse Page
function initBrowsePage() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    // Load all users initially
    loadUsers();
    
    // Search functionality
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            loadUsers(searchInput.value);
        });
        
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                loadUsers(searchInput.value);
            }
        });
    }
}

// Load users for browse page
function loadUsers(searchTerm = '') {
    const usersContainer = document.getElementById('users-container');
    if (!usersContainer) return;
    
    // Get all users and current user
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = getCurrentUser();
    
    // Filter users based on search term and exclude current user
    let filteredUsers = users.filter(user => user.id !== currentUser.id);
    
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
            user.username.toLowerCase().includes(term) || 
            user.department.toLowerCase().includes(term)
        );
    }
    
    // Clear the container
    usersContainer.innerHTML = '';
    
    // Create user cards
    if (filteredUsers.length === 0) {
        usersContainer.innerHTML = '<p>No users found</p>';
        return;
    }
    
    filteredUsers.forEach(user => {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card');
        userCard.innerHTML = `
            <h3>${user.username}</h3>
            <div class="user-info">
                <p><strong>Department:</strong> ${user.department}</p>
            </div>
        `;
        usersContainer.appendChild(userCard);
    });
}

// Initialize Messages Page
function initMessagesPage() {
    // Load all messages
    loadMessages();
    
    // Post message form
    const postMessageForm = document.getElementById('post-message-form');
    if (postMessageForm) {
        postMessageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const content = document.getElementById('message-content').value;
            if (!content.trim()) return;
            
            const currentUser = getCurrentUser();
            
            // Create new message
            const newMessage = {
                id: Date.now().toString(),
                content,
                authorId: currentUser.id,
                authorName: currentUser.username,
                timestamp: new Date().toISOString()
            };
            
            // Save message to localStorage
            const messages = JSON.parse(localStorage.getItem('messages') || '[]');
            messages.push(newMessage);
            localStorage.setItem('messages', JSON.stringify(messages));
            
            // Reset form and reload messages
            document.getElementById('message-content').value = '';
            loadMessages();
        });
    }
}

// Load messages for message page
function loadMessages() {
    const messagesContainer = document.getElementById('messages-list');
    if (!messagesContainer) return;
    
    // Get all messages
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    // Clear the container
    messagesContainer.innerHTML = '';
    
    // Check if there are no messages
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<p>No messages yet. Be the first to post!</p>';
        return;
    }
    
    // Sort messages by timestamp (newest first)
    messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Create message cards
    messages.forEach(message => {
        const messageCard = document.createElement('div');
        messageCard.classList.add('message-card');
        
        const date = new Date(message.timestamp);
        const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
        
        messageCard.innerHTML = `
            <div class="message-header">
                <span class="message-author">${message.authorName}</span>
                <span class="message-time">${formattedDate}</span>
            </div>
            <div class="message-content">${message.content}</div>
        `;
        
        messagesContainer.appendChild(messageCard);
    });
}

// Initialize Profile Page
function initProfilePage() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Display user information
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-department').textContent = currentUser.department;
    document.getElementById('profile-university-id').textContent = currentUser.universityId;
    
    // Edit profile button
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileForm = document.getElementById('edit-profile-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    if (editProfileBtn && editProfileForm && cancelEditBtn) {
        // Pre-fill form fields
        document.getElementById('update-department').value = currentUser.department;
        
        // Show/hide edit form
        editProfileBtn.addEventListener('click', function() {
            editProfileForm.classList.remove('hidden');
            editProfileBtn.classList.add('hidden');
        });
        
        cancelEditBtn.addEventListener('click', function() {
            editProfileForm.classList.add('hidden');
            editProfileBtn.classList.remove('hidden');
        });
        
        // Update profile form submission
        const updateProfileForm = document.getElementById('update-profile-form');
        if (updateProfileForm) {
            updateProfileForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const department = document.getElementById('update-department').value;
                const password = document.getElementById('update-password').value;
                
                // Update user data
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                
                if (userIndex !== -1) {
                    users[userIndex].department = department;
                    
                    if (password) {
                        users[userIndex].password = password;
                    }
                    
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
                    
                    // Update display
                    document.getElementById('profile-department').textContent = department;
                    
                    // Hide form
                    editProfileForm.classList.add('hidden');
                    editProfileBtn.classList.remove('hidden');
                    
                    alert('Profile updated successfully');
                }
            });
        }
    }
}

// Initialize Projects Page
function initProjectsPage() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Form control buttons
    const addProjectBtn = document.getElementById('add-project-btn');
    const addProjectForm = document.getElementById('add-project-form');
    const cancelProjectBtn = document.getElementById('cancel-project-btn');
    
    if (addProjectBtn && addProjectForm && cancelProjectBtn) {
        // Show/hide project form
        addProjectBtn.addEventListener('click', function() {
            addProjectForm.classList.remove('hidden');
        });
        
        cancelProjectBtn.addEventListener('click', function() {
            addProjectForm.classList.add('hidden');
            document.getElementById('project-form').reset();
        });
    }
    
    // Project form submission
    const projectForm = document.getElementById('project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('project-title').value;
            const github = document.getElementById('project-github').value;
            const description = document.getElementById('project-description').value;
            const techInput = document.getElementById('project-tech').value;
            
            // Parse tech stack into array
            const techStack = techInput.split(',')
                .map(tech => tech.trim())
                .filter(tech => tech.length > 0);
            
            // Create new project
            const newProject = {
                id: Date.now().toString(),
                title,
                github,
                description,
                techStack,
                userId: currentUser.id,
                username: currentUser.username,
                createdAt: new Date().toISOString()
            };
            
            // Save project to localStorage
            const projects = JSON.parse(localStorage.getItem('projects') || '[]');
            projects.push(newProject);
            localStorage.setItem('projects', JSON.stringify(projects));
            
            // Reset form and hide it
            projectForm.reset();
            addProjectForm.classList.add('hidden');
            
            // Reload projects
            loadProjects();
        });
    }
    
    // Load projects initially
    loadProjects();
}

// Load projects for projects page
function loadProjects() {
    const projectsList = document.getElementById('projects-list');
    const noProjectsMessage = document.getElementById('no-projects-message');
    
    if (!projectsList) return;
    
    // Get all projects
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const currentUser = getCurrentUser();
    
    // Clear the container except for the no projects message
    const children = Array.from(projectsList.children);
    children.forEach(child => {
        if (child.id !== 'no-projects-message') {
            projectsList.removeChild(child);
        }
    });
    
    // Check if there are any projects
    if (projects.length === 0) {
        noProjectsMessage.style.display = 'block';
        return;
    } else {
        noProjectsMessage.style.display = 'none';
    }
    
    // Sort projects by creation date (newest first)
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Create project cards
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.classList.add('project-card');
        
        // Create tech stack HTML
        const techStackHTML = project.techStack.map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('');
        
        // Check if this is the user's own project
        const isOwnProject = project.userId === currentUser.id;
        
        // Create delete button only for own projects
        const deleteButton = isOwnProject ? 
            `<button class="btn btn-secondary delete-project" data-id="${project.id}">Delete</button>` : '';
        
        projectCard.innerHTML = `
            <div class="project-header">
                <div>
                    <div class="project-title">${project.title}</div>
                    <small>Posted by: ${project.username}</small>
                </div>
                <div class="project-actions">
                    <a href="${project.github}" target="_blank" class="project-link">GitHub</a>
                    ${deleteButton}
                </div>
            </div>
            <div class="project-description">${project.description}</div>
            <div class="project-tech-stack">
                ${techStackHTML}
            </div>
        `;
        
        projectsList.appendChild(projectCard);
    });
    
    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-project');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.getAttribute('data-id');
            deleteProject(projectId);
        });
    });
}

// Delete a project
function deleteProject(projectId) {
    // Get all projects
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const currentUser = getCurrentUser();
    
    // Find the project index
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    // Check if project exists and belongs to current user
    if (projectIndex !== -1 && projects[projectIndex].userId === currentUser.id) {
        // Remove the project
        projects.splice(projectIndex, 1);
        localStorage.setItem('projects', JSON.stringify(projects));
        
        // Reload projects
        loadProjects();
    }
}

// Toggle dark mode
function toggleDarkMode() {
    const prefersDarkMode = document.body.classList.contains('dark-mode');
    if (prefersDarkMode) {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
        updateThemeIcon(false);
    } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        updateThemeIcon(true);
    }
    
    // Add a brief animation for smooth transition
    document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 500);
}

// Apply saved theme preference
function applyTheme() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedPreference = localStorage.getItem('darkMode');
    
    // Use saved preference if available, otherwise use system preference
    let isDarkMode = false;
    if (savedPreference !== null) {
        isDarkMode = savedPreference === 'true';
    } else {
        isDarkMode = prefersDark;
        localStorage.setItem('darkMode', isDarkMode.toString());
    }
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    updateThemeIcon(isDarkMode);
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (localStorage.getItem('darkMode') === null) {
            const newIsDarkMode = event.matches;
            document.body.classList.toggle('dark-mode', newIsDarkMode);
            updateThemeIcon(newIsDarkMode);
        }
    });
}

// Update theme toggle icon
function updateThemeIcon(isDarkMode) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
        themeToggle.setAttribute('title', isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
}