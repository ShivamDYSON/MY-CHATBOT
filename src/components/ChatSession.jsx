import { useState, useEffect } from 'react';

function ChatSession() {
    // Load messages from localStorage, or start with an empty array
    const [messages, setMessages] = useState(() => {
        const storedMessages = localStorage.getItem('chatMessages');
        return storedMessages ? JSON.parse(storedMessages) : [];
    });

    // Save messages to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    // Function to add a new message
    const addMessage = (text, sender) => {
        setMessages((prev) => [...prev, { text, sender, timestamp: Date.now() }]);
    };

    // Example usage: Replace with your actual message handling
    return (
        <div>
            {messages.map((msg, index) => (
                <div key={index}>{`${msg.sender}: ${msg.text}`}</div>
            ))}
            {/* Your input/send logic here */}
        </div>
    );
}

export default ChatSession;