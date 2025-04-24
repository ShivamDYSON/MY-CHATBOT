import React, { useState } from 'react';
import { FaTrash, FaPen } from 'react-icons/fa';
import '../styles/Sidebar.css';

const Sidebar = ({
    sessions,
    onNewChat,
    onSelectSession,
    isOpen,
    toggleSidebar,
    onRenameSession,
    onDeleteSession,
}) => {
    const [editingId, setEditingId] = useState(null);
    const [tempName, setTempName] = useState('');

    const handleEditClick = (session) => {
        setEditingId(session.id);
        setTempName(session.name);
    };

    const handleRename = (session) => {
        if (tempName.trim() !== '') {
            onRenameSession(session.id, tempName);
        }
        setEditingId(null);
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            {isOpen ? (
                <>
                    <button className="send-btn" onClick={onNewChat}>
                        New Chat
                    </button>
                    <ul className="session-list">
                        {sessions.map((session) => (
                            <li key={session.id} className="session-item">
                                {editingId === session.id ? (
                                    <div className="session-edit">
                                        <input
                                            type="text"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' && handleRename(session)
                                            }
                                            autoFocus
                                        />
                                        <button className="save-btn" onClick={() => handleRename(session)}>
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <div className="session-display">
                                        <span
                                            className="session-name"
                                            onClick={() => onSelectSession(session)}
                                        >
                                            {session.name}
                                        </span>
                                        <div className="session-actions">
                                            <FaPen
                                                className="icon edit-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(session);
                                                }}
                                            />
                                            <FaTrash
                                                className="icon delete-icon"
                                                style={{ color: 'red' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteSession(session.id);
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <button className="send-btn" onClick={toggleSidebar}>
                        Close Sidebar
                    </button>
                    <div className="developer-tag">Developed by Shivam Prakash</div>
                </>
            ) : (
                <button className="burger-menu" onClick={toggleSidebar}>
                    ☰
                </button>
            )}
        </div>
    );
};

export default Sidebar;