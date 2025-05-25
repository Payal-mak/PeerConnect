// Initialize Feather Icons
feather.replace();

// Show Toast Notification
function showToast(title, message) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastMessage = document.getElementById('toast-message');
  
  if (toast && toastTitle && toastMessage) {
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// Check authentication and redirect
function checkAuth() {
  const currentUser = Auth.getCurrentUser();
  const currentPage = window.location.pathname.split('/').pop();
  
  // If user is logged in and tries to access index.html, redirect to profile
  if (currentUser && currentPage === 'index.html') {
    window.location.href = 'profile.html';
  }
  // If user is not logged in and tries to access any page except index.html, redirect to index
  else if (!currentUser && currentPage !== 'index.html') {
    window.location.href = 'index.html';
  }
}

// Initialize modal functionality
function initModals() {
  const authModal = document.getElementById('auth-modal');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const closeModalBtn = document.getElementById('close-modal');
  const openLoginModalBtn = document.getElementById('open-login-modal');
  const openRegisterModalBtn = document.getElementById('open-register-modal');
  const switchToRegisterBtn = document.getElementById('switch-to-register');
  const switchToLoginBtn = document.getElementById('switch-to-login');
  const loginFormSubmit = document.getElementById('login-form-submit');
  const registerFormSubmit = document.getElementById('register-form-submit');

  if (openLoginModalBtn) {
    openLoginModalBtn.addEventListener('click', () => {
      authModal.classList.remove('hidden');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
    });
  }

  if (openRegisterModalBtn) {
    openRegisterModalBtn.addEventListener('click', () => {
      authModal.classList.remove('hidden');
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      authModal.classList.add('hidden');
      loginForm.classList.add('hidden');
      registerForm.classList.add('hidden');
    });
  }

  if (switchToRegisterBtn) {
    switchToRegisterBtn.addEventListener('click', () => {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
    });
  }

  if (switchToLoginBtn) {
    switchToLoginBtn.addEventListener('click', () => {
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    });
  }

  if (loginFormSubmit) {
    loginFormSubmit.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        await Auth.login(email, password);
        authModal.classList.add('hidden');
        showToast('Login Successful', 'Welcome back!');
        window.location.href = 'profile.html';
      } catch (error) {
        showToast('Login Failed', error.message);
      }
    });
  }

  if (registerFormSubmit) {
    registerFormSubmit.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userData = {
        name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
        department: document.getElementById('register-department').value,
        year: document.getElementById('register-year').value
      };
      
      try {
        await Auth.register(userData);
        authModal.classList.add('hidden');
        showToast('Registration Successful', 'Welcome to PeerConnect!');
        window.location.href = 'profile.html';
      } catch (error) {
        showToast('Registration Failed', error.message);
      }
    });
  }
}

// Initialize the app
function initApp() {
  checkAuth();
  initModals();
  feather.replace();
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);