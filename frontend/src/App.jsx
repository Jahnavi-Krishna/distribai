import { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import InputBar from "./components/InputBar";
import BackgroundCanvas from "./components/BackgroundCanvas";
import { sendMessageStream } from "./api";
import "./App.css";

function BotIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="8" width="20" height="13" rx="4" fill="rgba(255,255,255,0.12)" stroke="white" strokeWidth="1.5"/>
      <circle cx="9" cy="15" r="2" fill="white"/>
      <circle cx="15" cy="15" r="2" fill="white"/>
      <line x1="12" y1="8" x2="12" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="3" r="1.5" fill="white"/>
      <line x1="2" y1="12" x2="0" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="22" y1="12" x2="24" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const WELCOME = {
  role: "assistant",
  content: `Welcome to Nexus — your AI sales assistant for industrial equipment.

I can help you find the right product for any application, check specs and availability, compare options, or draft a professional quote for any customer.

What are you looking for today?`,
};

export default function App() {
  const [messages, setMessages] = useState([WELCOME]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (text) => {
    const userMessage = { role: "user", content: text };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setLoading(true);

    const history = updated.slice(1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let isFirstChunk = true;

    try {
      await sendMessageStream(
        text,
        history,
        (chunk) => {
          if (isFirstChunk) {
            // First word arrives — show the message, hide loading dots
            isFirstChunk = false;
            setLoading(false);
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: chunk, sources: [] },
            ]);
          } else {
            // Append each subsequent word to the last message
            setMessages((prev) => {
              const rest = prev.slice(0, -1);
              const last = prev[prev.length - 1];
              return [...rest, { ...last, content: last.content + chunk }];
            });
          }
        },
        (sources) => {
          // Attach sources when streaming is done
          setMessages((prev) => {
            const rest = prev.slice(0, -1);
            const last = prev[prev.length - 1];
            return [...rest, { ...last, sources }];
          });
        }
      );
    } catch {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackgroundCanvas />
      <div className="app">
        <header className="app-header">
          <div className="header-icon"><BotIcon /></div>
          <div className="header-text">
            <h1>Nexus</h1>
            <p>Ask about products · Compare specs · Request a quote</p>
          </div>
          <div className="status-badge">Online</div>
        </header>
        <ChatWindow messages={messages} loading={loading} onSend={handleSend} />
        <InputBar onSend={handleSend} disabled={loading} />
      </div>
    </>
  );
}
