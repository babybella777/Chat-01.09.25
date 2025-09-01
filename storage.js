
class ChatStorage {
    constructor() {
        this.storageKey = 'izaChat';
    }

    
    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {
            messages: {
                'general': [],
                'losowym': []
            },
            settings: {
                username: 'Iza',
                theme: 'dark'
            }
        };
    }

    
    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    
    getMessages(room) {
        const data = this.getData();
        return data.messages[room] || [];
    }

    
    saveMessage(room, message) {
        const data = this.getData();
        if (!data.messages[room]) {
            data.messages[room] = [];
        }
        data.messages[room].push(message);
        this.saveData(data);
    }

   
    deleteMessage(room, messageId) {
        const data = this.getData();
        if (data.messages[room]) {
            console.log('Before deletion, messages:', data.messages[room].length);
            data.messages[room] = data.messages[room].filter(msg => msg.id != messageId); 
            console.log('After deletion, messages:', data.messages[room].length);
            this.saveData(data);
            console.log(`Deleted message ${messageId} from room ${room}`);
        }
    }

    
    getMessage(room, messageId) {
        const data = this.getData();
        if (!data.messages[room]) return null;
        return data.messages[room].find(msg => msg.id == messageId) || null;
    }

    
    updateMessage(room, messageId, updates) {
        const data = this.getData();
        if (!data.messages[room]) return false;
        let updated = false;
        data.messages[room] = data.messages[room].map(msg => {
            if (msg.id == messageId) {
                updated = true;
                return { ...msg, ...updates };
            }
            return msg;
        });
        if (updated) {
            this.saveData(data);
        }
        return updated;
    }


   
    getSettings() {
        const data = this.getData();
        return data.settings;
    }

    
    saveSettings(settings) {
        const data = this.getData();
        data.settings = { ...data.settings, ...settings };
        this.saveData(data);
    }


    
    clearAll() {
        localStorage.removeItem(this.storageKey);
    }
}
