class IzaChat {
    constructor() {
        this.currentRoom = 'general';
        this.users = ['You'];
        this.isTyping = false;
        this.typingTimeout = null;
        this.editingMessageId = null; 
        
       
        this.storage = new ChatStorage();
        this.messageHandler = new MessageHandler(this.storage);
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.loadMessages();
        this.setupDateUpdater();
        this.updateDateHeader();
    }

    loadMessages() {
        this.messageHandler.loadMessages(this.currentRoom);
    }

    
    clearAllData() {
        if (confirm('Are you sure you want to clear all chat data? This cannot be undone.')) {
            localStorage.removeItem('izaChat');
            location.reload();
        }
    }

    setupDateUpdater() {
     
        this.updateDateHeader();
        
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        
        setTimeout(() => {
            this.updateDateHeader();
            
           
            setInterval(() => {
                this.updateDateHeader();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
        
        
        setInterval(() => {
            this.updateDateHeader();
        }, 60000);
    }

    updateDateHeader() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const now = new Date();
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const currentDay = this.getDateOnly(now);
            const todayDay = this.getDateOnly(today);
            const yesterdayDay = this.getDateOnly(yesterday);
            
            if (currentDay === todayDay) {
                dateElement.textContent = 'Dzisiaj';
            } else if (currentDay === yesterdayDay) {
                dateElement.textContent = 'Wczoraj';
            } else {
                
                dateElement.textContent = now.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
            }
        }
    }

  
    getDateOnly(date) {
        return date.toISOString().split('T')[0];
    }

    setupEventListeners() {
       
        const sendBtn = document.getElementById('send-btn');
        const textarea = document.getElementById('message-input');
        
        if (textarea) {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  
                    e.preventDefault();
                    e.stopPropagation();
                   
                    this.sendMessage();
                    return false;
                }
               
                this.handleTyping();
            });

            textarea.addEventListener('input', () => {
                this.handleTyping();
                UIUtils.autoResizeTextarea();
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        
        document.addEventListener('click', (e) => {
            if (e.target.closest('.room-item')) {
                const roomItem = e.target.closest('.room-item');
                const roomId = roomItem.dataset.room;
                this.switchRoom(roomId);
            }
        });

        
        const mobileToggle = document.getElementById('mobile-toggle');
        const sidebarLeft = document.querySelector('.sidebar-left');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        
        if (mobileToggle && sidebarLeft && sidebarOverlay) {
            mobileToggle.addEventListener('click', () => {
                sidebarLeft.classList.toggle('open');
                sidebarOverlay.classList.toggle('active');
                document.body.style.overflow = sidebarLeft.classList.contains('open') ? 'hidden' : '';
            });
            
         
            sidebarOverlay.addEventListener('click', () => {
                sidebarLeft.classList.remove('open');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
            
           
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    sidebarLeft.classList.remove('open');
                    sidebarOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    switchRoom(roomId) {
        
        document.querySelectorAll('.room-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const targetRoom = document.querySelector(`[data-room="${roomId}"]`);
        if (targetRoom) {
            targetRoom.classList.add('active');
        }
        
        this.currentRoom = roomId;
        this.loadMessages();
    }

    loadMessages() {
        this.messageHandler.loadMessages(this.currentRoom);
    }

    sendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput) {
            console.error('Message input not found');
            return;
        }

        const text = messageInput.value.trim();
        
        if (text === '') return;

        const settings = this.storage.getSettings();

      
        if (this.editingMessageId) {
            const updated = this.storage.updateMessage(this.currentRoom, this.editingMessageId, {
                text: text,
                edited: true,
                timestamp: new Date()
            });
            if (updated) {
                
                this.messageHandler.refreshMessageElement(this.currentRoom, this.editingMessageId);
            }
          
            this.editingMessageId = null;
            
            messageInput.value = '';
            messageInput.style.height = 'auto';
            messageInput.removeAttribute('data-quoting');
            messageInput.focus();
            return;
        }
        
        this.addMessage({
            id: Date.now(),
            username: settings.username,
            text: text,
            timestamp: new Date(),
            type: 'text',
            isOwn: true
        });
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        
        messageInput.focus();
    }

  
    quoteMessage(messageId) {
        const msg = this.storage.getMessage(this.currentRoom, messageId);
        if (!msg) return;
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;

        const quotedText = `> ${msg.username}: ${msg.text}\n`;
        messageInput.value = quotedText + (messageInput.value ? '\n' + messageInput.value : '');
        messageInput.focus();
        UIUtils.autoResizeTextarea();
    }

    
    startEditingMessage(messageId) {
        const msg = this.storage.getMessage(this.currentRoom, messageId);
        if (!msg) return;
       
        const settings = this.storage.getSettings();
        if (msg.username !== settings.username) {
            alert('Możesz edytować tylko swoje wiadomości.');
            return;
        }

        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;

        messageInput.value = msg.text;
        messageInput.focus();
        UIUtils.autoResizeTextarea();

        this.editingMessageId = messageId;
        
        messageInput.setAttribute('data-editing', 'true');
    }

    addMessage(message) {
       
        this.storage.saveMessage(this.currentRoom, message);
        
       
        this.messageHandler.displayMessage(message);
    }

    loadMessages() {
        this.messageHandler.loadMessages(this.currentRoom);
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.textContent = 'pisze...';
            }
        }
        
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.textContent = '';
            }
        }, 1000);
    }

    loadSettings() {
        const settings = this.storage.getSettings();
        
        
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.textContent = settings.username;
        }
        
        
        if (settings.theme === 'light') {
            document.body.classList.add('light-theme');
        }
    }

}


window.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing chat...'); 
    window.chat = new IzaChat();
    console.log('Chat initialized:', window.chat); 
});
