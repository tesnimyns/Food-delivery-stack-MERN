import React, { useState } from 'react';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (input.trim() === "") return;

    // Ajouter message utilisateur
    const updatedMessages = [...messages, { text: input, sender: "user" }];
    setMessages(updatedMessages);
    setInput("");

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botResponse = data.response || "Pas de réponse du bot.";

      // Ajouter réponse du bot
      setMessages([...updatedMessages, { text: botResponse, sender: "bot" }]);
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      setMessages([
        ...updatedMessages,
        { text: "Erreur de communication avec le serveur.", sender: "bot" },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={{
      width: "400px",
      margin: "40px auto",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ textAlign: "center" }}>🤖 Chatbot</h2>
      <div style={{
        border: "1px solid #ccc",
        padding: "10px",
        minHeight: "200px",
        marginBottom: "10px",
        maxHeight: "300px",
        overflowY: "auto",
        backgroundColor: "#f9f9f9"
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            textAlign: msg.sender === "user" ? "right" : "left",
            margin: "5px 0"
          }}>
            <strong>{msg.sender === "user" ? "Vous" : "Bot"}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Entrez un message..."
        style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
      />
      <button
        onClick={sendMessage}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px"
        }}
      >
        Envoyer
      </button>
    </div>
  );
}

export default ChatBot;
