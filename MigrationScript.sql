CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;

ALTER DATABASE CHARACTER SET utf8mb4;

CREATE TABLE `Categories` (
    `CategoryId` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Description` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_Categories` PRIMARY KEY (`CategoryId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Colors` (
    `ColorId` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Colors` PRIMARY KEY (`ColorId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Genders` (
    `GenderId` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Genders` PRIMARY KEY (`GenderId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Materials` (
    `MaterialId` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Materials` PRIMARY KEY (`MaterialId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Origins` (
    `OriginId` int NOT NULL AUTO_INCREMENT,
    `Country` longtext CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Origins` PRIMARY KEY (`OriginId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Promotions` (
    `PromotionId` int NOT NULL AUTO_INCREMENT,
    `Code` longtext CHARACTER SET utf8mb4 NOT NULL,
    `DiscountType` longtext CHARACTER SET utf8mb4 NOT NULL,
    `DiscountValue` decimal(65,30) NOT NULL,
    `Condition` longtext CHARACTER SET utf8mb4 NULL,
    `Scope` longtext CHARACTER SET utf8mb4 NULL,
    `StartDate` datetime(6) NOT NULL,
    `EndDate` datetime(6) NOT NULL,
    `Status` tinyint(1) NOT NULL,
    CONSTRAINT `PK_Promotions` PRIMARY KEY (`PromotionId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Roles` (
    `RoleId` int NOT NULL AUTO_INCREMENT,
    `RoleName` longtext CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Roles` PRIMARY KEY (`RoleId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Sizes` (
    `SizeId` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Sizes` PRIMARY KEY (`SizeId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Styles` (
    `StyleId` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Styles` PRIMARY KEY (`StyleId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Users` (
    `UserId` int NOT NULL AUTO_INCREMENT,
    `FullName` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Email` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Password` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Phone` longtext CHARACTER SET utf8mb4 NULL,
    `DefaultAddress` longtext CHARACTER SET utf8mb4 NULL,
    `JoinDate` datetime(6) NOT NULL,
    `Status` tinyint(1) NOT NULL,
    `RoleId` int NULL,
    CONSTRAINT `PK_Users` PRIMARY KEY (`UserId`),
    CONSTRAINT `FK_Users_Roles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`RoleId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Products` (
    `ProductId` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Description` longtext CHARACTER SET utf8mb4 NULL,
    `Price` decimal(65,30) NOT NULL,
    `Brand` longtext CHARACTER SET utf8mb4 NULL,
    `Warranty` longtext CHARACTER SET utf8mb4 NULL,
    `CreatedDate` datetime(6) NOT NULL,
    `Status` tinyint(1) NOT NULL,
    `MaterialId` int NULL,
    `StyleId` int NULL,
    `GenderId` int NULL,
    `OriginId` int NULL,
    `CategoryId` int NULL,
    CONSTRAINT `PK_Products` PRIMARY KEY (`ProductId`),
    CONSTRAINT `FK_Products_Categories_CategoryId` FOREIGN KEY (`CategoryId`) REFERENCES `Categories` (`CategoryId`),
    CONSTRAINT `FK_Products_Genders_GenderId` FOREIGN KEY (`GenderId`) REFERENCES `Genders` (`GenderId`),
    CONSTRAINT `FK_Products_Materials_MaterialId` FOREIGN KEY (`MaterialId`) REFERENCES `Materials` (`MaterialId`),
    CONSTRAINT `FK_Products_Origins_OriginId` FOREIGN KEY (`OriginId`) REFERENCES `Origins` (`OriginId`),
    CONSTRAINT `FK_Products_Styles_StyleId` FOREIGN KEY (`StyleId`) REFERENCES `Styles` (`StyleId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Carts` (
    `CartId` int NOT NULL AUTO_INCREMENT,
    `CreatedDate` datetime(6) NOT NULL,
    `Status` tinyint(1) NOT NULL,
    `UserId` int NOT NULL,
    CONSTRAINT `PK_Carts` PRIMARY KEY (`CartId`),
    CONSTRAINT `FK_Carts_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Orders` (
    `OrderId` int NOT NULL AUTO_INCREMENT,
    `OrderDate` datetime(6) NOT NULL,
    `OrderType` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Status` tinyint(1) NOT NULL,
    `TotalAmount` decimal(65,30) NOT NULL,
    `RecipientName` longtext CHARACTER SET utf8mb4 NOT NULL,
    `RecipientPhone` longtext CHARACTER SET utf8mb4 NOT NULL,
    `ShippingAddress` longtext CHARACTER SET utf8mb4 NOT NULL,
    `UserId` int NOT NULL,
    CONSTRAINT `PK_Orders` PRIMARY KEY (`OrderId`),
    CONSTRAINT `FK_Orders_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `UserAddresses` (
    `AddressId` int NOT NULL AUTO_INCREMENT,
    `RecipientName` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Phone` longtext CHARACTER SET utf8mb4 NOT NULL,
    `AddressDetail` longtext CHARACTER SET utf8mb4 NOT NULL,
    `IsDefault` tinyint(1) NOT NULL,
    `UserId` int NOT NULL,
    CONSTRAINT `PK_UserAddresses` PRIMARY KEY (`AddressId`),
    CONSTRAINT `FK_UserAddresses_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `UserRoles` (
    `UserRoleId` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `RoleId` int NOT NULL,
    CONSTRAINT `PK_UserRoles` PRIMARY KEY (`UserRoleId`),
    CONSTRAINT `FK_UserRoles_Roles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`RoleId`) ON DELETE CASCADE,
    CONSTRAINT `FK_UserRoles_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `ProductImages` (
    `ProductImageId` int NOT NULL AUTO_INCREMENT,
    `Url` longtext CHARACTER SET utf8mb4 NOT NULL,
    `IsMain` tinyint(1) NOT NULL,
    `Stock` int NOT NULL,
    `ProductId` int NOT NULL,
    CONSTRAINT `PK_ProductImages` PRIMARY KEY (`ProductImageId`),
    CONSTRAINT `FK_ProductImages_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`ProductId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `ProductVariants` (
    `ProductVariantId` int NOT NULL AUTO_INCREMENT,
    `SalePrice` decimal(65,30) NOT NULL,
    `Stock` int NOT NULL,
    `SizeId` int NULL,
    `ColorId` int NULL,
    `ProductId` int NOT NULL,
    CONSTRAINT `PK_ProductVariants` PRIMARY KEY (`ProductVariantId`),
    CONSTRAINT `FK_ProductVariants_Colors_ColorId` FOREIGN KEY (`ColorId`) REFERENCES `Colors` (`ColorId`),
    CONSTRAINT `FK_ProductVariants_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`ProductId`) ON DELETE CASCADE,
    CONSTRAINT `FK_ProductVariants_Sizes_SizeId` FOREIGN KEY (`SizeId`) REFERENCES `Sizes` (`SizeId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `OrderPromotions` (
    `OrderPromotionId` int NOT NULL AUTO_INCREMENT,
    `OrderId` int NOT NULL,
    `PromotionId` int NOT NULL,
    CONSTRAINT `PK_OrderPromotions` PRIMARY KEY (`OrderPromotionId`),
    CONSTRAINT `FK_OrderPromotions_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `Orders` (`OrderId`) ON DELETE CASCADE,
    CONSTRAINT `FK_OrderPromotions_Promotions_PromotionId` FOREIGN KEY (`PromotionId`) REFERENCES `Promotions` (`PromotionId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Payments` (
    `PaymentId` int NOT NULL AUTO_INCREMENT,
    `Method` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Amount` decimal(65,30) NOT NULL,
    `Status` tinyint(1) NOT NULL,
    `PaymentDate` datetime(6) NOT NULL,
    `OrderId` int NOT NULL,
    CONSTRAINT `PK_Payments` PRIMARY KEY (`PaymentId`),
    CONSTRAINT `FK_Payments_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `Orders` (`OrderId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `ReturnNotes` (
    `ReturnNoteId` int NOT NULL AUTO_INCREMENT,
    `ReturnDate` datetime(6) NOT NULL,
    `Reason` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Status` tinyint(1) NOT NULL,
    `TotalRefund` decimal(65,30) NOT NULL,
    `OrderId` int NOT NULL,
    CONSTRAINT `PK_ReturnNotes` PRIMARY KEY (`ReturnNoteId`),
    CONSTRAINT `FK_ReturnNotes_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `Orders` (`OrderId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `CartItems` (
    `CartItemId` int NOT NULL AUTO_INCREMENT,
    `Quantity` int NOT NULL,
    `Price` decimal(65,30) NOT NULL,
    `ProductVariantId` int NOT NULL,
    `CartId` int NOT NULL,
    CONSTRAINT `PK_CartItems` PRIMARY KEY (`CartItemId`),
    CONSTRAINT `FK_CartItems_Carts_CartId` FOREIGN KEY (`CartId`) REFERENCES `Carts` (`CartId`) ON DELETE CASCADE,
    CONSTRAINT `FK_CartItems_ProductVariants_ProductVariantId` FOREIGN KEY (`ProductVariantId`) REFERENCES `ProductVariants` (`ProductVariantId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `OrderItems` (
    `OrderItemId` int NOT NULL AUTO_INCREMENT,
    `Quantity` int NOT NULL,
    `DiscountAmount` decimal(65,30) NOT NULL,
    `ProductVariantId` int NOT NULL,
    `OrderId` int NOT NULL,
    `PromotionId` int NULL,
    CONSTRAINT `PK_OrderItems` PRIMARY KEY (`OrderItemId`),
    CONSTRAINT `FK_OrderItems_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `Orders` (`OrderId`) ON DELETE CASCADE,
    CONSTRAINT `FK_OrderItems_ProductVariants_ProductVariantId` FOREIGN KEY (`ProductVariantId`) REFERENCES `ProductVariants` (`ProductVariantId`) ON DELETE CASCADE,
    CONSTRAINT `FK_OrderItems_Promotions_PromotionId` FOREIGN KEY (`PromotionId`) REFERENCES `Promotions` (`PromotionId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `ReturnItems` (
    `ReturnItemId` int NOT NULL AUTO_INCREMENT,
    `Quantity` int NOT NULL,
    `ReasonDetail` longtext CHARACTER SET utf8mb4 NOT NULL,
    `ProductVariantId` int NOT NULL,
    `ReturnNoteId` int NOT NULL,
    CONSTRAINT `PK_ReturnItems` PRIMARY KEY (`ReturnItemId`),
    CONSTRAINT `FK_ReturnItems_ProductVariants_ProductVariantId` FOREIGN KEY (`ProductVariantId`) REFERENCES `ProductVariants` (`ProductVariantId`) ON DELETE CASCADE,
    CONSTRAINT `FK_ReturnItems_ReturnNotes_ReturnNoteId` FOREIGN KEY (`ReturnNoteId`) REFERENCES `ReturnNotes` (`ReturnNoteId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_CartItems_CartId` ON `CartItems` (`CartId`);

CREATE INDEX `IX_CartItems_ProductVariantId` ON `CartItems` (`ProductVariantId`);

CREATE INDEX `IX_Carts_UserId` ON `Carts` (`UserId`);

CREATE INDEX `IX_OrderItems_OrderId` ON `OrderItems` (`OrderId`);

CREATE INDEX `IX_OrderItems_ProductVariantId` ON `OrderItems` (`ProductVariantId`);

CREATE INDEX `IX_OrderItems_PromotionId` ON `OrderItems` (`PromotionId`);

CREATE INDEX `IX_OrderPromotions_OrderId` ON `OrderPromotions` (`OrderId`);

CREATE INDEX `IX_OrderPromotions_PromotionId` ON `OrderPromotions` (`PromotionId`);

CREATE INDEX `IX_Orders_UserId` ON `Orders` (`UserId`);

CREATE INDEX `IX_Payments_OrderId` ON `Payments` (`OrderId`);

CREATE INDEX `IX_ProductImages_ProductId` ON `ProductImages` (`ProductId`);

CREATE INDEX `IX_Products_CategoryId` ON `Products` (`CategoryId`);

CREATE INDEX `IX_Products_GenderId` ON `Products` (`GenderId`);

CREATE INDEX `IX_Products_MaterialId` ON `Products` (`MaterialId`);

CREATE INDEX `IX_Products_OriginId` ON `Products` (`OriginId`);

CREATE INDEX `IX_Products_StyleId` ON `Products` (`StyleId`);

CREATE INDEX `IX_ProductVariants_ColorId` ON `ProductVariants` (`ColorId`);

CREATE INDEX `IX_ProductVariants_ProductId` ON `ProductVariants` (`ProductId`);

CREATE INDEX `IX_ProductVariants_SizeId` ON `ProductVariants` (`SizeId`);

CREATE INDEX `IX_ReturnItems_ProductVariantId` ON `ReturnItems` (`ProductVariantId`);

CREATE INDEX `IX_ReturnItems_ReturnNoteId` ON `ReturnItems` (`ReturnNoteId`);

CREATE INDEX `IX_ReturnNotes_OrderId` ON `ReturnNotes` (`OrderId`);

CREATE INDEX `IX_UserAddresses_UserId` ON `UserAddresses` (`UserId`);

CREATE INDEX `IX_UserRoles_RoleId` ON `UserRoles` (`RoleId`);

CREATE INDEX `IX_UserRoles_UserId` ON `UserRoles` (`UserId`);

CREATE INDEX `IX_Users_RoleId` ON `Users` (`RoleId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251024190413_OneMySql', '8.0.0');

COMMIT;

