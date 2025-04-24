import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { FiPaperclip, FiSend } from 'react-icons/fi';
import thinkingImage from '../assets/thinking.png';
import botLogo from '../assets/bot-logo.png';
import '../styles/ChatWindow.css';

const ChatWindow = ({ session, onSendMessage, onStopResponse, darkMode, toggleDarkMode, isLoading }) => {
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session.messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() && !selectedFile) return;

        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const base64Data = evt.target.result.split(',')[1];
                const fileData = {
                    name: selectedFile.name,
                    mime_type: selectedFile.type,
                    base64: base64Data,
                };
                onSendMessage(message, fileData);
                setMessage('');
                setSelectedFile(null);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    return (
        <div className={`chat-window ${darkMode ? 'dark-mode' : ''}`}>
            <header className="chat-header">
                <div className="logo-container">
                    <img src={botLogo} alt="Bot Logo" className="bot-logo" />
                    <h1 className="chat-title">{session.name}</h1>
                </div>
            </header>
            <div className="chats-container">
                {session.messages.map((msg, index) => (
                    <ChatMessage
                        key={index}
                        sender={msg.sender}
                        text={msg.text}
                        fileData={msg.fileData}
                    />
                ))}
                {isLoading && (
                    <div className="thinking-indicator">
                        <img src={thinkingImage} alt="Thinking..." className="thinking-image" />
                        <span className="thinking-text">Thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form className="prompt-form" onSubmit={handleSubmit}>
                <label htmlFor="fileInput" className="upload-btn">
                    <FiPaperclip size={22} />
                </label>
                <input
                    type="file"
                    id="fileInput"
                    onChange={handleFileChange}
                    accept=".pdf, image/*, .doc, .docx, .txt"
                    style={{ display: 'none' }}
                />
                {selectedFile && (
                    <>
                        <span>{selectedFile.name}</span>
                        <button
                            type="button"
                            className="remove-file"
                            onClick={() => setSelectedFile(null)}
                        >
                            ✕
                        </button>
                    </>
                )}
                <input
                    type="text"
                    placeholder="Ask Me Anything..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" className="send-btn">
                    Send <FiSend className="icon" />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;

