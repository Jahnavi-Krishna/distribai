const SUGGESTIONS = [
  "What pumps do you carry?",
  "Show me items in stock",
  "Compare two products",
  "Draft a quote for a customer",
];

function parseContent(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="highlight-price">{part}</strong>
    ) : part
  );
}

export default function MessageBubble({ message, isLast, onSend }) {
  const showSuggestions = message.role === "assistant" && isLast;

  return (
    <div className={`message ${message.role}`}>
      <div className="bubble">
        <p>{parseContent(message.content)}</p>
        {message.sources?.length > 0 && (
          <p className="sources-line">
            {message.sources.join(" · ")}
          </p>
        )}
      </div>
      {showSuggestions && (
        <div className="suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              className="suggestion-chip"
              onClick={() => onSend(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
