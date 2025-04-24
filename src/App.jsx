import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatSession from './components/ChatSession';
import ChatWindow from './components/ChatWindow';
import './styles/App.css';

// Error Boundary Component to Prevent Blank Pages
class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return <div>Something went wrong. Please refresh the page.</div>;
        }
        return this.props.children;
    }
}

const App = () => {
    // State Management
    const [sessions, setSessions] = useState(() => {
        const stored = localStorage.getItem('chatSessions');
        return stored ? JSON.parse(stored) : [];
    });
    const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id || null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading state for API processing

    // Derive activeSession from sessions and activeSessionId
    const activeSession = sessions.find(s => s.id === activeSessionId) || null;

    // Persist Sessions to Local Storage
    useEffect(() => {
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }, [sessions]);

    // Toggle Dark Mode
    useEffect(() => {
        document.body.classList.toggle('dark', darkMode);
    }, [darkMode]);

    // Create a New Chat Session
    const createNewSession = () => {
        const newSession = {
            id: Date.now(),
            name: 'New Chat',
            messages: [],
        };
        setSessions(prevSessions => [newSession, ...prevSessions]);
        setActiveSessionId(newSession.id);
    };

    // Handle Sending Messages (Text or File)
    const handleSendMessage = async (messageText, fileData = null) => {
        if (!activeSessionId) return;

        // Add user's message with a unique ID
        const newMessage = {
            id: Date.now(),
            sender: 'user',
            text: messageText,
            fileData,
        };

        // Update sessions with functional update
        setSessions(prevSessions =>
            prevSessions.map(s =>
                s.id === activeSessionId
                    ? { ...s, messages: [...s.messages, newMessage] }
                    : s
            )
        );

        // Set loading to true to trigger thinking indicator
        setIsLoading(true);

        // Process the message with the Gemini API
        await handleGeminiAPI(activeSessionId, messageText, fileData);
    };

    // Interact with Gemini API
    const handleGeminiAPI = async (sessionId, messageText, fileData) => {
        try {
            let requestBody;
            if (fileData) {
                // Handle files (PDFs, DOCX, Images) by sending base64 data
                const base64Data = fileData.base64.split(',')[1] || fileData.base64;
                console.log(`Sending file: ${fileData.name}, type: ${fileData.mime_type}`);
                requestBody = {
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                { text: messageText || 'Process this file' }, // Default text if empty
                                {
                                    inline_data: {
                                        mime_type: fileData.mime_type,
                                        data: base64Data,
                                    },
                                },
                            ],
                        },
                    ],
                };
            } else {
                // Handle text-only messages
                requestBody = {
                    contents: [{ role: 'user', parts: [{ text: messageText }] }],
                };
            }

            console.log('API request body:', JSON.stringify(requestBody, null, 2));

            const API_KEY = "AIzaSyCW7zO2IEuB9J1RRO6jpw3BOaxWV8Yduns"; // Replace with your actual Gemini API key
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API response:', data);

            const botResponseText =
                data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response from API.';

            // Add bot's response with a unique ID
            const botMessage = {
                id: Date.now(),
                sender: 'bot',
                text: botResponseText,
            };

            // Update sessions with functional update
            setSessions(prevSessions =>
                prevSessions.map(s =>
                    s.id === sessionId
                        ? { ...s, messages: [...s.messages, botMessage] }
                        : s
                )
            );
        } catch (error) {
            console.error('Gemini API Error:', error);
            // Add error message to chat with a unique ID
            const errorMessage = {
                id: Date.now(),
                sender: 'bot',
                text: 'Sorry, something went wrong while processing your request. Please try again.',
            };
            setSessions(prevSessions =>
                prevSessions.map(s =>
                    s.id === sessionId
                        ? { ...s, messages: [...s.messages, errorMessage] }
                        : s
                )
            );
        } finally {
            setIsLoading(false); // Hide loading state
        }
    };

    // Toggle Sidebar Visibility
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Rename a Session
    const handleRenameSession = (sessionId, newName) => {
        setSessions(prevSessions =>
            prevSessions.map(s =>
                s.id === sessionId ? { ...s, name: newName } : s
            )
        );
    };

    // Delete a Session
    const handleDeleteSession = (sessionId) => {
        setSessions(prevSessions => {
            const updatedSessions = prevSessions.filter(s => s.id !== sessionId);
            if (activeSessionId === sessionId) {
                setActiveSessionId(updatedSessions[0]?.id || null);
            }
            return updatedSessions;
        });
    };

    // Render the App
    return (
        <ErrorBoundary>
            <div className="app-container">
                <Sidebar
                    sessions={sessions}
                    onNewChat={createNewSession}
                    onSelectSession={(session) => setActiveSessionId(session.id)}
                    isOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                    onRenameSession={handleRenameSession}
                    onDeleteSession={handleDeleteSession}
                />
                {activeSession ? (
                    <ChatWindow
                        session={activeSession}
                        onSendMessage={handleSendMessage}
                        onStopResponse={() => console.log('Stop response functionality')}
                        darkMode={darkMode}
                        toggleDarkMode={() => setDarkMode(!darkMode)}
                        isLoading={isLoading} // Pass isLoading to ChatWindow
                    />
                ) : (
                    <div style={{ padding: '20px' }}>
                        <p>No active session. Create a new chat!</p>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default App;