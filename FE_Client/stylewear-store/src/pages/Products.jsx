import { useEffect, useState, useMemo } from "react";
import {
    Row,
    Col,
    Card,
    Button,
    Spin,
    Pagination,
    Checkbox,
    Slider,
    Typography,
} from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/axios";

const { Title } = Typography;

const Products = () => {    
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [topProductIds, setTopProductIds] = useState([]);
    const [searchParams] = useSearchParams();
    const keyword = useMemo(
        () => searchParams.get("keyword") || "",
        [searchParams]
    );

    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [filterCategory, setFilterCategory] = useState([]);
    const [filterPrice, setFilterPrice] = useState([0, 500000]);
    const [filterTop, setFilterTop] = useState(false);
    const [filterNew, setFilterNew] = useState(false);

    // ===== FETCH DATA =====
    useEffect(() => {
        fetchCategories();
        fetchTopProducts();
        fetchProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get("/Category/GetAll");
            const list = res.data?.$values || res.data || [];
            setCategories(list);
        } catch (err) {
            console.error("Lỗi load categories:", err);
        }
    };

    const fetchTopProducts = async () => {
        try {
            const res = await api.get("/TopSanPham");
            const ids = res.data?.map((item) => item.productId) || [];
            setTopProductIds(ids);
        } catch (err) {
            console.error("Lỗi load top products:", err);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/Products/getAllProducts");
            if (!res.data?.length) return setProducts([]);
            const productsWithImages = await Promise.all(
                res.data.map(async (item) => {
                    try {
                        const imgRes = await api.get(
                            `/products/${item.productId}/images/checkimages`
                        );
                        const img = imgRes.data[0]?.url || "";
                        const price = imgRes.data[0]?.product?.price || 0;
                        return {
                            ...item,
                            price,
                            image: `http://160.250.5.26:5000${img}`,
                            tenSanPham: item.tenSanPham || item.name,
                        };
                    } catch (err) {
                        console.error(
                            `Lỗi fetch ảnh product ${item.productId}:`,
                            err
                        );
                        return {
                            ...item,
                            price: item.price || 0,
                            image: "https://via.placeholder.com/300x300?text=No+Image",
                            tenSanPham: item.tenSanPham || item.name,
                        };
                    }
                })
            );

            setProducts(productsWithImages.filter((p) => (p?.productVariants ||[])?.some((v) => v.stock)));
        } catch (err) {
            console.error("Lỗi load products:", err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // ===== FILTER & PAGINATION =====
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchCategory =
                !filterCategory.length || filterCategory.includes(p.categoryId);
            const price = p.price || 0;
            const matchPrice =
                price >= filterPrice[0] && price <= filterPrice[1];
            const matchTop = filterTop
                ? topProductIds.includes(p.productId)
                : true;
            const matchNew = filterNew
                ? (() => {
                      if (p.isNew !== undefined) return p.isNew;
                      if (p.createdDate) {
                          const created = new Date(p.createdDate);
                          const thirtyDaysAgo = new Date();
                          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                          return created >= thirtyDaysAgo;
                      }
                      return false;
                  })()
                : true;
            const isMatchKeyword = keyword
                ? p.tenSanPham.toLowerCase().includes(keyword.toLowerCase())
                : true;

            return (
                matchCategory &&
                matchPrice &&
                matchTop &&
                matchNew &&
                isMatchKeyword
            );
        });
    }, [
        products,
        filterCategory,
        filterPrice,
        filterTop,
        filterNew,
        topProductIds,
        keyword,
    ]);
    const paginatedProducts = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [filteredProducts, page]);

    const getMainImage = (product) =>
        product?.image || "https://via.placeholder.com/300x300?text=No+Image";

    // ===== STYLES =====
    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)',
            position: 'relative',
            overflowX: 'hidden',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        },
        backgroundDecoration: {
            position: 'fixed',
            top: '-50%',
            right: '-20%',
            width: '60%',
            height: '150%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            opacity: 0.03,
            borderRadius: '50%',
            zIndex: 0
        },
        backgroundDecoration2: {
            position: 'fixed',
            bottom: '-40%',
            left: '-20%',
            width: '50%',
            height: '120%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            opacity: 0.03,
            borderRadius: '50%',
            zIndex: 0
        },
        sidebar: {
            width: '300px',
            padding: '3rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
            zIndex: 10,
            animation: 'slideInLeft 0.6s ease-out'
        },
        sidebarScrollbar: {
            width: '6px'
        },
        sidebarScrollbarTrack: {
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '9999px'
        },
        sidebarScrollbarThumb: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '9999px'
        },
        filterTitle: {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '1.75rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '2rem',
            position: 'relative',
            paddingBottom: '1rem'
        },
        filterTitleUnderline: {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '60px',
            height: '4px',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '9999px',
            animation: 'widthGrow 1s ease-out'
        },
        section: {
            marginBottom: '3rem',
            animation: 'fadeInUp 0.6s ease-out 0.2s both'
        },
        sectionTitle: {
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#4a5568',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        customCheckbox: {
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '10px 14px',
            background: 'white',
            borderRadius: '12px',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
            border: '2px solid transparent',
            gap: '8px'
        },
        checkboxHover: {
            transform: 'translateX(8px)',
            borderColor: '#667eea',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
        },
        checkboxIndicator: {
            width: '20px',
            height: '20px',
            border: '2px solid #e2e8f0',
            borderRadius: '6px',
            marginRight: '1rem',
            position: 'relative',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
        },
        sliderContainer: {
            margin: '30px 0'
        },
        sliderTrack: {
            height: '6px',
            background: 'linear-gradient(90deg, #e2e8f0, #667eea, #764ba2)',
            borderRadius: '9999px',
            position: 'relative'
        },
        sliderHandle: {
            width: '24px',
            height: '24px',
            background: 'white',
            border: '3px solid #667eea',
            borderRadius: '50%',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
            zIndex: 2
        },
        sliderHandleHover: {
            transform: 'translateY(-50%) scale(1.2)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
        },
        priceDisplay: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.1)'
        },
        priceValue: {
            fontWeight: 700,
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        filterOption: {
            display: 'flex',
            alignItems: 'center',
            padding: '14px 16px',
            marginBottom: '10px',
            background: 'white',
             gap: '10px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
            border: '2px solid transparent'
        },
        filterOptionHover: {
            transform: 'translateX(5px)',
            borderColor: '#f5576c',
            boxShadow: '0 4px 15px rgba(245, 87, 108, 0.1)'
        },
        optionBadge: {
            marginLeft: 'auto',
            padding: '4px 10px',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            fontSize: '0.75rem',
            borderRadius: '9999px',
            fontWeight: 600
        },
        resetButton: {
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            position: 'relative',
            overflow: 'hidden'
        },
        resetButtonHover: {
            transform: 'translateY(-3px)',
            boxShadow: '0 12px 30px rgba(102, 126, 234, 0.3)'
        },
        content: {
            flex: 1,
            padding: '3rem',
            position: 'relative',
            zIndex: 1
        },
        productsGrid: {
            marginBottom: '2rem',
            minHeight: '600px'
        },
        productCard: {
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            cursor: 'pointer',
            background: 'white',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        },
        productCardHover: {
            transform: 'translateY(-10px)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15)'
        },
        imageContainer: {
            width: '100%',
            height: '280px',
            overflow: 'hidden',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)'
        },
        productImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
        },
        productImageHover: {
            transform: 'scale(1.1)'
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
            opacity: 0,
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
            backdropFilter: 'blur(4px)'
        },
        overlayHover: {
            opacity: 1
        },
        buyButton: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            fontWeight: 600,
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
        },
        buyButtonHover: {
            transform: 'scale(1.05)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
        },
        productInfo: {
            padding: '1.5rem'
        },
        productName: {
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#2d3748',
            marginBottom: '0.75rem',
            lineHeight: 1.4,
            height: '3em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
        },
        productPrice: {
            color: '#d0011b',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        badgeContainer: {
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 2
        },
        badge: {
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        topBadge: {
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
            color: '#333'
        },
        newBadge: {
            background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
            color: '#333'
        },
        paginationContainer: {
            marginTop: '3rem',
            textAlign: 'center'
        },
        customPagination: {
            display: 'inline-flex',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
        },
        pageButton: {
            minWidth: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: 500,
            color: '#4a5568'
        },
        pageButtonActive: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        },
        loadingContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '500px',
            flexDirection: 'column',
            gap: '2rem'
        },
        spinner: {
            width: '60px',
            height: '60px',
            border: '4px solid rgba(102, 126, 234, 0.1)',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        },
        emptyState: {
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(10px)'
        },
        emptyIcon: {
            fontSize: '4rem',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        emptyText: {
            fontSize: '1.2rem',
            color: '#4a5568',
            marginBottom: '1rem'
        },
        searchBadge: {
            display: 'inline-block',
            marginBottom: '2rem',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)'
        }
    };

    // ===== CSS ANIMATIONS =====
    const keyframes = `
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes widthGrow {
            from { width: 0; }
            to { width: 60px; }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `;

    // ===== RENDER =====
    return (
        <>
            <style>{keyframes}</style>
            <div style={styles.container}>
                <div style={styles.backgroundDecoration} />
                <div style={styles.backgroundDecoration2} />
                
                {/* Sidebar */}
                <div style={styles.sidebar}>
                    <h1 style={styles.filterTitle}>
                        Lọc sản phẩm
                        <div style={styles.filterTitleUnderline} />
                    </h1>

                    <div style={styles.section}>
  <h2 style={styles.sectionTitle}>
    <span>📁</span> Danh mục
  </h2>
  <Checkbox.Group
    style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
    value={filterCategory}
    onChange={setFilterCategory}
  >
    {categories.map((cat) => {
      const id = cat.categoryId || cat.CategoryId;
      const name = cat.name || cat.Name;
      return (
        <label
          key={id}
          style={styles.customCheckbox}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(8px)';
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Checkbox value={id} />
          <span>{name}</span>
        </label>
      );
    })}
  </Checkbox.Group>
</div>


                    {/* Price Filter */}
                    <div style={{ ...styles.section, animationDelay: '0.3s' }}>
                        <h2 style={styles.sectionTitle}>
                            <span>💰</span> Tầm giá (VNĐ)
                        </h2>
                        <div style={styles.sliderContainer}>
                            <Slider
                                range
                                min={0}
                                max={1000000}
                                step={50000}
                                value={filterPrice}
                                onChange={setFilterPrice}
                                trackStyle={{ background: 'linear-gradient(90deg, #e2e8f0, #667eea, #764ba2)', height: '6px' }}
                                handleStyle={{
                                    width: '24px',
                                    height: '24px',
                                    border: '3px solid #667eea',
                                    background: 'white',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}
                                railStyle={{ background: '#e2e8f0', height: '6px' }}
                            />
                        </div>
                        <div style={styles.priceDisplay}>
                            <span style={styles.priceValue}>
                                {filterPrice[0].toLocaleString()}₫
                            </span>
                            <span style={{ color: '#718096' }}>→</span>
                            <span style={styles.priceValue}>
                                {filterPrice[1].toLocaleString()}₫
                            </span>
                        </div>
                    </div>

                    {/* Special Filters */}
                    <div style={{ ...styles.section, animationDelay: '0.4s' }}>
                        <h2 style={styles.sectionTitle}>
                            <span>✨</span> Bộ lọc đặc biệt
                        </h2>
                        <label
                            style={styles.filterOption}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(5px)';
                                e.currentTarget.style.borderColor = '#f5576c';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 87, 108, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Checkbox
                                checked={filterTop}
                                onChange={(e) => setFilterTop(e.target.checked)}
                            />
                            <span style={styles.optionLabel}>Top bán chạy</span>
                            <span style={styles.optionBadge}>Hot</span>
                        </label>
                        <label
                            style={styles.filterOption}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(5px)';
                                e.currentTarget.style.borderColor = '#4facfe';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Checkbox
                                checked={filterNew}
                                onChange={(e) => setFilterNew(e.target.checked)}
                            />
                            <span style={styles.optionLabel}>Sản phẩm mới</span>
                            <span style={{ ...styles.optionBadge, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                                New
                            </span>
                        </label>
                    </div>

                    {/* Reset Button */}
                    <button
                        style={styles.resetButton}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        onClick={() => {
                            setFilterCategory([]);
                            setFilterPrice([0, 500000]);
                            setFilterTop(false);
                            setFilterNew(false);
                        }}
                    >
                        <span>🔄</span>
                        Đặt lại bộ lọc
                    </button>
                </div>

                {/* Main Content */}
                <div style={styles.content}>
                    {keyword && (
                        <div style={styles.searchBadge}>
                            🔍 Kết quả tìm kiếm cho: "{keyword}"
                        </div>
                    )}

                    {loading ? (
                        <div style={styles.loadingContainer}>
                            <div style={styles.spinner} />
                            <Title level={4} style={{ color: '#667eea' }}>
                                Đang tải sản phẩm...
                            </Title>
                        </div>
                    ) : paginatedProducts.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>📦</div>
                            <Title level={3} style={{ marginBottom: '1rem' }}>
                                Không tìm thấy sản phẩm
                            </Title>
                            <p style={styles.emptyText}>
                                Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                            </p>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => {
                                    setFilterCategory([]);
                                    setFilterPrice([0, 500000]);
                                    setFilterTop(false);
                                    setFilterNew(false);
                                }}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '8px',
                                    fontWeight: 600
                                }}
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Row gutter={[24, 24]} style={styles.productsGrid}>
                                {paginatedProducts.map((product) => {
                                    const isTop = topProductIds.includes(product.productId);
                                    const isNewProduct = product.createdDate && 
                                        (new Date() - new Date(product.createdDate)) < 30 * 24 * 60 * 60 * 1000;
                                    
                                    return (
                                        <Col xs={24} sm={12} md={8} lg={6} key={product.productId}>
                                            <Card
                                                hoverable
                                                onClick={() => navigate(`/products/${product.productId}`)}
                                                style={styles.productCard}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                                    e.currentTarget.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.08)';
                                                }}
                                                bodyStyle={{ padding: 0 }}
                                            >
                                                {/* Badges */}
                                                <div style={styles.badgeContainer}>
                                                    {isTop && (
                                                        <div style={{ ...styles.badge, ...styles.topBadge }}>
                                                            🔥 Bán chạy
                                                        </div>
                                                    )}
                                                    {isNewProduct && (
                                                        <div style={{ ...styles.badge, ...styles.newBadge }}>
                                                            ✨ Mới
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Image */}
                                                <div style={styles.imageContainer}>
                                                    <img
                                                        src={getMainImage(product)}
                                                        alt={product.tenSanPham || product.name}
                                                        style={styles.productImage}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1.1)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                    />
                                                    {/* Overlay */}
                                                    <div
                                                        style={styles.overlay}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.opacity = '1';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.opacity = '0';
                                                        }}
                                                    >
                                                        <Button
                                                            type="primary"
                                                            size="middle"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/products/${product.productId}`);
                                                            }}
                                                            style={styles.buyButton}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                                                            }}
                                                        >
                                                            👁 Xem chi tiết
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Product Info */}
                                                <div style={styles.productInfo}>
                                                    <h4 style={styles.productName}>
                                                        {product.tenSanPham || product.name}
                                                    </h4>
                                                    <div style={styles.productPrice}>
                                                        {product.price?.toLocaleString() || 0}₫
                                                    </div>
                                                    <p style={{ color: '#718096', fontSize: '0.9rem' }}>
                                                        {product.productVariants?.filter(v => v.stock > 0).length || 0} biến thể
                                                    </p>
                                                </div>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>

                            {/* Pagination */}
                            <div style={styles.paginationContainer}>
                                <Pagination
                                    current={page}
                                    total={filteredProducts.length}
                                    pageSize={pageSize}
                                    onChange={setPage}
                                    showSizeChanger={false}
                                    showQuickJumper
                                    itemRender={(current, type, originalElement) => {
                                        if (type === 'prev') {
                                            return <button style={styles.pageButton}>← Trước</button>;
                                        }
                                        if (type === 'next') {
                                            return <button style={styles.pageButton}>Sau →</button>;
                                        }
                                        if (type === 'page') {
                                            return (
                                                <button
                                                    style={{
                                                        ...styles.pageButton,
                                                        ...(current === page && styles.pageButtonActive)
                                                    }}
                                                >
                                                    {current}
                                                </button>
                                            );
                                        }
                                        return originalElement;
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        gap: '8px',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Products;