-- ====== Categories ======
INSERT INTO Categories (Name, Description) VALUES
('Áo Thun', 'Áo thun cotton 100%'),
('Quần Jeans', 'Quần jeans nam nữ co giãn'),
('Áo Khoác', 'Áo khoác chống nắng thời trang');

-- ====== Colors ======
INSERT INTO Colors (Name) VALUES
('Đen'),
('Trắng'),
('Xanh Navy');

-- ====== Genders ======
INSERT INTO Genders (Name) VALUES
('Nam'),
('Nữ'),
('Unisex');

-- ====== Materials ======
INSERT INTO Materials (Name) VALUES
('Cotton'),
('Jean'),
('Polyester');

-- ====== Origins ======
INSERT INTO Origins (Country) VALUES
('Việt Nam'),
('Hàn Quốc'),
('Mỹ');

-- ====== Promotions ======
INSERT INTO Promotions (Code, DiscountType, DiscountValue, `Condition`, `Scope`, StartDate, EndDate, Status) VALUES
('SALE10', 'percent', 10.00, 'Tổng >= 300k', 'Toàn sản phẩm', '2025-10-01', '2025-12-31', 1),
('FREESHIP', 'fixed', 20.00, 'Tổng >= 200k', 'Vận chuyển', '2025-09-01', '2025-12-01', 1),
('VIP15', 'percent', 15.00, 'Khách hàng VIP', 'Toàn sản phẩm', '2025-11-01', '2026-01-01', 1);

-- ====== Roles ======
INSERT INTO Roles (RoleName) VALUES
('Admin'),
('Customer'),
('Staff');

-- ====== Sizes ======
INSERT INTO Sizes (Name) VALUES
('M'),
('L'),
('XL');

-- ====== Styles ======
INSERT INTO Styles (Name) VALUES
('Basic'),
('Streetwear'),
('Sporty');

-- ====== Users ======
INSERT INTO Users (FullName, Email, Password, Phone, DefaultAddress, JoinDate, Status, RoleId) VALUES
('Nguyễn Văn A', 'a@example.com', '123456', '0901000001', 'Hà Nội', '2025-10-01', 1, 2),
('Trần Thị B', 'b@example.com', '123456', '0902000002', 'TP.HCM', '2025-10-02', 1, 2),
('Admin', 'admin@example.com', 'admin123', '0999999999', 'Server Room', '2025-09-15', 1, 1);

-- ====== Products ======
INSERT INTO Products (Name, Description, Price, Brand, Warranty, CreatedDate, Status, MaterialId, StyleId, GenderId, OriginId, CategoryId) VALUES
('Áo Thun Cổ Tròn', 'Áo thun unisex cổ tròn', 199000, 'CoolMate', '3 tháng', '2025-10-10', 1, 1, 1, 3, 1, 1),
('Quần Jeans Slim Fit', 'Jeans co giãn cao cấp', 399000, 'Levis', '6 tháng', '2025-10-11', 1, 2, 2, 1, 3, 2),
('Áo Khoác Hoodie', 'Áo hoodie phong cách streetwear', 299000, 'HoodZone', '3 tháng', '2025-10-12', 1, 3, 2, 3, 2, 3);

-- ====== Carts ======
INSERT INTO Carts (CreatedDate, Status, UserId) VALUES
('2025-10-15', 1, 1),
('2025-10-16', 1, 2),
('2025-10-17', 1, 3);

-- ====== Orders ======
INSERT INTO Orders (OrderDate, OrderType, Status, TotalAmount, RecipientName, RecipientPhone, ShippingAddress, UserId) VALUES
('2025-10-20', 'Online', 1, 499000, 'Nguyễn Văn A', '0901000001', 'Hà Nội', 1),
('2025-10-21', 'Offline', 1, 299000, 'Trần Thị B', '0902000002', 'TP.HCM', 2),
('2025-10-22', 'Online', 1, 399000, 'Admin', '0999999999', 'Server Room', 3);

-- ====== UserAddresses ======
INSERT INTO UserAddresses (RecipientName, Phone, AddressDetail, IsDefault, UserId) VALUES
('Nguyễn Văn A', '0901000001', '123 Trần Duy Hưng, Hà Nội', 1, 1),
('Trần Thị B', '0902000002', '456 Nguyễn Trãi, TP.HCM', 1, 2),
('Admin', '0999999999', 'Server Room', 1, 3);

-- ====== UserRoles ======
INSERT INTO UserRoles (UserId, RoleId) VALUES
(1, 2),
(2, 2),
(3, 1);

-- ====== ProductImages ======
INSERT INTO ProductImages (Url, IsMain, Stock, ProductId) VALUES
('img/aothun.jpg', 1, 100, 1),
('img/jeans.jpg', 1, 80, 2),
('img/hoodie.jpg', 1, 50, 3);

-- ====== ProductVariants ======
INSERT INTO ProductVariants (SalePrice, Stock, SizeId, ColorId, ProductId) VALUES
(199000, 50, 1, 1, 1),
(399000, 30, 2, 2, 2),
(299000, 20, 3, 3, 3);

-- ====== OrderPromotions ======
INSERT INTO OrderPromotions (OrderId, PromotionId) VALUES
(1, 1),
(2, 2),
(3, 3);

-- ====== Payments ======
INSERT INTO Payments (Method, Amount, Status, PaymentDate, OrderId) VALUES
('Momo', 499000, 1, '2025-10-20', 1),
('COD', 299000, 1, '2025-10-21', 2),
('ZaloPay', 399000, 1, '2025-10-22', 3);

-- ====== ReturnNotes ======
INSERT INTO ReturnNotes (ReturnDate, Reason, Status, TotalRefund, OrderId) VALUES
('2025-10-25', 'Sai size', 1, 199000, 1),
('2025-10-26', 'Lỗi sản phẩm', 0, 299000, 2),
('2025-10-27', 'Không vừa', 1, 399000, 3);

-- ====== CartItems ======
INSERT INTO CartItems (Quantity, Price, ProductVariantId, CartId) VALUES
(2, 398000, 1, 1),
(1, 399000, 2, 2),
(1, 299000, 3, 3);

-- ====== OrderItems ======
INSERT INTO OrderItems (Quantity, DiscountAmount, ProductVariantId, OrderId, PromotionId) VALUES
(2, 39800, 1, 1, 1),
(1, 29900, 2, 2, 2),
(1, 59850, 3, 3, 3);

-- ====== ReturnItems ======
INSERT INTO ReturnItems (Quantity, ReasonDetail, ProductVariantId, ReturnNoteId) VALUES
(1, 'Sai size M', 1, 1),
(1, 'Rách nhẹ', 2, 2),
(1, 'Không vừa form', 3, 3);
