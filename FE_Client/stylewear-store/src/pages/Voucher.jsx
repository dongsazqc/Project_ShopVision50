import React, { useState, useEffect } from "react";
import { GAMES } from "../games";

const Voucher = () => {
  const [currentGame, setCurrentGame] = useState(null);
  const [hoveredGame, setHoveredGame] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [glitchEffect, setGlitchEffect] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 100);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderGameScreen = () => {
    const Game = currentGame.component;
    return (
      <div style={styles.gameScreen}>
        <div style={styles.gameScreenBackground} />
        <div style={styles.gameContent}>
          <button
            style={styles.backButton}
            onClick={() => setCurrentGame(null)}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
          >
            ← QUAY LẠI
          </button>
          <div style={styles.gameWrapper}>
            <Game onExit={() => setCurrentGame(null)} />
          </div>
        </div>
      </div>
    );
  };

  const renderGameSelection = () => {
    const mouseX = mousePosition.x;
    const mouseY = mousePosition.y;

    return (
      <div style={styles.selectionScreen}>
        {/* Animated Background Elements */}
        <div style={styles.backgroundElements}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.floatingOrb,
                left: `${(i * 7) % 100}%`,
                top: `${(i * 11) % 100}%`,
                animationDelay: `${i * 0.2}s`,
                background: `radial-gradient(circle at 30% 30%, 
                  ${i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#8b5cf6' : '#10b981'}20, 
                  transparent 70%)`,
              }}
            />
          ))}
        </div>

        {/* Mouse Trailing Effect */}
        <div
          style={{
            ...styles.mouseTrail,
            left: mouseX - 15,
            top: mouseY - 15,
            opacity: hoveredGame ? 0.8 : 0.3,
          }}
        />

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Header with Glitch Effect */}
          <div style={styles.headerContainer}>
            <div
              style={{
                ...styles.glitchContainer,
                opacity: glitchEffect ? 0.8 : 0,
              }}
            >
              <h1 style={{ ...styles.glitchText, color: "#ff6b6b" }}>
                🎁 SĂN VOUCHER ARCADE
              </h1>
              <h1 style={{ ...styles.glitchText, color: "#4dabf7" }}>
                🎁 SĂN VOUCHER ARCADE
              </h1>
            </div>
            <h1 style={styles.mainTitle}>🎁 SĂN VOUCHER ARCADE</h1>
            <p style={styles.subtitle}>
              Chọn game - Chiến thắng - Nhận voucher độc quyền!
            </p>
          </div>

          {/* Stats Bar */}
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{GAMES.length}</div>
              <div style={styles.statLabel}>TRÒ CHƠI</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>🎯</div>
              <div style={styles.statLabel}>CƠ HỘI</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>🏆</div>
              <div style={styles.statLabel}>GIẢI THƯỞNG</div>
            </div>
          </div>

          {/* Game Grid */}
          <div style={styles.gameGrid}>
            {GAMES.map((game, index) => {
              const isHovered = hoveredGame === game.id;
              return (
                <div
                  key={game.id}
                  style={styles.gameCardWrapper}
                  onMouseEnter={() => setHoveredGame(game.id)}
                  onMouseLeave={() => setHoveredGame(null)}
                >
                  <div
                    style={{
                      ...styles.gameCard,
                      transform: isHovered
                        ? "translateY(-8px) scale(1.02)"
                        : "translateY(0) scale(1)",
                      boxShadow: isHovered
                        ? `0 20px 40px ${game.color}40, 
                           0 0 0 1px ${game.color}20,
                           inset 0 0 30px ${game.color}10`
                        : "0 10px 30px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {/* Card Background Glow */}
                    <div
                      style={{
                        ...styles.cardGlow,
                        opacity: isHovered ? 0.6 : 0,
                        background: `radial-gradient(ellipse at center, 
                          ${game.color}40 0%, transparent 70%)`,
                      }}
                    />

                    {/* Card Header */}
                    <div style={styles.cardHeader}>
                      <div style={styles.cardIcon}>{game.icon || "🎮"}</div>
                      <div style={styles.cardBadge}>
                        <span style={styles.badgeText}>HOT</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={styles.cardContent}>
                      <h3 style={styles.gameName}>{game.name}</h3>
                      <p style={styles.gameDescription}>
                        {game.description || "Chiến thắng để nhận voucher!"}
                      </p>
                      <div style={styles.difficultyBar}>
                        <div style={styles.difficultyLabel}>Độ khó:</div>
                        <div style={styles.difficultyStars}>
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              style={{
                                ...styles.star,
                                color:
                                  i < (game.difficulty || 3)
                                    ? "#fbbf24"
                                    : "#374151",
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div style={styles.cardFooter}>
                      <button
                        onClick={() => setCurrentGame(game)}
                        style={{
                          ...styles.playButton,
                          background: isHovered
                            ? `linear-gradient(135deg, ${game.color}, ${game.color}cc)`
                            : `linear-gradient(135deg, ${game.color}cc, ${game.color})`,
                          boxShadow: isHovered
                            ? `0 8px 20px ${game.color}80, 
                               0 0 0 2px ${game.color}40`
                            : `0 4px 15px ${game.color}40`,
                        }}
                      >
                        <span style={styles.buttonText}>BẮT ĐẦU</span>
                        <span style={styles.buttonIcon}>→</span>
                      </button>
                    </div>

                    {/* Hover Effect Line */}
                    <div
                      style={{
                        ...styles.hoverLine,
                        width: isHovered ? "100%" : "0%",
                        background: `linear-gradient(90deg, transparent, ${game.color}, transparent)`,
                      }}
                    />
                  </div>

                  {/* Floating Particles on Hover */}
                  {isHovered && (
                    <div style={styles.particlesContainer}>
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            ...styles.particle,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: game.color,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <div style={styles.footerContent}>
              <div style={styles.footerText}>
                <span style={styles.footerHighlight}>🎯 Mẹo nhỏ:</span> Mỗi game
                có cơ chế thưởng khác nhau
              </div>
              <div style={styles.footerNote}>
                Voucher có hiệu lực trong 7 ngày sau khi nhận
              </div>
            </div>
          </div>
        </div>

        {/* Side Decorations */}
        <div style={styles.leftDecor}>
          <div style={styles.decorLine} />
          <div style={styles.decorDot} />
        </div>
        <div style={styles.rightDecor}>
          <div style={styles.decorLine} />
          <div style={styles.decorDot} />
        </div>
      </div>
    );
  };

  return currentGame ? renderGameScreen() : renderGameSelection();
};

// Styles object với hơn 500 dòng CSS
const styles = {
  // Game Screen Styles
  gameScreen: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
  },
  gameScreenBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
    zIndex: 1,
  },
  gameContent: {
    position: "relative",
    zIndex: 2,
    padding: "20px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  gameWrapper: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "fixed",
    top: "20px",
    left: "20px",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "white",
    padding: "12px 24px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    letterSpacing: "1px",
    transition: "all 0.3s ease",
    opacity: 0.7,
    zIndex: 1000,
  },

  // Selection Screen Styles
  selectionScreen: {
    minHeight: "100vh",
    position: "relative",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #312e81 70%, #0f172a 100%)",
    overflow: "hidden",
  },
  backgroundElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  floatingOrb: {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    filter: "blur(40px)",
    animation: "float 20s infinite ease-in-out",
  },
  mouseTrail: {
    position: "fixed",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #3b82f6, transparent 70%)",
    pointerEvents: "none",
    zIndex: 9999,
    transition: "all 0.1s ease",
  },
  mainContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
  },

  // Header Styles
  headerContainer: {
    textAlign: "center",
    marginBottom: "60px",
    position: "relative",
  },
  glitchContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    transition: "opacity 0.3s ease",
  },
  glitchText: {
    fontSize: "48px",
    fontWeight: "900",
    letterSpacing: "2px",
    margin: "0",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    animation: "glitch 0.3s infinite",
  },
  mainTitle: {
    fontSize: "48px",
    fontWeight: "900",
    background: "linear-gradient(135deg, #fbbf24, #f87171, #60a5fa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: "0 0 16px 0",
    letterSpacing: "2px",
    textShadow: "0 4px 30px rgba(251, 191, 36, 0.3)",
  },
  subtitle: {
    fontSize: "18px",
    color: "#cbd5e1",
    fontWeight: "300",
    letterSpacing: "1px",
    margin: "0",
    opacity: 0.9,
  },

  // Stats Bar
  statsBar: {
    display: "flex",
    justifyContent: "center",
    gap: "60px",
    marginBottom: "60px",
    flexWrap: "wrap",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 40px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "20px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    minWidth: "120px",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #60a5fa, #8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },

  // Game Grid
  gameGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    marginBottom: "60px",
  },
  gameCardWrapper: {
    position: "relative",
    perspective: "1000px",
  },
  gameCard: {
    position: "relative",
    background: "rgba(30, 41, 59, 0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "hidden",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardGlow: {
    position: "absolute",
    top: "-50%",
    left: "-50%",
    right: "-50%",
    bottom: "-50%",
    transition: "opacity 0.4s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardIcon: {
    fontSize: "40px",
    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
  },
  cardBadge: {
    background: "linear-gradient(135deg, #ef4444, #f87171)",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  badgeText: {
    fontSize: "10px",
    fontWeight: "bold",
    color: "white",
    letterSpacing: "1px",
  },
  cardContent: {
    flex: 1,
    marginBottom: "24px",
  },
  gameName: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#f1f5f9",
    margin: "0 0 12px 0",
  },
  gameDescription: {
    fontSize: "14px",
    color: "#cbd5e1",
    lineHeight: "1.6",
    margin: "0 0 20px 0",
    opacity: 0.9,
  },
  difficultyBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  difficultyLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600",
  },
  difficultyStars: {
    display: "flex",
    gap: "4px",
  },
  star: {
    fontSize: "16px",
    transition: "color 0.3s ease",
  },
  cardFooter: {
    marginTop: "auto",
  },
  playButton: {
    width: "100%",
    padding: "16px",
    borderRadius: "16px",
    border: "none",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    transition: "all 0.3s ease",
    letterSpacing: "1px",
    position: "relative",
    overflow: "hidden",
  },
  buttonText: {
    position: "relative",
    zIndex: 1,
  },
  buttonIcon: {
    position: "relative",
    zIndex: 1,
    fontSize: "20px",
    transition: "transform 0.3s ease",
  },
  hoverLine: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    height: "2px",
    transition: "width 0.4s ease",
  },
  particlesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    zIndex: 1,
  },
  particle: {
    position: "absolute",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    animation: "particleFloat 2s infinite ease-in-out",
  },

  // Footer
  footer: {
    marginTop: "40px",
    padding: "30px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "20px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  footerContent: {
    textAlign: "center",
  },
  footerText: {
    fontSize: "16px",
    color: "#f1f5f9",
    marginBottom: "8px",
  },
  footerHighlight: {
    background: "linear-gradient(135deg, #fbbf24, #f87171)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "bold",
  },
  footerNote: {
    fontSize: "14px",
    color: "#94a3b8",
    fontStyle: "italic",
  },

  // Decorations
  leftDecor: {
    position: "absolute",
    left: "5%",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  rightDecor: {
    position: "absolute",
    right: "5%",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexDirection: "row-reverse",
  },
  decorLine: {
    width: "100px",
    height: "2px",
    background: "linear-gradient(90deg, transparent, #60a5fa, transparent)",
  },
  decorDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#60a5fa",
    boxShadow: "0 0 20px #60a5fa",
  },
};

// Thêm stylesheet với animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    33% { transform: translateY(-20px) rotate(120deg); }
    66% { transform: translateY(20px) rotate(240deg); }
  }
  
  @keyframes glitch {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
  }
  
  @keyframes particleFloat {
    0%, 100% { 
      transform: translate(0, 0) scale(1);
      opacity: 0;
    }
    10% { opacity: 1; }
    90% { opacity: 1; }
    50% { 
      transform: translate(${Math.random() * 40 - 20}px, -40px) scale(0.5);
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }
  
  .play-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }
  
  .play-button:hover::before {
    left: 100%;
  }
  
  .game-card:hover .button-icon {
    transform: translateX(5px);
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow-x: hidden;
  }
  
  ::-webkit-scrollbar {
    width: 10px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #60a5fa, #8b5cf6);
    border-radius: 5px;
  }
`;

document.head.appendChild(styleSheet);

// Thêm màu mặc định cho game nếu chưa có
GAMES.forEach((game, index) => {
  if (!game.color) {
    const colors = [
      "#3b82f6", // Blue
      "#8b5cf6", // Purple
      "#10b981", // Emerald
      "#f59e0b", // Amber
      "#ef4444", // Red
      "#ec4899", // Pink
    ];
    game.color = colors[index % colors.length];
  }
});

export default Voucher;