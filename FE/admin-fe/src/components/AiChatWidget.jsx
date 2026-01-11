import { useState, useRef, useEffect } from "react";

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Tự động scroll xuống khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

async function sendMessage() {
  if (!input.trim() || isStreaming) return;

  const userText = input;
  setInput("");
  setIsStreaming(true);

  setMessages((m) => [...m, { role: "user", content: userText }]);
  setMessages((m) => [...m, { role: "assistant", content: "", isLoading: true }]);

  try {
    const res = await fetch("https://sazqc.my/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: userText }],
        stream: true,
      }),
    });

    if (!res.body) {
      console.error("No response body stream");
      setIsStreaming(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let aiText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      chunk.split("\n").forEach((line) => {
        if (!line.trim()) return;

        if (line.startsWith("data: ")) {
          line = line.slice(6);
        }

        if (line === "[DONE]") {
          return;
        }

        try {
          const json = JSON.parse(line);
          const delta =
            json.choices?.[0]?.delta?.content ||
            json.choices?.[0]?.message?.content;

          if (delta) {
            aiText += delta;

            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = {
                role: "assistant",
                content: aiText,
                isLoading: false,
              };
              return copy;
            });
          }
        } catch {
          // ignore lines can't parse
        }
      });
    }

    // Lấy userId từ localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.userId || storedUser?.UserId || null;

    if (!userId) {
      console.warn("Không tìm thấy userId trong localStorage, không gửi được câu hỏi.");
      setIsStreaming(false);
      return;
    }

    await fetch("http://160.250.5.26:5000/api/ChatAi/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        UserId: userId.toString(),
        CauHoi: userText,
        Cautraloi: aiText,
      }),
    });
  } catch (err) {
    console.error("Fetch error:", err);
    setMessages((m) => {
      const copy = [...m];
      copy[copy.length - 1] = {
        role: "assistant",
        content: "Đã xảy ra lỗi khi kết nối. Vui lòng thử lại!",
        isLoading: false,
      };
      return copy;
    });
  } finally {
    setIsStreaming(false);
  }
}


  function resetChat() {
    setMessages([]);
    setInput("");
  }

  return (
    <>
      {/* Nút chat với hiệu ứng phát sáng và animation */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          backgroundSize: "200% 200%",
          boxShadow: `
            0 0 20px rgba(102, 126, 234, 0.8),
            0 4px 20px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 99999,
          fontSize: 32,
          userSelect: "none",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          animation: "pulse 2s infinite",
          border: "2px solid rgba(255, 255, 255, 0.15)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.15) rotate(5deg)";
          e.currentTarget.style.boxShadow = "0 0 30px rgba(102, 126, 234, 1), 0 8px 25px rgba(0, 0, 0, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1) rotate(0deg)";
          e.currentTarget.style.boxShadow = `
            0 0 20px rgba(102, 126, 234, 0.8),
            0 4px 20px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `;
        }}
        title={open ? "Đóng chat" : "Mở chat"}
      >
        <div style={{
          animation: "float 3s ease-in-out infinite",
          textShadow: "0 2px 10px rgba(255, 255, 255, 0.3)"
        }}>
          🤖
        </div>
      </div>

      {/* Khung chat với glassmorphism và shadow đẹp */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 120,
            right: 30,
            width: 420,
            height: 580,
            background: "rgba(25, 25, 40, 0.95)",
            backdropFilter: "blur(12px)",
            borderRadius: "24px",
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.4),
              0 8px 32px rgba(103, 78, 245, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            display: "flex",
            flexDirection: "column",
            zIndex: 99999,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            color: "#eee",
            overflow: "hidden",
            animation: "slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Header gradient với blur */}
          <div
            style={{
              padding: "18px 24px",
              background: "linear-gradient(90deg, rgba(103, 78, 245, 0.2), rgba(102, 126, 234, 0.2))",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                boxShadow: "0 0 8px rgba(102, 126, 234, 0.6)",
                animation: "blink 2s infinite"
              }} />
              <span style={{
                fontWeight: "700",
                fontSize: "18px",
                background: "linear-gradient(135deg, #667eea, #f093fb)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}>
                AI Saz
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={resetChat}
                style={{
                  padding: "8px 16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backdropFilter: "blur(5px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                title="Xóa sạch chat"
              >
                <span>🔄</span> Reset
              </button>

              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: "8px 16px",
                  background: "rgba(255, 95, 95, 0.2)",
                  border: "1px solid rgba(255, 95, 95, 0.3)",
                  borderRadius: "12px",
                  color: "#ff6b6b",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backdropFilter: "blur(5px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 95, 95, 0.3)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 95, 95, 0.2)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                title="Đóng chat"
              >
                <span>✕</span> Close
              </button>
            </div>
          </div>

          {/* Nội dung chat với gradient scroll */}
          <div
            style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              fontSize: "15px",
              lineHeight: "1.6",
              background: `
                linear-gradient(rgba(25, 25, 40, 0.8), rgba(25, 25, 40, 0.8)),
                linear-gradient(to bottom, transparent 95%, rgba(103, 78, 245, 0.1) 100%)
              `,
              maskImage: "linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)",
            }}
            className="chat-messages"
          >
            {messages.length === 0 ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "rgba(255, 255, 255, 0.5)",
                textAlign: "center",
                padding: "40px 20px",
              }}>
                <div style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                  opacity: 0.5,
                  animation: "float 3s ease-in-out infinite"
                }}>
                  ✨
                </div>
                <div style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  background: "linear-gradient(135deg, #667eea, #f093fb)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}>
                  Chào mày! T có thể giúp gì cho m?
                </div>
                <div style={{ fontSize: "14px", opacity: 0.7 }}>
                  Hãy bắt đầu cuộc trò chuyện bằng cách nhập câu hỏi...
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: "16px",
                    opacity: m.isLoading ? 0.7 : 1,
                    transition: "opacity 0.2s ease",
                    animation: m.role === "user" ? 
                      "slideInRight 0.3s ease" : 
                      m.role === "assistant" && m.isLoading ? 
                      "pulseBg 1.5s infinite" : 
                      "slideInLeft 0.3s ease"
                  }}
                >
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: m.role === "user" ? "flex-end" : "flex-start",
                    gap: "6px",
                  }}>
                    <div style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.5)",
                      padding: "0 12px",
                      fontWeight: "500",
                    }}>
                      {m.role === "user" ? "Bạn" : "AI Saz"}
                    </div>
                    <div
                      style={{
                        maxWidth: "80%",
                        padding: m.isLoading ? "12px 20px" : "12px 18px",
                        borderRadius: m.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                        background: m.role === "user" ? 
                          "linear-gradient(135deg, #667eea, #764ba2)" : 
                          m.isLoading ?
                          "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))" :
                          "rgba(255, 255, 255, 0.08)",
                        color: m.role === "user" ? "#fff" : "rgba(255, 255, 255, 0.9)",
                        border: m.role === "user" ? 
                          "none" : 
                          m.isLoading ? 
                          "1px solid rgba(255, 255, 255, 0.05)" :
                          "1px solid rgba(255, 255, 255, 0.05)",
                        boxShadow: m.role === "user" ? 
                          "0 4px 12px rgba(102, 126, 234, 0.3)" : 
                          m.isLoading ? 
                          "inset 0 0 20px rgba(255, 255, 255, 0.05)" :
                          "0 2px 8px rgba(0, 0, 0, 0.2)",
                        position: "relative",
                        overflow: "hidden",
                        backdropFilter: "blur(5px)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.isLoading ? (
                        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                          <div style={{ animation: "bounce 1.4s infinite", animationDelay: "0s" }}>•</div>
                          <div style={{ animation: "bounce 1.4s infinite", animationDelay: "0.2s" }}>•</div>
                          <div style={{ animation: "bounce 1.4s infinite", animationDelay: "0.4s" }}>•</div>
                        </div>
                      ) : (
                        m.content
                      )}
                      {m.role === "user" && (
                        <div style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: "20px",
                          height: "20px",
                          background: "rgba(255, 255, 255, 0.1)",
                          borderBottomLeftRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                        }}>
                          👤
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập với hiệu ứng focus đẹp */}
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              background: "rgba(20, 20, 35, 0.8)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Nhập tin nhắn..."
                disabled={isStreaming}
                style={{
                  width: "100%",
                  padding: "14px 20px 14px 48px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  fontSize: "15px",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                  outline: "none",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(5px)",
                  boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.2)",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(102, 126, 234, 0.5)";
                  e.target.style.boxShadow = "0 0 20px rgba(102, 126, 234, 0.2), inset 0 2px 10px rgba(0, 0, 0, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255, 255, 255, 0.1)";
                  e.target.style.boxShadow = "inset 0 2px 10px rgba(0, 0, 0, 0.2)";
                }}
                autoFocus
              />
              <div style={{
                position: "absolute",
                left: "18px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "18px",
              }}>
                💬
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              style={{
                padding: "14px 20px",
                borderRadius: "18px",
                border: "none",
                fontSize: "16px",
                fontWeight: "600",
                cursor: input.trim() && !isStreaming ? "pointer" : "not-allowed",
                transition: "all 0.3s ease",
                background: input.trim() && !isStreaming ?
                  "linear-gradient(135deg, #667eea, #764ba2)" :
                  "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: input.trim() && !isStreaming ?
                  "0 4px 15px rgba(102, 126, 234, 0.4)" :
                  "none",
                opacity: input.trim() && !isStreaming ? 1 : 0.6,
              }}
              onMouseEnter={(e) => {
                if (input.trim() && !isStreaming) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (input.trim() && !isStreaming) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                }
              }}
            >
              {isStreaming ? (
                <>
                  <div style={{ animation: "spin 1s linear infinite" }}>⟳</div>
                  Đang gửi...
                </>
              ) : (
                <>
                  <span>🚀</span> Gửi
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.8), 0 4px 20px rgba(0, 0, 0, 0.3); }
          50% { box-shadow: 0 0 30px rgba(102, 126, 234, 1), 0 8px 25px rgba(0, 0, 0, 0.4); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideInRight {
          from { 
            opacity: 0;
            transform: translateX(20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInLeft {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulseBg {
          0%, 100% { background: rgba(255, 255, 255, 0.05); }
          50% { background: rgba(255, 255, 255, 0.1); }
        }
        
        /* Scrollbar đẹp */
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }
        
        .chat-messages::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        
        .chat-messages::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #667eea, #764ba2);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #764ba2, #667eea);
        }
        
        /* Hiệu ứng glow cho toàn bộ component */
        * {
          box-sizing: border-box;
        }
        
        ::selection {
          background: rgba(102, 126, 234, 0.3);
          color: white;
        }
        
        /* Tối ưu hiển thị trên mobile */
        @media (max-width: 480px) {
          .chat-messages::-webkit-scrollbar {
            width: 4px;
          }
        }
      `}</style>
    </>
  );
}