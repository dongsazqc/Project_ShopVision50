import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { message } from "antd";
import "./flappy.css";

const CONFIG = {
  WIDTH: 400,
  HEIGHT: 600,
  GRAVITY: 0.6,
  JUMP_FORCE: -10,
  PIPE_SPEED: 4,
  PIPE_WIDTH: 60,
  PIPE_GAP: 150,
  PIPE_INTERVAL: 1500,
  BIRD_SIZE: 30,
  BIRD_X: 80,
  GROUND_HEIGHT: 20,
};

const VOUCHER_MILESTONES = {
  10: 10,   // 10 cột - voucher 10%
  30: 50,   // 30 cột - voucher 50%
  100: 100, // 100 cột - voucher 100%
};

export default function FlappyGame({ onExit }) {
  const [gameState, setGameState] = useState({
    birdY: CONFIG.HEIGHT / 2,
    pipes: [],
    score: 0,
    highScore: parseInt(localStorage.getItem("flappyHighScore") || "0"),
    gameOver: false,
    isPaused: false,
    voucherMsg: "",
  });

  const claimedVouchers = useRef(new Set());
  const velocity = useRef(0);
  const rafRef = useRef(null);
  const pipeTimer = useRef(null);
  const lastPipeId = useRef(0);

  // Tạo instance axios với token auth
  const axiosAuth = useMemo(() => {
    const token = localStorage.getItem("token");
    return axios.create({
      baseURL: "http://160.250.5.26:5000/api",
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
  }, []);

  // Tạo code voucher random
  const generateVoucherCode = () => {
    return `FLAPPY_${Math.floor(100000 + Math.random() * 900000)}`;
  };

  // Hàm gọi API tạo voucher
  const createVoucher = useCallback(
    async (discountPercent) => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        message.error("Chưa đăng nhập, không thể tạo voucher");
        return;
      }

      const now = new Date();
      const startDate = now.toISOString();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const voucherCode = generateVoucherCode();

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

        setGameState((prev) => ({
          ...prev,
          voucherMsg: `🎉 Bạn nhận được voucher ${voucherCode} giảm ${discountPercent}%!`,
        }));

        // Ẩn message sau 4 giây
        setTimeout(() => {
          setGameState((prev) => ({ ...prev, voucherMsg: "" }));
        }, 4000);

        message.success("Nhận voucher thành công!");
      } catch (error) {
        console.error("Lỗi tạo voucher:", error);
        message.error("Không thể tạo voucher. Vui lòng thử lại!");
      }
    },
    [axiosAuth]
  );

  // Xử lý nhảy
  const handleJump = useCallback(() => {
    if (!gameState.gameOver && !gameState.isPaused) {
      velocity.current = CONFIG.JUMP_FORCE;
    }
  }, [gameState.gameOver, gameState.isPaused]);

  // Lắng nghe input bàn phím, click
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        handleJump();
      }
      if (e.code === "KeyP" || e.code === "Escape") {
        e.preventDefault();
        setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
      }
      if (e.code === "KeyR" && gameState.gameOver) {
        restart();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("click", handleJump);
    window.addEventListener("touchstart", handleJump);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", handleJump);
      window.removeEventListener("touchstart", handleJump);
      clearInterval(pipeTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleJump, gameState.gameOver, gameState.isPaused]);

  // Tạo ống cống (pipe) theo thời gian
  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused) return;

    pipeTimer.current = setInterval(() => {
      const minHeight = 50;
      const maxHeight = CONFIG.HEIGHT - CONFIG.PIPE_GAP - minHeight - CONFIG.GROUND_HEIGHT;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);

      setGameState((prev) => ({
        ...prev,
        pipes: [
          ...prev.pipes,
          {
            id: ++lastPipeId.current,
            x: CONFIG.WIDTH,
            topHeight,
            scored: false,
          },
        ],
      }));
    }, CONFIG.PIPE_INTERVAL);

    return () => clearInterval(pipeTimer.current);
  }, [gameState.gameOver, gameState.isPaused]);

  // Kiểm tra va chạm
  const checkCollision = useCallback((birdY, pipe) => {
    const birdBox = {
      left: CONFIG.BIRD_X,
      right: CONFIG.BIRD_X + CONFIG.BIRD_SIZE,
      top: birdY,
      bottom: birdY + CONFIG.BIRD_SIZE,
    };

    const topPipeBox = {
      left: pipe.x,
      right: pipe.x + CONFIG.PIPE_WIDTH,
      top: 0,
      bottom: pipe.topHeight,
    };

    const bottomPipeBox = {
      left: pipe.x,
      right: pipe.x + CONFIG.PIPE_WIDTH,
      top: pipe.topHeight + CONFIG.PIPE_GAP,
      bottom: CONFIG.HEIGHT,
    };

    const groundBox = {
      left: 0,
      right: CONFIG.WIDTH,
      top: CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT,
      bottom: CONFIG.HEIGHT,
    };

    const isColliding = (a, b) =>
      !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);

    return isColliding(birdBox, topPipeBox) || isColliding(birdBox, bottomPipeBox) || isColliding(birdBox, groundBox);
  }, []);

  // Vòng game chính
  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused) return;

    const gameLoop = () => {
      velocity.current += CONFIG.GRAVITY;

      setGameState((prev) => {
        const newBirdY = Math.max(0, prev.birdY + velocity.current);

        if (newBirdY > CONFIG.HEIGHT - CONFIG.BIRD_SIZE - CONFIG.GROUND_HEIGHT) {
          handleGameOver(prev.score);
          return { ...prev, gameOver: true };
        }

        const updatedPipes = prev.pipes
          .map((pipe) => ({ ...pipe, x: pipe.x - CONFIG.PIPE_SPEED }))
          .filter((pipe) => pipe.x + CONFIG.PIPE_WIDTH > 0);

        let newScore = prev.score;
        let isGameOver = false;

        updatedPipes.forEach((pipe) => {
          if (checkCollision(newBirdY, pipe)) {
            isGameOver = true;
          }
          // Tăng điểm khi vượt ống cống
          if (!pipe.scored && pipe.x + CONFIG.PIPE_WIDTH < CONFIG.BIRD_X) {
            newScore++;
            pipe.scored = true;

            // Check milestone voucher
            if (VOUCHER_MILESTONES[newScore] && !claimedVouchers.current.has(newScore)) {
              createVoucher(VOUCHER_MILESTONES[newScore]);
              claimedVouchers.current.add(newScore);
              setGameState((prev) => ({
                ...prev,
                voucherMsg: `🎉 Bạn nhận được voucher giảm ${VOUCHER_MILESTONES[newScore]}%!`,
              }));
            }
          }
        });

        if (isGameOver) {
          handleGameOver(newScore);
          return { ...prev, gameOver: true };
        }

        // Update điểm cao nhất
        let newHighScore = prev.highScore;
        if (newScore > newHighScore) {
          newHighScore = newScore;
          localStorage.setItem("flappyHighScore", newScore.toString());
        }

        return {
          ...prev,
          birdY: newBirdY,
          pipes: updatedPipes,
          score: newScore,
          highScore: newHighScore,
        };
      });

      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState.gameOver, gameState.isPaused, checkCollision, createVoucher]);

  const handleGameOver = useCallback((finalScore) => {
    clearInterval(pipeTimer.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // Cập nhật điểm cao nhất (nếu cần)
    const currentHighScore = parseInt(localStorage.getItem("flappyHighScore") || "0");
    if (finalScore > currentHighScore) {
      localStorage.setItem("flappyHighScore", finalScore.toString());
    }
  }, []);

  const restart = useCallback(() => {
    clearInterval(pipeTimer.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    velocity.current = 0;
    claimedVouchers.current.clear();
    lastPipeId.current = 0;

    setGameState({
      birdY: CONFIG.HEIGHT / 2,
      pipes: [],
      score: 0,
      highScore: parseInt(localStorage.getItem("flappyHighScore") || "0"),
      gameOver: false,
      isPaused: false,
      voucherMsg: "",
    });
  }, []);

  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const handleExit = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (pipeTimer.current) clearInterval(pipeTimer.current);
    onExit?.();
  }, [onExit]);

  // Tính góc nghiêng chim dựa vào velocity
  const birdRotation = useMemo(() => {
    const rotation = Math.min(Math.max(velocity.current * 5, -30), 90);
    return rotation;
  }, [velocity.current]);

  return (
    <div className="flappy-container">
      <div className="game-header">
        <div className="score-board">
          <div className="current-score">Điểm: {gameState.score}</div>
          <div className="high-score">Cao nhất: {gameState.highScore}</div>
        </div>
        <div className="controls-info">
          <span>Space/Click/Tap: Nhảy</span>
          <span>P: Tạm dừng</span>
          <span>R: Chơi lại</span>
        </div>
      </div>

      <div className="game-screen">
        <div className="sky-bg" />
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />

        <div
          className="bird"
          style={{
            transform: `translateY(${gameState.birdY}px) rotate(${birdRotation}deg)`,
          }}
        >
          <div className="bird-eye" />
          <div className="bird-wing" />
        </div>

        {gameState.pipes.map((pipe) => (
          <React.Fragment key={pipe.id}>
            <div
              className="pipe pipe-top"
              style={{
                height: pipe.topHeight,
                left: pipe.x,
              }}
            />
            <div
              className="pipe pipe-bottom"
              style={{
                height: CONFIG.HEIGHT - pipe.topHeight - CONFIG.PIPE_GAP - CONFIG.GROUND_HEIGHT,
                left: pipe.x,
                top: pipe.topHeight + CONFIG.PIPE_GAP,
              }}
            />
          </React.Fragment>
        ))}

        <div className="ground" />

        {gameState.gameOver && (
          <div className="game-overlay">
            <div className="game-over-content">
              <h2>💀 Game Over</h2>
              <div className="final-score">Điểm: {gameState.score}</div>
              <div className="high-score-display">Điểm cao nhất: {gameState.highScore}</div>

              <div className="action-buttons">
                <button className="btn-restart" onClick={restart} autoFocus>
                  🔁 Chơi lại
                </button>
                <button className="btn-exit" onClick={handleExit}>
                  ⬅ Về Arcade
                </button>
              </div>

              {gameState.voucherMsg && <div className="voucher-notification">{gameState.voucherMsg}</div>}
            </div>
          </div>
        )}

        {gameState.isPaused && !gameState.gameOver && (
          <div className="pause-overlay">
            <div className="pause-content">
              <h2>⏸️ Tạm dừng</h2>
              <button className="btn-resume" onClick={togglePause}>
                Tiếp tục
              </button>
            </div>
          </div>
        )}


      </div>

      <div className="game-footer">
        <button className="btn-pause" onClick={togglePause} disabled={gameState.gameOver}>
          {gameState.isPaused ? "▶️ Tiếp tục" : "⏸️ Tạm dừng"}
        </button>
        <button className="btn-restart-footer" onClick={restart}>
          🔄 Khởi động lại
        </button>
      </div>
    </div>
  );
}
