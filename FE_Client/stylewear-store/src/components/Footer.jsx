import React from 'react';
import { Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

const Footer = () => {
  return (
    <div className="footer">
      <p>© 2025 StyleWear - Mua sắm trực tuyến, giao hàng tận nơi.</p>
      <Button
        icon={<ShoppingCartOutlined />}
        size="large"
        className="footer-button"
      >
        Xem Giỏ Hàng
      </Button>
    </div>
  );
};

export default Footer;
