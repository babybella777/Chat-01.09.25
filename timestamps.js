
function formatMessageTime(timestamp) {
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


function updateMessageTimestamps() {
    const messageTimeElements = document.querySelectorAll('.message-time');
    messageTimeElements.forEach(element => {
        if (element.dataset.timestamp) {
            element.textContent = formatMessageTime(element.dataset.timestamp);
        }
    });
}


function createMessageWithTimestamp(content, author, isMyMessage = false) {
    const now = new Date().toISOString();
    const messageClass = isMyMessage ? 'message my-message' : 'message';
    
    return `
        <div class="${messageClass}">
            <div class="message-wrapper">
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author ${isMyMessage ? 'active-user' : ''}">${author}</span>
                        <img src="https://flagcdn.com/w20/pl.png" alt="Poland" class="country-flag">
                        <span class="message-time" data-timestamp="${now}">${formatMessageTime(now)}</span>
                    </div>
                    <div class="message-text">${content}</div>
                </div>
                ${isMyMessage ? '' : '<div class="avatar-container"><img src="https://cataas.com/cat/40/40" alt="User" class="message-avatar"><div class="active-dot"></div></div>'}
            </div>
        </div>
    `;
}


document.addEventListener('DOMContentLoaded', function() {
    
    updateMessageTimestamps();
    setInterval(updateMessageTimestamps, 60000); 
});
