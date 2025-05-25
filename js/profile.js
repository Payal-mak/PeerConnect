function initProfilePage() {
  const currentUser = Auth.getCurrentUser();
  
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // DOM Elements
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userDetails = document.getElementById('user-details');
  const profileCollegeId = document.getElementById('profile-collegeId');
  const profileBio = document.getElementById('profile-bio');
  const profileSkills = document.getElementById('profile-skills');
  const profileInterests = document.getElementById('profile-interests');
  const profileView = document.getElementById('profile-view');
  const profileEdit = document.getElementById('profile-edit');
  const editName = document.getElementById('edit-name');
  const editDepartment = document.getElementById('edit-department');
  const editYear = document.getElementById('edit-year');
  const editCollegeId = document.getElementById('edit-collegeId');
  const editBio = document.getElementById('edit-bio');
  const editSkills = document.getElementById('edit-skills');
  const editInterests = document.getElementById('edit-interests');
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const saveProfileBtn = document.getElementById('save-profile-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
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

  // Render profile
  function renderProfile() {
    userAvatar.textContent = currentUser.name.charAt(0);
    userName.textContent = currentUser.name;
    userDetails.textContent = `${currentUser.department} • ${currentUser.year}`;
    profileCollegeId.textContent = currentUser.collegeId;
    profileBio.textContent = currentUser.bio || 'No bio yet';
    
    profileSkills.innerHTML = currentUser.skills?.map(skill => 
      `<span class="inline-block bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs px-3 py-1 rounded-full mr-2 mb-2 font-medium">${skill}</span>`
    ).join('') || 'No skills added';
    
    profileInterests.innerHTML = currentUser.interests?.map(interest => 
      `<span class="inline-block bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs px-3 py-1 rounded-full mr-2 mb-2 font-medium">${interest}</span>`
    ).join('') || 'No interests added';
  }

  // Edit profile
  editProfileBtn.addEventListener('click', () => {
    profileView.classList.add('hidden');
    profileEdit.classList.remove('hidden');
    
    editName.value = currentUser.name;
    editDepartment.value = currentUser.department;
    editYear.value = currentUser.year;
    editCollegeId.value = currentUser.collegeId;
    editBio.value = currentUser.bio || '';
    editSkills.value = currentUser.skills?.join(', ') || '';
    editInterests.value = currentUser.interests?.join(', ') || '';
  });

  // Cancel edit
  cancelEditBtn.addEventListener('click', () => {
    profileView.classList.remove('hidden');
    profileEdit.classList.add('hidden');
  });

  // Save profile
  saveProfileBtn.addEventListener('click', () => {
    const updatedUser = {
      ...currentUser,
      name: editName.value.trim(),
      department: editDepartment.value.trim(),
      year: editYear.value,
      collegeId: editCollegeId.value.trim(),
      bio: editBio.value.trim(),
      skills: editSkills.value.split(',').map(s => s.trim()).filter(s => s),
      interests: editInterests.value.split(',').map(i => i.trim()).filter(i => i)
    };

    // Validate
    if (!updatedUser.name || !updatedUser.department || !updatedUser.year || !updatedUser.collegeId) {
      showToast('Error', 'Please fill in all required fields');
      return;
    }

    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem('peerconnect-users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('peerconnect-users', JSON.stringify(users));
      localStorage.setItem('peerconnect-current-user', JSON.stringify(updatedUser));
    }

    showToast('Success', 'Profile updated successfully');
    profileView.classList.remove('hidden');
    profileEdit.classList.add('hidden');
    renderProfile();
  });

  // Initial render
  renderProfile();
}

document.addEventListener('DOMContentLoaded', initProfilePage);