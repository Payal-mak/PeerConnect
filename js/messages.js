// Initialize Messages Page
function initMessagesPage() {
  // Always reload conversations from localStorage at the start
  let conversations = safeParseJSON('peerconnect-conversations', []);
  const currentUser = Auth.getCurrentUser();
  
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // DOM Elements
  const messagesList = document.getElementById('messages-list');
  const emptyMessages = document.getElementById('empty-messages');
  const themeToggle = document.getElementById('theme-toggle');
  const logoutBtn = document.getElementById('logout-btn');
  const newMessageBtn = document.getElementById('new-message-btn');
  const newMessageModal = document.getElementById('new-message-modal');
  const closeModalBtn = document.getElementById('close-message-modal');
  const sendMessageBtn = document.getElementById('send-message-btn');
  const messageRecipient = document.getElementById('message-recipient');
  const messageContent = document.getElementById('message-content');

  // Mock conversations data
  const mockConversations = [
    {
      id: 'conv1',
      participants: [currentUser.id, 'mock1'],
      messages: [
        {
          sender: 'mock1',
          content: 'Hey there! I saw your project on PeerConnect and wanted to connect.',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          sender: currentUser.id,
          content: 'Hi Alex! Thanks for reaching out. What specifically interested you?',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ]
    },
    {
      id: 'conv2',
      participants: [currentUser.id, 'mock2'],
      messages: [
        {
          sender: 'mock2',
          content: 'Are you still working on the design project?',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    }
  ];

  // If no conversations in localStorage, initialize with mock data
  if (!conversations || conversations.length === 0) {
    conversations = mockConversations;
    localStorage.setItem('peerconnect-conversations', JSON.stringify(conversations));
  }

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

  // Populate user info
  document.getElementById('user-name').textContent = currentUser.name;
  document.getElementById('user-details').textContent = currentUser.department;
  document.getElementById('user-avatar').textContent = currentUser.name.charAt(0);

  // New message modal
  if (newMessageBtn && newMessageModal) {
    newMessageBtn.addEventListener('click', () => {
      newMessageModal.classList.remove('hidden');
      populateRecipients();
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      newMessageModal.classList.add('hidden');
    });
  }

  // Populate recipients dropdown
  function populateRecipients() {
    messageRecipient.innerHTML = '<option value="">Select a student</option>';
    
    // Get connections
    const connections = safeParseJSON('peerconnect-connections', {})[currentUser.id] || [];
    
    // Get all users
    const allUsers = getAllUsers();
    
    connections.forEach(connectionId => {
      const user = allUsers.find(u => u.id === connectionId);
      if (user) {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.department})`;
        messageRecipient.appendChild(option);
      }
    });
  }

  // Send new message
  if (sendMessageBtn) {
    sendMessageBtn.addEventListener('click', () => {
      const recipientId = messageRecipient.value;
      const content = messageContent.value.trim();
      
      if (!recipientId || !content) {
        showToast('Error', 'Please select a recipient and enter a message');
        return;
      }
      
      // Find or create conversation
      let conversation = conversations.find(conv => 
        conv.participants.includes(currentUser.id) && conv.participants.includes(recipientId)
      );
      
      if (!conversation) {
        conversation = {
          id: `conv${Date.now()}`,
          participants: [currentUser.id, recipientId],
          messages: []
        };
        conversations.push(conversation);
      }
      
      // Add new message
      conversation.messages.push({
        sender: currentUser.id,
        content: content,
        timestamp: new Date().toISOString()
      });
      
      // Save to localStorage
      localStorage.setItem('peerconnect-conversations', JSON.stringify(conversations));
      
      // Close modal and reset
      newMessageModal.classList.add('hidden');
      messageContent.value = '';
      
      // Show success toast
      showToast('Message Sent', 'Your message has been sent successfully');
      
      // Simulate auto-reply after 2 seconds
      setTimeout(() => {
        const autoReply = {
          sender: recipientId,
          content: `Hey! Thanks for your message. I'm interested in collaborating on a project. What do you think?`,
          timestamp: new Date().toISOString()
        };
        conversation.messages.push(autoReply);
        localStorage.setItem('peerconnect-conversations', JSON.stringify(conversations));
        renderConversations();
        // If the conversation is open, update the thread
        const conversationView = document.querySelector('.fixed.inset-0');
        if (conversationView && conversationView.dataset && conversationView.dataset.conversationId === conversation.id) {
          const messageThread = conversationView.querySelector('#message-thread');
          const messageElement = createMessageElement(autoReply, false);
          messageThread.appendChild(messageElement);
          messageThread.scrollTop = messageThread.scrollHeight;
        }
      }, 2000);
      
      // Refresh messages list
      conversations = safeParseJSON('peerconnect-conversations', []);
      renderConversations();
    });
  }

  // Render conversations
  function renderConversations() {
    messagesList.innerHTML = '';
    
    const userConversations = conversations.filter(conv => 
      conv.participants.includes(currentUser.id)
    );
    
    if (userConversations.length === 0) {
      emptyMessages.classList.remove('hidden');
      emptyMessages.innerHTML = `
        <div class="text-center py-12">
          <i data-feather="message-circle" class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"></i>
          <p class="text-lg font-medium text-gray-600 dark:text-gray-300">No messages yet</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Start a conversation with a peer!</p>
          <button id="start-new-message" class="mt-4 inline-block px-6 py-2 gradient-bg text-white rounded-lg font-medium hover:scale-105 transition-transform">New Message</button>
        </div>
      `;
      feather.replace();
      document.getElementById('start-new-message').addEventListener('click', () => {
        newMessageModal.classList.remove('hidden');
        populateRecipients();
      });
      return;
    }
    
    emptyMessages.classList.add('hidden');
    
    // Get all users
    const allUsers = getAllUsers();
    
    userConversations.forEach(conversation => {
      const otherUserId = conversation.participants.find(id => id !== currentUser.id);
      const otherUser = allUsers.find(user => user.id === otherUserId);
      
      if (otherUser) {
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        const conversationCard = createConversationCard(otherUser, lastMessage, conversation.id);
        messagesList.appendChild(conversationCard);
      }
    });
  }

  // Create conversation card
  function createConversationCard(user, lastMessage, conversationId) {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700';
    card.dataset.conversationId = conversationId;
    card.addEventListener('click', () => {
      viewConversation(conversationId, user);
    });
    
    const timeAgo = lastMessage ? formatTimeAgo(lastMessage.timestamp) : '';
    const messagePreview = lastMessage ? 
      (lastMessage.content.length > 50 ? 
        lastMessage.content.substring(0, 50) + '...' : 
        lastMessage.content) : 
      'No messages yet';
    
    card.innerHTML = `
      <div class="flex items-center space-x-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-2 border-teal-500 dark:border-teal-400">
            <span class="text-lg font-bold text-gray-700 dark:text-gray-200">${user.name.charAt(0)}</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-heading font-bold text-gray-900 dark:text-white truncate">${user.name}</h3>
            <span class="text-xs text-gray-500 dark:text-gray-400">${timeAgo}</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">${messagePreview}</p>
        </div>
      </div>
    `;
    
    return card;
  }

  // View conversation
  function viewConversation(conversationId, otherUser) {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return;
    
    // Create conversation view
    const conversationView = document.createElement('div');
    conversationView.className = 'fixed inset-0 bg-white dark:bg-gray-900 z-50 p-4 sm:p-6 overflow-y-auto';
    conversationView.dataset.conversationId = conversationId;
    
    conversationView.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <button id="back-to-list" class="focus-outline p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <i data-feather="arrow-left" class="w-5 h-5"></i>
            </button>
            <h2 class="text-xl font-heading font-bold text-gray-900 dark:text-white">${otherUser.name}</h2>
          </div>
          <button id="close-conversation" class="focus-outline p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <i data-feather="x" class="w-5 h-5"></i>
          </button>
        </div>
        
        <div id="message-thread" class="space-y-4 mb-6"></div>
        
        <div class="flex items-center space-x-3">
          <input id="reply-content" type="text" class="focus-outline flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white placeholder-gray-400" placeholder="Type your message...">
          <button id="send-reply" class="focus-outline p-3 gradient-bg text-white rounded-lg hover:scale-105 transition-transform">
            <i data-feather="send" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(conversationView);
    feather.replace();
    
    // Back to list button
    const backBtn = conversationView.querySelector('#back-to-list');
    backBtn.addEventListener('click', () => {
      conversationView.remove();
    });
    
    // Close button
    const closeBtn = conversationView.querySelector('#close-conversation');
    closeBtn.addEventListener('click', () => {
      conversationView.remove();
    });
    
    // Render messages
    const messageThread = conversationView.querySelector('#message-thread');
    conversation.messages.forEach(message => {
      const isCurrentUser = message.sender === currentUser.id;
      const messageElement = createMessageElement(message, isCurrentUser);
      messageThread.appendChild(messageElement);
    });
    
    // Scroll to bottom
    messageThread.scrollTop = messageThread.scrollHeight;
    
    // Send reply
    const replyContent = conversationView.querySelector('#reply-content');
    const sendReplyBtn = conversationView.querySelector('#send-reply');
    
    sendReplyBtn.addEventListener('click', () => {
      const content = replyContent.value.trim();
      if (!content) return;
      
      // Add new message
      const newMessage = {
        sender: currentUser.id,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      conversation.messages.push(newMessage);
      localStorage.setItem('peerconnect-conversations', JSON.stringify(conversations));
      
      // Add to thread
      const messageElement = createMessageElement(newMessage, true);
      messageThread.appendChild(messageElement);
      
      // Clear input
      replyContent.value = '';
      
      // Scroll to bottom
      messageThread.scrollTop = messageThread.scrollHeight;
      
      // Simulate auto-reply after 2 seconds
      setTimeout(() => {
        const otherUserId = conversation.participants.find(id => id !== currentUser.id);
        const autoReply = {
          sender: otherUserId,
          content: `That sounds great! Let's discuss more details.`,
          timestamp: new Date().toISOString()
        };
        conversation.messages.push(autoReply);
        localStorage.setItem('peerconnect-conversations', JSON.stringify(conversations));
        const autoReplyElement = createMessageElement(autoReply, false);
        messageThread.appendChild(autoReplyElement);
        messageThread.scrollTop = messageThread.scrollHeight;
        renderConversations();
      }, 2000);
    });
    
    // Send on Enter key
    replyContent.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendReplyBtn.click();
      }
    });
  }

  // Create message element
  function createMessageElement(message, isCurrentUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `max-w-xs sm:max-w-sm md:max-w-md rounded-2xl p-4 shadow-md transition-all duration-200 ${
      isCurrentUser 
        ? 'gradient-bg text-white' 
        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
    }`;
    
    bubble.innerHTML = `
      <p class="text-base">${message.content}</p>
      <span class="text-xs text-gray-500 dark:text-gray-400 block mt-2 ${
        isCurrentUser ? 'text-right text-white/70' : 'text-left'
      }">${formatTimeAgo(message.timestamp)}</span>
    `;
    
    messageDiv.appendChild(bubble);
    return messageDiv;
  }

  // Initial render (always reload from localStorage)
  conversations = safeParseJSON('peerconnect-conversations', []);
  renderConversations();
}

// Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
  initMessagesPage();
  // Ensure the New Message button always opens the modal
  const newMessageBtn = document.getElementById('new-message-btn');
  const newMessageModal = document.getElementById('new-message-modal');
  if (newMessageBtn && newMessageModal) {
    newMessageBtn.addEventListener('click', () => {
      newMessageModal.classList.remove('hidden');
      if (typeof populateRecipients === 'function') populateRecipients();
    });
  }
});