import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "system", content: "I am here to assist non-designers in understanding and creating design work. You can upload an image of a design you're working on, and I will describe and analyze it for you." },
  ]);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [imageUrlDisabled, setImageUrlDisabled] = useState(false);
  const [buttonsClicked, setButtonsClicked] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const sendMessage = async (messageToSend) => {
    const newUserChat = { role: "user", content: messageToSend ,imageUrl:imageUrl };
    
    // // If it's the first user message and there's an imageUrl, include it
    // if (chatHistory.length === 1 && imageUrl.trim() !== "") {
    //   newUserChat.imageUrl = imageUrl;
    // }
  
    setChatHistory((prev) => [...prev, newUserChat]);
  
    const response = await fetch("/api/generate?endpoint=chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: messageToSend, imageUrl }),
    });
  
    const data = await response.json();
    if (data.success) {
      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        { role: "assistant", content: data.response },
      ]);
    }
  };

  const clearChat = () => {
    setChatHistory([{ role: "system", content: "You are a helpful assistant." }]);
    setMessage("");
    setImageUrl("");
    setShowMessageInput(false);
    setImageUrlDisabled(false);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!message.trim() && !imageUrl.trim()) return;
    sendMessage(message.trim());
    setMessage("");
  };

  const handleButtonClick = (messageToSend) => {
    setShowMessageInput(true);
    sendMessage(messageToSend);
    setImageUrlDisabled(true); // Hide the image URL input field
    setButtonsClicked(true); // Set buttonsClicked to true when either button is clicked
  };

  const sendSpecificMessage = (specificMessage) => {
    sendMessage(specificMessage);
  };

  return (
    <div>
      <Head>
        <title>OpenAI Chat</title>
      </Head>
      <h1 className={styles.heading1}>DentsuCreative AI assistant</h1>
      <div className={styles.chatContainer} ref={chatContainerRef}>
        {chatHistory.map((chat, index) => (
          <div key={index} className={chat.role === "user" ? styles.userMessage : styles.assistantMessage}>
            <p>{chat.content}</p>
            {chat.imageUrl && (
              <img src={chat.imageUrl} alt="User provided content" className={styles.chatImage} />
            )}
          </div>
        ))}
      </div>

      <div className={styles.messageInputContainer}>
        {showMessageInput && (
          <form onSubmit={onSubmit}>
            <textarea
              className={styles.textarea}
              name="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <div className={styles.buttonGroup}>
              <input
                className={styles.inputSubmit}
                type="submit"
                value="Send"
              />
              <button
                className={styles.inputButton}
                type="button"
                onClick={clearChat}
              >
                Clear
              </button>
            </div>
          </form>
        )}
        <div className={styles.buttonGroup}>
          {!buttonsClicked && (
            <>
              <button
                className={styles.inputSubmit}
                onClick={() => handleButtonClick("Describe this image in Design Terms")}
              >
                Describe
              </button>
              <button
                className={styles.inputSubmit}
                onClick={() => handleButtonClick("Describe this image in Design Terms")}
              >
                Analyze
              </button>
            </>
          )}
          {buttonsClicked && (
            <>
              <button
                className={styles.inputSubmit}
                onClick={() => sendSpecificMessage("Does the colors has consistency ?")}
              >
                consistency
              </button>
              <button
                className={styles.inputSubmit}
                onClick={() => sendSpecificMessage("is there a logo in the image ?")}
              >
                logo
              </button>
              <button
                className={styles.inputSubmit}
                onClick={() => sendSpecificMessage("Analyze this image color Balance")}
              >
                Balance
              </button>
              <button
                className={styles.inputSubmit}
                onClick={() => sendSpecificMessage("Analyze this image Authenticity")}
              >
                Authenticity
              </button>
              <button
                className={styles.inputSubmit}
                onClick={() => sendSpecificMessage("Analyze this image Likeness")}
              >
                Likeness
              </button>
            </>
          )}
        </div>
        {!imageUrlDisabled && ( // Conditionally render the input field based on imageUrlDisabled state
          <input
            className={styles.textInput}
            type="text"
            placeholder="Enter image URL..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
