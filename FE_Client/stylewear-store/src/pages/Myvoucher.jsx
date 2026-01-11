import { useEffect, useState } from "react";
import { Row, Col, Spin, message, Empty } from "antd";
import axios from "axios";

const MyVoucher = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); 
  const [messageApi, contextHolder] = message.useMessage();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  const axiosAuth = axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchVouchers = async () => {
    if (!token) {
      messageApi.error("Bạn chưa đăng nhập");
      return;
    }

    if (!userId) {
      messageApi.error("Không lấy được thông tin người dùng");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosAuth.get(
        `http://160.250.5.26:5000/api/khuyenmai/users/${userId}/promotions`
      );
      setVouchers(res.data.data || []);
    } catch (error) {
      messageApi.error("Lấy danh sách voucher thất bại");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    messageApi.success(`Đã sao chép mã ${code}`);
  };

  const shareVoucher = (voucher) => {
    const text = `🎁 Voucher ${voucher.code} - Giảm ${voucher.discountType === "PERCENT" ? `${voucher.discountValue}%` : Number(voucher.discountValue).toLocaleString() + " đ"} | Áp dụng đến ${new Date(voucher.endDate).toLocaleDateString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Chia sẻ voucher',
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      messageApi.success('Đã sao chép thông tin voucher để chia sẻ');
    }
  };

  useEffect(() => {
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        /* ===== CSS VARIABLES ===== */
        :root {
          --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          --warning-gradient: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
          --danger-gradient: linear-gradient(135deg, #ff5858 0%, #f09819 100%);
          --premium-gradient: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
          
          --bg-primary: #f8fafc;
          --bg-secondary: #ffffff;
          --bg-card: #ffffff;
          --bg-hover: #f1f5f9;
          --border-light: #e2e8f0;
          --border-medium: #cbd5e1;
          
          --text-primary: #1e293b;
          --text-secondary: #64748b;
          --text-muted: #94a3b8;
          --text-on-gradient: #ffffff;
          
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
          --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          --shadow-glow: 0 0 30px rgba(102, 126, 234, 0.15);
          
          --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
          --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
          --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
          
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 16px;
          --radius-xl: 20px;
          --radius-full: 9999px;
          
          --spacing-xs: 4px;
          --spacing-sm: 8px;
          --spacing-md: 16px;
          --spacing-lg: 24px;
          --spacing-xl: 32px;
          --spacing-2xl: 48px;
        }

        /* ===== GLOBAL STYLES ===== */
        .my-voucher-container {
          min-height: 100vh;
          background: var(--bg-primary);
          position: relative;
          overflow-x: hidden;
          animation: pageLoad 0.8s ease-out;
        }

        .my-voucher-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 400px;
          background: var(--primary-gradient);
          clip-path: ellipse(100% 60% at 50% 0%);
          opacity: 0.03;
          z-index: 0;
        }

        /* ===== HEADER SECTION ===== */
        .voucher-header {
          position: relative;
          padding: var(--spacing-2xl) var(--spacing-xl) var(--spacing-xl);
          text-align: center;
          margin-bottom: var(--spacing-xl);
          z-index: 1;
        }

        .voucher-header h2 {
          font-size: 2.75rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
          letter-spacing: -0.5px;
          position: relative;
          display: inline-block;
        }

        .voucher-header h2::before {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: var(--primary-gradient);
          border-radius: var(--radius-full);
        }

        .voucher-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .voucher-count-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          background: var(--bg-secondary);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-full);
          box-shadow: var(--shadow-md);
          margin-top: var(--spacing-lg);
          font-weight: 600;
          color: var(--text-primary);
          border: 1px solid var(--border-light);
          transition: all var(--transition-normal);
          cursor: pointer;
        }

        .voucher-count-badge:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          background: var(--primary-gradient);
          color: var(--text-on-gradient);
        }

        .voucher-count-badge .count {
          font-size: 1.25rem;
          font-weight: 800;
          margin-left: var(--spacing-xs);
        }

        /* ===== VOUCHER GRID ===== */
        .voucher-grid {
          position: relative;
          z-index: 1;
          padding: 0 var(--spacing-xl) var(--spacing-2xl);
        }

        /* Empty State */
        .voucher-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          text-align: center;
          padding: var(--spacing-2xl);
          background: var(--bg-secondary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          border: 2px dashed var(--border-light);
          transition: all var(--transition-normal);
        }

        .voucher-empty-state:hover {
          border-color: var(--border-medium);
          box-shadow: var(--shadow-xl);
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-xl);
          opacity: 0.5;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .empty-state-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
        }

        .empty-state-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 400px;
          margin-bottom: var(--spacing-xl);
          line-height: 1.6;
        }

        .explore-btn {
          background: var(--primary-gradient);
          color: var(--text-on-gradient);
          border: none;
          padding: var(--spacing-md) var(--spacing-xl);
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all var(--transition-normal);
          box-shadow: var(--shadow-md);
        }

        .explore-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        /* ===== VOUCHER CARD ===== */
        .voucher-card {
          height: 100%;
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-md);
          transition: all var(--transition-normal);
          overflow: hidden;
          position: relative;
          animation: fadeIn 0.6s ease-out forwards;
        }

        .voucher-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--primary-gradient);
          opacity: 0;
          transition: opacity var(--transition-normal);
        }

        .voucher-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-2xl);
          border-color: transparent;
        }

        .voucher-card:hover::before {
          opacity: 1;
        }

        .voucher-card.active {
          border-color: transparent;
          box-shadow: var(--shadow-glow);
          animation: pulse 2s infinite;
        }

        .voucher-card.active::before {
          opacity: 1;
        }

        .voucher-card.expired {
          filter: grayscale(0.8);
          opacity: 0.8;
        }

        .voucher-card.premium {
          position: relative;
          border: double 3px transparent;
          background-image: linear-gradient(var(--bg-card), var(--bg-card)), var(--premium-gradient);
          background-origin: border-box;
          background-clip: padding-box, border-box;
        }

        .voucher-card.featured {
          position: relative;
          overflow: visible;
        }

        .voucher-card.featured::after {
          content: '🔥 NỔI BẬT';
          position: absolute;
          top: 20px;
          right: -35px;
          background: var(--warning-gradient);
          color: var(--text-on-gradient);
          padding: var(--spacing-xs) var(--spacing-xl);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1px;
          transform: rotate(45deg);
          box-shadow: var(--shadow-md);
          z-index: 2;
        }

        /* Voucher Card Header */
        .voucher-card-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--border-light);
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          position: relative;
        }

        .voucher-code {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
        }

        .voucher-code-text {
          font-family: 'Courier New', monospace;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--text-primary);
          background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .voucher-status-badge {
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: none;
          transition: all var(--transition-fast);
        }

        .voucher-status-badge.active {
          background: var(--success-gradient);
          color: var(--text-on-gradient);
          box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
        }

        .voucher-status-badge.expired {
          background: var(--danger-gradient);
          color: var(--text-on-gradient);
          box-shadow: 0 4px 15px rgba(255, 88, 88, 0.3);
        }

        /* Voucher Card Body */
        .voucher-card-body {
          padding: var(--spacing-lg);
        }

        .voucher-detail-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          padding: var(--spacing-sm) 0;
          border-bottom: 1px solid var(--border-light);
        }

        .voucher-detail-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .detail-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: var(--bg-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-size: 1.125rem;
          flex-shrink: 0;
        }

        .detail-content {
          flex: 1;
        }

        .detail-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
          font-weight: 500;
        }

        .detail-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .discount-value {
          font-size: 1.75rem;
          font-weight: 800;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .condition-value {
          color: var(--text-secondary);
          font-weight: 600;
        }

        .date-range {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .date-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 0.9375rem;
        }

        .date-item i {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        /* Voucher Card Footer */
        .voucher-card-footer {
          padding: var(--spacing-lg);
          border-top: 1px solid var(--border-light);
          background: var(--bg-hover);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .voucher-type-tag {
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-full);
          background: var(--secondary-gradient);
          color: var(--text-on-gradient);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          border: none;
        }

        .action-buttons {
          display: flex;
          gap: var(--spacing-sm);
        }

        .action-btn {
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .action-btn:hover {
          background: var(--primary-gradient);
          color: var(--text-on-gradient);
          border-color: transparent;
          transform: translateY(-1px);
        }

        .action-btn.copy:hover {
          background: var(--success-gradient);
        }

        .action-btn.share:hover {
          background: var(--warning-gradient);
        }

        /* ===== LOADING STATE ===== */
        .voucher-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          padding: var(--spacing-2xl);
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 3px solid var(--border-light);
          border-top-color: var(--primary-gradient);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: var(--spacing-xl);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          font-size: 1.125rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* ===== ANIMATIONS ===== */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pageLoad {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { box-shadow: var(--shadow-glow); }
          50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.3); }
        }

        @keyframes borderRotate {
          from { background-position: 0% 0%; }
          to { background-position: 200% 0%; }
        }

        /* Animation delays for cards */
        .voucher-card:nth-child(1) { animation-delay: 0.1s; }
        .voucher-card:nth-child(2) { animation-delay: 0.2s; }
        .voucher-card:nth-child(3) { animation-delay: 0.3s; }
        .voucher-card:nth-child(4) { animation-delay: 0.4s; }
        .voucher-card:nth-child(5) { animation-delay: 0.5s; }
        .voucher-card:nth-child(6) { animation-delay: 0.6s; }

        /* ===== RESPONSIVE DESIGN ===== */
        @media (max-width: 768px) {
          :root {
            --spacing-xl: 24px;
            --spacing-2xl: 32px;
          }
          
          .voucher-header {
            padding: var(--spacing-xl) var(--spacing-md) var(--spacing-lg);
          }
          
          .voucher-header h2 {
            font-size: 2rem;
          }
          
          .voucher-grid {
            padding: 0 var(--spacing-md) var(--spacing-xl);
          }
          
          .voucher-code {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-sm);
          }
          
          .voucher-card-footer {
            flex-direction: column;
            gap: var(--spacing-md);
            align-items: flex-start;
          }
          
          .action-buttons {
            width: 100%;
            justify-content: flex-end;
          }
        }

        @media (max-width: 480px) {
          .voucher-detail-item {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-sm);
          }
          
          .detail-icon {
            align-self: flex-start;
          }
        }

        /* ===== DARK THEME SUPPORT ===== */
        @media (prefers-color-scheme: dark) {
          :root {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-card: #1e293b;
            --bg-hover: #334155;
            --border-light: #475569;
            --border-medium: #64748b;
            --text-primary: #f1f5f9;
            --text-secondary: #cbd5e1;
            --text-muted: #94a3b8;
          }
          
          .voucher-card {
            border-color: var(--border-light);
          }
          
          .voucher-card-header {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          }
          
          .voucher-empty-state {
            background: var(--bg-secondary);
            border-color: var(--border-light);
          }
        }

        /* ===== SCROLLBAR STYLING ===== */
        .my-voucher-container::-webkit-scrollbar {
          width: 10px;
        }

        .my-voucher-container::-webkit-scrollbar-track {
          background: var(--bg-primary);
        }

        .my-voucher-container::-webkit-scrollbar-thumb {
          background: var(--border-light);
          border-radius: var(--radius-full);
        }

        .my-voucher-container::-webkit-scrollbar-thumb:hover {
          background: var(--border-medium);
        }

        /* ===== ACCESSIBILITY ===== */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Focus styles */
        .voucher-card:focus-visible,
        .action-btn:focus-visible,
        .explore-btn:focus-visible,
        .voucher-count-badge:focus-visible {
          outline: 3px solid var(--primary-gradient);
          outline-offset: 2px;
          border-radius: var(--radius-md);
        }

        /* Selection color */
        ::selection {
          background: rgba(102, 126, 234, 0.3);
          color: var(--text-primary);
        }

        /* ===== CUSTOM CHECKMARK ANIMATION ===== */
        @keyframes checkmark {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .voucher-detail-item.validated .detail-icon::after {
          content: '✓';
          color: #10b981;
          font-weight: bold;
          animation: checkmark 0.3s ease-out;
        }
      `}</style>

      <div className="my-voucher-container">
        {contextHolder}
        
        <div className="voucher-header">
          <h2>🎁 Voucher Của Tôi</h2>
          <p className="voucher-subtitle">Quản lý và sử dụng voucher của bạn tại đây</p>
          <div className="voucher-count-badge" onClick={fetchVouchers}>
            <span>Tổng số:</span>
            <span className="count">{vouchers.length}</span>
            <span>voucher</span>
          </div>
        </div>

        <Spin spinning={loading} indicator={
          <div className="voucher-loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Đang tải voucher...</div>
          </div>
        }>
          {vouchers.length === 0 ? (
            <div className="voucher-grid">
              <div className="voucher-empty-state">
                <div className="empty-state-icon">🎁</div>
                <h3 className="empty-state-title">Bạn chưa có voucher nào</h3>
                <p className="empty-state-description">
                  Tham gia các chương trình khuyến mãi để nhận voucher hấp dẫn
                </p>
                <button className="explore-btn" onClick={() => window.location.href = '/promotions'}>
                  Khám phá voucher mới
                </button>
              </div>
            </div>
          ) : (
            <div className="voucher-grid">
              <Row gutter={[24, 24]}>
                {vouchers.map((v, i) => (
                  <Col xs={24} md={12} lg={8} key={i}>
                    <div className={`voucher-card ${v.status ? 'active' : 'expired'} ${i === 0 ? 'featured' : ''}`}>
                      <div className="voucher-card-header">
                        <div className="voucher-code">
                          <span className="voucher-code-text">{v.code}</span>
                          <span className={`voucher-status-badge ${v.status ? 'active' : 'expired'}`}>
                            {v.status ? 'CÒN HẠN' : 'HẾT HẠN'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="voucher-card-body">
                        <div className="voucher-detail-item">
                          <div className="detail-icon">💰</div>
                          <div className="detail-content">
                            <div className="detail-label">GIẢM GIÁ</div>
                            <div className="detail-value discount-value">
                              {v.discountType === "PERCENT"
                                ? `${v.discountValue}%`
                                : Number(v.discountValue).toLocaleString() + " đ"}
                            </div>
                          </div>
                        </div>
                        
                        {v.condition && (
                          <div className="voucher-detail-item">
                            <div className="detail-icon">📋</div>
                            <div className="detail-content">
                              <div className="detail-label">ĐIỀU KIỆN ÁP DỤNG</div>
                              <div className="detail-value condition-value">
                                Đơn tối thiểu {Number(v.condition).toLocaleString()} đ
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="voucher-detail-item">
                          <div className="detail-icon">⏰</div>
                          <div className="detail-content">
                            <div className="detail-label">THỜI HẠN SỬ DỤNG</div>
                            <div className="date-range">
                              <div className="date-item">
                                <i>📅</i>
                                <span>Từ: {new Date(v.startDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                              <div className="date-item">
                                <i>📅</i>
                                <span>Đến: {new Date(v.endDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="voucher-card-footer">
                        <span className="voucher-type-tag">VOUCHER CÁ NHÂN</span>
                        <div className="action-buttons">
                          <button 
                            className="action-btn copy" 
                            onClick={() => copyToClipboard(v.code)}
                            title="Sao chép mã"
                          >
                            📋 Sao chép
                          </button>
                          <button 
                            className="action-btn share" 
                            onClick={() => shareVoucher(v)}
                            title="Chia sẻ"
                          >
                            🔗 Chia sẻ
                          </button>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Spin>
      </div>
    </>
  );
};

export default MyVoucher;