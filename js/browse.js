// Initialize page
function initializeBrowsePage() {
    const currentUser = JSON.parse(localStorage.getItem('peerconnect-current-user'));
    const users = JSON.parse(localStorage.getItem('peerconnect-users') || '[]');
    const otherUsers = users.filter(u => u.id !== currentUser.id);

    // Update stats
    document.getElementById('connections-count').textContent = currentUser.connections.length;
    document.getElementById('profile-views').textContent = Math.floor(Math.random() * 50); // Mock data
    document.getElementById('skill-matches').textContent = otherUsers.length;

    displayUsers(otherUsers);
    setupFilters();
}

function displayUsers(users) {
    const grid = document.getElementById('student-grid');
    const empty = document.getElementById('empty-state');
    
    if (users.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        empty.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400">
                <p class="text-xl">No students found</p>
                <p class="text-sm">Try adjusting your filters</p>
            </div>
        `;
        return;
    }

    empty.classList.add('hidden');
    grid.innerHTML = users.map(user => `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-2 border-teal-500 dark:border-teal-400">
                    <span class="text-lg font-bold text-gray-700 dark:text-gray-200">${user.username[0].toUpperCase()}</span>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">${user.username}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">${user.department} • ${user.year}</p>
                </div>
            </div>
            <div class="space-y-4">
                <button onclick="toggleConnection('${user.id}')" class="w-full px-4 py-2 gradient-bg text-white rounded-lg font-medium hover:scale-105 transition-transform">
                    ${isConnected(user.id) ? 'Remove Connection' : 'Add Connection'}
                </button>
            </div>
        </div>
    `).join('');
}

function isConnected(userId) {
    const currentUser = JSON.parse(localStorage.getItem('peerconnect-current-user'));
    return currentUser.connections ? currentUser.connections.includes(userId) : false;
}

function toggleConnection(userId) {
    const currentUser = JSON.parse(localStorage.getItem('peerconnect-current-user'));
    const users = JSON.parse(localStorage.getItem('peerconnect-users'));
    
    if (!currentUser.connections) {
        currentUser.connections = [];
    }
    
    if (isConnected(userId)) {
        currentUser.connections = currentUser.connections.filter(id => id !== userId);
        showToast('Success', 'Connection removed', 'success');
    } else {
        currentUser.connections.push(userId);
        showToast('Success', 'Connection added', 'success');
    }
    
    // Update user in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex] = currentUser;
    
    // Save changes
    localStorage.setItem('peerconnect-current-user', JSON.stringify(currentUser));
    localStorage.setItem('peerconnect-users', JSON.stringify(users));
    
    // Refresh display
    initializeBrowsePage();
}

function setupFilters() {
    const searchInput = document.getElementById('search-input');
    const departmentFilter = document.getElementById('department-filter');
    const yearFilter = document.getElementById('year-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    function applyFilters() {
        const currentUser = JSON.parse(localStorage.getItem('peerconnect-current-user'));
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        let filteredUsers = users.filter(u => u.id !== currentUser.id);
        
        const searchTerm = searchInput.value.toLowerCase();
        const department = departmentFilter.value;
        const year = yearFilter.value;
        
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(u => 
                u.username.toLowerCase().includes(searchTerm) ||
                u.department.toLowerCase().includes(searchTerm)
            );
        }
        
        if (department) {
            filteredUsers = filteredUsers.filter(u => u.department === department);
        }
        
        if (year) {
            filteredUsers = filteredUsers.filter(u => u.year === year);
        }
        
        displayUsers(filteredUsers);
    }
    
    searchInput.addEventListener('input', applyFilters);
    departmentFilter.addEventListener('change', applyFilters);
    yearFilter.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        departmentFilter.value = '';
        yearFilter.value = '';
        applyFilters();
    });
}

// Initialize page when loaded
document.addEventListener('DOMContentLoaded', initializeBrowsePage);