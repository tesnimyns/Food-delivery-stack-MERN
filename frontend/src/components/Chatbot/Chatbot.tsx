import "./Chatbot.css";
import React, { useState } from 'react';
import axios from 'axios';

type Message = {
  sender: 'user' | 'bot';
  text: string;
};

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await axios.post<{ reply: string }>('http://localhost:4000/dialogflow', {
        message: input,
      });

      const botMessage: Message = { sender: 'bot', text: res.data.reply };
      setMessages(prev => [...prev, botMessage]);
      setInput('');
    } catch (error) {
      console.error('Erreur lors de l’envoi du message', error);
    }
  };

  return (
    <div className="chatbot">
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={msg.sender}>
            {msg.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Écris un message..."
      />
    </div>
  );
};

export default Chatbot;
