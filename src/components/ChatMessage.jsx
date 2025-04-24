import React from 'react';

const ChatMessage = ({ sender, text, fileData }) => {
    const isUser = sender === 'user';

    // Simple logic to see if the file is an image
    const isImage = fileData && fileData.mime_type?.startsWith('image/');

    return (
        <div className={`message ${isUser ? 'user' : 'bot'}`}>
            <p className="message-text">{text || 'No text provided'}</p>
            {fileData && (
                <>
                    {isImage ? (
                        <img
                            src={`data:${fileData.mime_type};base64,${fileData.base64}`}
                            alt={fileData.name}
                            className="image-attachment"
                        />
                    ) : (
                        <div className="file-attachment">
                            <span>Attached: {fileData.name}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ChatMessage;