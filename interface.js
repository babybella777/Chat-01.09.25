
class UIUtils {
  
    static convertInputToTextarea() {
        const messageInput = document.getElementById('message-input');
        if (messageInput && messageInput.tagName === 'INPUT') {
            const textarea = document.createElement('textarea');
            textarea.id = 'message-input';
            textarea.placeholder = messageInput.placeholder;
            textarea.maxLength = messageInput.maxLength;
            textarea.className = messageInput.className;
            
            messageInput.parentNode.replaceChild(textarea, messageInput);
        }
    }

    
    static autoResizeTextarea() {
        const textarea = document.getElementById('message-input');
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    }

   
    static updateCharCounter() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;
        
        const text = messageInput.value;
        const maxLength = messageInput.maxLength || 2000;
        
        
        if (text.length >= maxLength) {
            messageInput.value = messageInput.value.substring(0, maxLength);
        }
    }
}
