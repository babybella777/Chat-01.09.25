
class MessageHandler {
    constructor(storage) {
        this.storage = storage;
        
        this.initActionHandlers();
    }

   
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.isOwn ? 'own' : ''}`;
        messageDiv.dataset.messageId = message.id;
        
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'avatar-container';
        
       
        const avatar = document.createElement('img');
        avatar.className = 'message-avatar';
        avatar.src = 'https://cataas.com/cat/cute?width=41&height=41&c=ff0000';
        avatar.alt = message.username;
        
      
        const activeDot = document.createElement('div');
        activeDot.className = 'active-dot';
        
        
        avatarContainer.appendChild(avatar);
        avatarContainer.appendChild(activeDot);
        
       
        const textContentSection = document.createElement('div');
        textContentSection.className = 'message-text-content';
        
       
        const userInfo = document.createElement('div');
        userInfo.className = 'message-user-info';
        
       
        const username = document.createElement('span');
        username.className = 'message-author active-user';
        username.textContent = message.username || 'Iza';
        userInfo.appendChild(username);
        
        
        const flag = document.createElement('img');
        flag.className = 'country-flag';
        flag.src = 'https://flagcdn.com/w20/pl.png';
        flag.alt = 'Poland';
        userInfo.appendChild(flag);
        
       
        const timestamp = document.createElement('span');
        timestamp.className = 'message-time';
        timestamp.dataset.timestamp = message.timestamp;
        timestamp.textContent = this.formatMessageTime(message.timestamp);
        userInfo.appendChild(timestamp);

        
        if (message.edited) {
            const editedLabel = document.createElement('span');
            editedLabel.className = 'edited-label';
            editedLabel.textContent = ' (edytowano)';
            userInfo.appendChild(editedLabel);
        }
        
        
        const textBubble = document.createElement('div');
        textBubble.className = 'message-text-bubble';
        
        if (message.type === 'text') {
            const textContent = document.createElement('div');
            textContent.textContent = message.text;
            textBubble.appendChild(textContent);
        } else if (message.type === 'file') {
            textBubble.appendChild(this.createFileElement(message.file));
        }
        
        
        textContentSection.appendChild(userInfo);
        textContentSection.appendChild(textBubble);
        
        
        const contentWithAvatar = document.createElement('div');
        contentWithAvatar.className = 'message-content-with-avatar';
        contentWithAvatar.appendChild(avatarContainer);
        contentWithAvatar.appendChild(textContentSection);
        
        
        content.appendChild(contentWithAvatar);

       
        const actions = document.createElement('div');
        actions.className = 'message-actions';

        const btnEdit = document.createElement('button');
        btnEdit.className = 'message-action-btn btn-edit';
        btnEdit.dataset.action = 'edit';
        btnEdit.title = 'Edytuj wiadomość';
        btnEdit.innerHTML = '✏️';

        const btnQuote = document.createElement('button');
        btnQuote.className = 'message-action-btn btn-quote';
        btnQuote.dataset.action = 'quote';
        btnQuote.title = 'Cytuj wiadomość';
        btnQuote.innerHTML = '❝';

        const btnDelete = document.createElement('button');
        btnDelete.className = 'message-action-btn btn-delete';
        btnDelete.dataset.action = 'delete';
        btnDelete.title = 'Usuń wiadomość';
        btnDelete.innerHTML = '🗑️';

        actions.appendChild(btnQuote);
        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);

        
        userInfo.appendChild(actions);
        
       
        messageDiv.appendChild(content);
        
        return messageDiv;
    }

    
    createFileElement(file) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-message';
        fileDiv.textContent = `File: ${file.name || 'Unknown file'}`;
        return fileDiv;
    }

    
    displayMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = this.createMessageElement(message);
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    
    initActionHandlers() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        messagesContainer.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.message-action-btn');
            if (!actionBtn) return;
            const action = actionBtn.dataset.action;
            const messageDiv = e.target.closest('.message');
            if (!messageDiv) return;
            const messageId = messageDiv.dataset.messageId;

            this.handleMessageAction(action, messageId, messageDiv);
        });
    }

    handleMessageAction(action, messageId, messageDiv) {
        const room = window.chat ? window.chat.currentRoom : 'general';

        switch (action) {
            case 'delete':
                if (confirm('Czy na pewno chcesz usunąć tę wiadomość?')) {
                    this.storage.deleteMessage(room, messageId);
                    
                    if (messageDiv && messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }
                break;
            case 'edit':
                if (window.chat && typeof window.chat.startEditingMessage === 'function') {
                    window.chat.startEditingMessage(messageId);
                }
                break;
            case 'quote':
                if (window.chat && typeof window.chat.quoteMessage === 'function') {
                    window.chat.quoteMessage(messageId);
                }
                break;
            default:
                break;
        }
    }

    
    refreshMessageElement(room, messageId) {
        const msg = this.storage.getMessage(room, messageId);
        if (!msg) return;

        const messageDiv = document.querySelector(`.message[data-message-id="${messageId}"]`);
        if (!messageDiv) return;

        
        const timestampEl = messageDiv.querySelector('.message-time');
        if (timestampEl) {
            timestampEl.dataset.timestamp = msg.timestamp;
            timestampEl.textContent = this.formatMessageTime(msg.timestamp);
        }

        const userInfo = messageDiv.querySelector('.message-user-info');
        if (userInfo) {
            let editedLabel = userInfo.querySelector('.edited-label');
            if (msg.edited && !editedLabel) {
                editedLabel = document.createElement('span');
                editedLabel.className = 'edited-label';
                editedLabel.textContent = ' (edytowano)';
                userInfo.appendChild(editedLabel);
            }
        }

        
        const textBubble = messageDiv.querySelector('.message-text-bubble');
        if (textBubble) {
            textBubble.innerHTML = '';
            if (msg.type === 'text') {
                const div = document.createElement('div');
                div.textContent = msg.text;
                textBubble.appendChild(div);
            } else if (msg.type === 'file') {
                textBubble.appendChild(this.createFileElement(msg.file));
            }
        }
    }

   
    loadMessages(room) {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = '';
        
       
        if (room === 'general') {
            this.addSystemMessage('Witaj w Iza Chat!');
        } else {
            this.addSystemMessage(`Witaj w #${room} pokoju!`);
        }
        
       
        const messages = this.storage.getMessages(room);
        if (messages.length > 0) {
           
            const messagesByDate = this.groupMessagesByDate(messages);
            
            
            Object.keys(messagesByDate).forEach(dateKey => {
                
                this.addDateHeaderForDate(dateKey, messagesByDate[dateKey][0].timestamp);
                
                
                messagesByDate[dateKey].forEach(message => {
                    
                    const currentUser = window.chat?.storage?.getSettings()?.username || 'Iza';
                    message.isOwn = message.username === currentUser;
                    this.displayMessage(message);
                });
            });
        } else {
           
            this.addDateHeader();
        }
    }

   
    groupMessagesByDate(messages) {
        const grouped = {};
        
        messages.forEach(message => {
            const messageDate = new Date(message.timestamp);
            const dateKey = this.getDateOnly(messageDate);
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(message);
        });
        
        return grouped;
    }

   
    getDateOnly(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    
    addDateHeaderForDate(dateKey, timestamp) {
        const messagesContainer = document.getElementById('chat-messages');
        const dateHeader = document.createElement('div');
        dateHeader.className = 'chat-date-header';
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'current-date';
        dateSpan.textContent = this.formatDateHeader(timestamp);
        
        dateHeader.appendChild(dateSpan);
        messagesContainer.appendChild(dateHeader);
    }

    
    formatDateHeader(timestamp) {
        const messageDate = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        
        const messageDateKey = this.getDateOnly(messageDate);
        const todayKey = this.getDateOnly(today);
        const yesterdayKey = this.getDateOnly(yesterday);
        
        if (messageDateKey === todayKey) {
            return 'Dzisiaj';
        } else if (messageDateKey === yesterdayKey) {
            return 'Wczoraj';
        } else {
           
            const polishMonths = [
                'Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze',
                'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'
            ];
            
            const day = messageDate.getDate();
            const month = polishMonths[messageDate.getMonth()];
            const year = messageDate.getFullYear();
            
            return `${day} ${month} ${year}`;
        }
    }

    
    addDateHeader() {
        const messagesContainer = document.getElementById('chat-messages');
        const dateHeader = document.createElement('div');
        dateHeader.className = 'chat-date-header';
        dateHeader.id = 'chat-date-header';
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'current-date';
        dateSpan.id = 'current-date';
        dateSpan.textContent = 'Dzisiaj'; 
        
        dateHeader.appendChild(dateSpan);
        messagesContainer.appendChild(dateHeader);
        this.scrollToBottom();
    }

   
    addSystemMessage(text) {
        const messagesContainer = document.getElementById('chat-messages');
        const systemDiv = document.createElement('div');
        systemDiv.className = 'system-message';
        systemDiv.textContent = text;
        messagesContainer.appendChild(systemDiv);
        this.scrollToBottom();
    }

   
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pl-PL', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    
    formatMessageTime(timestamp) {
        const now = new Date();
        const messageDate = new Date(timestamp);
        const diffInMs = now - messageDate;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        
        if (diffInMinutes < 60) {
           
            if (diffInMinutes <= 1) {
                return 'teraz'; 
            } else {
                return `${diffInMinutes} min temu`; 
            }
        } else if (diffInHours < 24) {
            
            if (diffInHours === 1) {
                return '1 godzinę temu'; 
            } else if (diffInHours < 5) {
                return `${diffInHours} godziny temu`; 
            } else {
                return `${diffInHours} godzin temu`; 
            }
        } else {
           
            return messageDate.toLocaleTimeString('pl-PL', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    }

    
    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
