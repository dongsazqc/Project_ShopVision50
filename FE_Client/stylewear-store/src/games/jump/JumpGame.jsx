import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { message } from "antd";
import { CONFIG } from "./engine";
import "./style.css";

// Constants
const VOUCHER_MILESTONES = {
  500: 10,
  1000: 50,
  2000: 100
};

// Component chính
export default function JumpGame({ onExit }) {
  const [gameState, setGameState] = useState({
    playerY: 0,
    obstacles: [],
    score: 0,
    isDead: false,
    voucherMsg: ""
  });

  // Refs để tránh re-render không cần thiết
  const velocity = useRef(0);
  const jumping = useRef(false);
  const lastObstacleTime = useRef(0);
  const rafRef = useRef(null);
  const lastScoreProcessed = useRef(0);

  // Memoized values
  const userId = useMemo(() => localStorage.getItem("userId"), []);
  const token = useMemo(() => localStorage.getItem("token"), []);

  const axiosAuth = useMemo(() => {
    return axios.create({
      baseURL: "http://160.250.5.26:5000/api",
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
  }, [token]);

  // Hàm tạo mã voucher
  const generateRandomCode = useCallback(() => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }, []);

  // Hàm tạo voucher với xử lý lỗi tốt hơn
  const createVoucher = useCallback(async (discountPercent) => {
    if (!userId) {
      console.warn("Chưa đăng nhập, không thể tạo voucher");
      return;
    }

    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const voucherCode = `JUMPGAME_${generateRandomCode()}`;

    const voucherData = {
      code: voucherCode,
      discountType: "PERCENT",
      discountValue: discountPercent,
      condition: "500000",
      scope: "USER",
      startDate,
      endDate,
      status: true,
    };

    try {
      await axiosAuth.post(`/KhuyenMai/users/${userId}/promotions`, voucherData);
      
      setGameState(prev => ({
        ...prev,
        voucherMsg: `🎉 Bạn nhận được voucher ${voucherCode} giảm ${discountPercent}%!`
      }));

      // Tự động ẩn thông báo sau 4 giây
      setTimeout(() => {
        setGameState(prev => ({ ...prev, voucherMsg: "" }));
      }, 4000);

      message.success("Nhận voucher thành công!");
    } catch (error) {
      console.error("Lỗi tạo voucher:", error);
      message.error("Không thể tạo voucher. Vui lòng thử lại!");
    }
  }, [userId, axiosAuth, generateRandomCode]);

  // Xử lý va chạm
  const checkCollision = useCallback((obstacleX, playerY) => {
    return obstacleX < 140 && obstacleX > 80 && playerY < 50;
  }, []);

  // Xử lý input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && !jumping.current && !gameState.isDead) {
        e.preventDefault(); // Ngăn scroll trang khi nhấn space
        velocity.current = CONFIG.JUMP;
        jumping.current = true;
      }
    };

    // Thêm touch support cho mobile
    const handleTouchStart = () => {
      if (!jumping.current && !gameState.isDead) {
        velocity.current = CONFIG.JUMP;
        jumping.current = true;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [gameState.isDead]);

  // Game loop tối ưu
  useEffect(() => {
    if (gameState.isDead) return;

    const gameLoop = (timestamp) => {
      // Update physics
      velocity.current += CONFIG.GRAVITY;

      setGameState(prev => {
        // Tính toán vị trí mới của player
        const nextY = Math.max(0, Math.min(prev.playerY + velocity.current, CONFIG.MAX_HEIGHT));
        
        // Reset khi chạm đất
        if (nextY <= 0) {
          velocity.current = 0;
          jumping.current = false;
        }

        // Update obstacles
        const updatedObstacles = prev.obstacles
          .map(obstacle => ({
            ...obstacle,
            x: obstacle.x - CONFIG.SPEED
          }))
          .filter(obstacle => obstacle.x > -50);

        // Tạo obstacle mới với điều kiện
        const shouldCreateObstacle = Math.random() < 0.02 && 
          timestamp - lastObstacleTime.current > 500; // Giới hạn 500ms giữa các obstacle

        if (shouldCreateObstacle) {
          updatedObstacles.push({ x: CONFIG.WIDTH, id: Date.now() + Math.random() });
          lastObstacleTime.current = timestamp;
        }

        // Kiểm tra va chạm
        let isDead = prev.isDead;
        updatedObstacles.forEach(obstacle => {
          if (checkCollision(obstacle.x, nextY)) {
            isDead = true;
          }
        });

        // Tính điểm
        const newScore = prev.score + 1;
        
        // Kiểm tra milestone cho voucher
        if (!prev.voucherMsg && VOUCHER_MILESTONES[newScore] && newScore !== lastScoreProcessed.current) {
          createVoucher(VOUCHER_MILESTONES[newScore]);
          lastScoreProcessed.current = newScore;
        }

        return {
          ...prev,
          playerY: nextY,
          obstacles: updatedObstacles,
          score: newScore,
          isDead
        };
      });

      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [gameState.isDead, checkCollision, createVoucher]);

  // Restart game
  const restartGame = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    velocity.current = 0;
    jumping.current = false;
    lastObstacleTime.current = 0;
    lastScoreProcessed.current = 0;

    setGameState({
      playerY: 0,
      obstacles: [],
      score: 0,
      isDead: false,
      voucherMsg: ""
    });

    // Khởi động lại game loop
    rafRef.current = requestAnimationFrame(() => {});
  }, []);

  // Xử lý exit game
  const handleExit = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    onExit?.();
  }, [onExit]);

  // Hiệu ứng mượt mà với CSS transform
  const playerStyle = useMemo(() => ({
    transform: `translateY(-${gameState.playerY}px)`,
    transition: gameState.playerY > 0 ? 'transform 0.1s linear' : 'none'
  }), [gameState.playerY]);

  return (
    <div className="game-wrapper">
      <div className="game-container">
        <div className="game-screen">
          {/* Player */}
          <div className="player" style={playerStyle} />
          
          {/* Obstacles */}
          {gameState.obstacles.map((obstacle) => (
            <div
              key={obstacle.id || obstacle.x}
              className="obstacle"
              style={{ transform: `translateX(${obstacle.x}px)` }}
            />
          ))}
          
          {/* Game Over Overlay */}
          {gameState.isDead && (
            <div className="game-overlay">
              <div className="game-over-content">
                <h2>💀 Game Over!</h2>
                <div className="score-display">
                  <div className="final-score">Điểm: {gameState.score}</div>
                  <div className="score-rank">
                    {gameState.score >= 2000 ? "🎖️ Xuất sắc!" : 
                     gameState.score >= 1000 ? "🏅 Giỏi!" : 
                     gameState.score >= 500 ? "🎯 Khá!" : "💪 Cố gắng hơn!"}
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button 
                    className="btn-restart" 
                    onClick={restartGame}
                    autoFocus
                  >
                    🔁 Chơi lại
                  </button>
                  <button 
                    className="btn-exit" 
                    onClick={handleExit}
                  >
                    ⬅ Về Arcade
                  </button>
                </div>
                
                {gameState.voucherMsg && (
                  <div className="voucher-notification">
                    {gameState.voucherMsg}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* HUD Panel */}
        <div className="hud-panel">
          <div className="score-board">
            <span className="score-icon">🎯</span>
            <span className="score-value">{gameState.score}</span>
          </div>
          
          <div className="controls-info">
            <div className="control-item">
              <kbd>SPACE</kbd>
              <span>hoặc</span>
              <kbd>TAP</kbd>
              <span>để nhảy</span>
            </div>
            <div className="control-item">
              <span>🚧 Tránh chướng ngại vật</span>
            </div>
          </div>
          
          {/* Voucher Notification */}
          {gameState.voucherMsg && !gameState.isDead && (
            <div className="voucher-alert">
              <div className="voucher-icon">🎁</div>
              <div className="voucher-text">{gameState.voucherMsg}</div>
            </div>
          )}
          
          {/* Milestones Progress */}
          <div className="milestones">
            {Object.keys(VOUCHER_MILESTONES).map(milestone => (
              <div 
                key={milestone} 
                className={`milestone ${gameState.score >= parseInt(milestone) ? 'achieved' : ''}`}
              >
                <span>{milestone}pts</span>
                <span>🎁 {VOUCHER_MILESTONES[milestone]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}