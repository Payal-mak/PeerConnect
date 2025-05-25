// Shared utilities for PeerConnect

// Standard mock students data
const mockStudents = [
  {
    id: 'mock1',
    name: 'Alex Johnson',
    department: 'Computer Science',
    year: 'Junior',
    collegeId: 'CS12345',
    skills: ['JavaScript', 'React', 'Node.js'],
    interests: ['Web Development', 'AI', 'Cybersecurity'],
    bio: 'Passionate about building web applications and learning new technologies.',
    avatar: '/placeholder.svg?height=80&width=80'
  },
  {
    id: 'mock2',
    name: 'Sarah Williams',
    department: 'Design',
    year: 'Sophomore',
    collegeId: 'DS67890',
    skills: ['UI/UX Design', 'Figma', 'Illustration'],
    interests: ['Product Design', 'User Research', 'Frontend Development'],
    bio: 'Design enthusiast with a focus on creating intuitive user experiences.',
    avatar: '/placeholder.svg?height=80&width=80'
  },
  {
    id: 'mock3',
    name: 'Michael Chen',
    department: 'Engineering',
    year: 'Senior',
    collegeId: 'EN34567',
    skills: ['Python', 'Data Analysis', 'Machine Learning'],
    interests: ['AI Research', 'Robotics', 'IoT'],
    bio: 'Interested in applying machine learning to solve real-world problems.',
    avatar: '/placeholder.svg?height=80&width=80'
  }
];

/**
 * Display toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - Toast type (info, success, error)
 */
function showToast(title, message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');

    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set color based on type
    toast.className = `fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm ${
        type === 'error' ? 'border-red-500' : type === 'success' ? 'border-green-500' : ''
    }`;
    
    toast.classList.remove('hidden');
    toast.style.opacity = '1';
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}

// Format time ago for messages
function formatTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = (now - date) / 1000; // Difference in seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

// Get all users (mock + registered)
function getAllUsers() {
  const registeredUsers = JSON.parse(localStorage.getItem('peerconnect-users') || '[]');
  return [...mockStudents, ...registeredUsers];
}

// Safely parse localStorage data
function safeParseJSON(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage:`, e);
    return defaultValue;
  }
}