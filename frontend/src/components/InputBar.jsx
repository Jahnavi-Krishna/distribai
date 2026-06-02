import { useState } from "react";

export default function InputBar({ onSend, disabled }) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="input-bar">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Ask about products, pricing, or request a quote..."
        disabled={disabled}
      />
      <button onClick={handleSubmit} disabled={disabled || !input.trim()}>
        Send
      </button>
    </div>
  );
}
