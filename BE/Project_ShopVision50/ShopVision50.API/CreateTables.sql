IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Categories] (
    [CategoryId] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY ([CategoryId])
);
GO

CREATE TABLE [Colors] (
    [ColorId] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Colors] PRIMARY KEY ([ColorId])
);
GO

CREATE TABLE [Genders] (
    [GenderId] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Genders] PRIMARY KEY ([GenderId])
);
GO

CREATE TABLE [Materials] (
    [MaterialId] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Materials] PRIMARY KEY ([MaterialId])
);
GO

CREATE TABLE [Origins] (
    [OriginId] int NOT NULL IDENTITY,
    [Country] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Origins] PRIMARY KEY ([OriginId])
);
GO

CREATE TABLE [Promotions] (
    [PromotionId] int NOT NULL IDENTITY,
    [Code] nvarchar(max) NOT NULL,
    [DiscountType] nvarchar(max) NOT NULL,
    [DiscountValue] decimal(18,2) NOT NULL,
    [Condition] nvarchar(max) NULL,
    [Scope] nvarchar(max) NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [Status] bit NOT NULL,
    CONSTRAINT [PK_Promotions] PRIMARY KEY ([PromotionId])
);
GO

CREATE TABLE [Roles] (
    [RoleId] int NOT NULL IDENTITY,
    [RoleName] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY ([RoleId])
);
GO

CREATE TABLE [Sizes] (
    [SizeId] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Sizes] PRIMARY KEY ([SizeId])
);
GO

CREATE TABLE [Styles] (
    [StyleId] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Styles] PRIMARY KEY ([StyleId])
);
GO

CREATE TABLE [Users] (
    [UserId] int NOT NULL IDENTITY,
    [FullName] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [Password] nvarchar(max) NOT NULL,
    [Phone] nvarchar(max) NULL,
    [DefaultAddress] nvarchar(max) NULL,
    [JoinDate] datetime2 NOT NULL,
    [Status] bit NOT NULL,
    [RoleId] int NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([UserId]),
    CONSTRAINT [FK_Users_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([RoleId])
);
GO

CREATE TABLE [Products] (
    [ProductId] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Price] decimal(18,2) NOT NULL,
    [Brand] nvarchar(max) NULL,
    [Warranty] nvarchar(max) NULL,
    [CreatedDate] datetime2 NOT NULL,
    [Status] bit NOT NULL,
    [MaterialId] int NULL,
    [StyleId] int NULL,
    [GenderId] int NULL,
    [OriginId] int NULL,
    [CategoryId] int NULL,
    CONSTRAINT [PK_Products] PRIMARY KEY ([ProductId]),
    CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([CategoryId]),
    CONSTRAINT [FK_Products_Genders_GenderId] FOREIGN KEY ([GenderId]) REFERENCES [Genders] ([GenderId]),
    CONSTRAINT [FK_Products_Materials_MaterialId] FOREIGN KEY ([MaterialId]) REFERENCES [Materials] ([MaterialId]),
    CONSTRAINT [FK_Products_Origins_OriginId] FOREIGN KEY ([OriginId]) REFERENCES [Origins] ([OriginId]),
    CONSTRAINT [FK_Products_Styles_StyleId] FOREIGN KEY ([StyleId]) REFERENCES [Styles] ([StyleId])
);
GO

CREATE TABLE [Carts] (
    [CartId] int NOT NULL IDENTITY,
    [CreatedDate] datetime2 NOT NULL,
    [Status] bit NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_Carts] PRIMARY KEY ([CartId]),
    CONSTRAINT [FK_Carts_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);
GO

CREATE TABLE [Orders] (
    [OrderId] int NOT NULL IDENTITY,
    [OrderDate] datetime2 NOT NULL,
    [OrderType] nvarchar(max) NOT NULL,
    [Status] bit NOT NULL,
    [TotalAmount] decimal(18,2) NOT NULL,
    [RecipientName] nvarchar(max) NOT NULL,
    [RecipientPhone] nvarchar(max) NOT NULL,
    [ShippingAddress] nvarchar(max) NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_Orders] PRIMARY KEY ([OrderId]),
    CONSTRAINT [FK_Orders_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);
GO

CREATE TABLE [UserAddresses] (
    [AddressId] int NOT NULL IDENTITY,
    [RecipientName] nvarchar(max) NOT NULL,
    [Phone] nvarchar(max) NOT NULL,
    [AddressDetail] nvarchar(max) NOT NULL,
    [IsDefault] bit NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_UserAddresses] PRIMARY KEY ([AddressId]),
    CONSTRAINT [FK_UserAddresses_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);
GO

CREATE TABLE [UserRoles] (
    [UserRoleId] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [RoleId] int NOT NULL,
    CONSTRAINT [PK_UserRoles] PRIMARY KEY ([UserRoleId]),
    CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([RoleId]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserRoles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);
GO

CREATE TABLE [ProductImages] (
    [ProductImageId] int NOT NULL IDENTITY,
    [Url] nvarchar(max) NOT NULL,
    [IsMain] bit NOT NULL,
    [Stock] int NOT NULL,
    [ProductId] int NOT NULL,
    CONSTRAINT [PK_ProductImages] PRIMARY KEY ([ProductImageId]),
    CONSTRAINT [FK_ProductImages_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([ProductId]) ON DELETE CASCADE
);
GO

CREATE TABLE [ProductVariants] (
    [ProductVariantId] int NOT NULL IDENTITY,
    [SalePrice] decimal(18,2) NOT NULL,
    [Stock] int NOT NULL,
    [SizeId] int NULL,
    [ColorId] int NULL,
    [ProductId] int NOT NULL,
    CONSTRAINT [PK_ProductVariants] PRIMARY KEY ([ProductVariantId]),
    CONSTRAINT [FK_ProductVariants_Colors_ColorId] FOREIGN KEY ([ColorId]) REFERENCES [Colors] ([ColorId]),
    CONSTRAINT [FK_ProductVariants_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([ProductId]) ON DELETE CASCADE,
    CONSTRAINT [FK_ProductVariants_Sizes_SizeId] FOREIGN KEY ([SizeId]) REFERENCES [Sizes] ([SizeId])
);
GO

CREATE TABLE [OrderPromotions] (
    [OrderPromotionId] int NOT NULL IDENTITY,
    [OrderId] int NOT NULL,
    [PromotionId] int NOT NULL,
    CONSTRAINT [PK_OrderPromotions] PRIMARY KEY ([OrderPromotionId]),
    CONSTRAINT [FK_OrderPromotions_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([OrderId]) ON DELETE CASCADE,
    CONSTRAINT [FK_OrderPromotions_Promotions_PromotionId] FOREIGN KEY ([PromotionId]) REFERENCES [Promotions] ([PromotionId]) ON DELETE CASCADE
);
GO

CREATE TABLE [Payments] (
    [PaymentId] int NOT NULL IDENTITY,
    [Method] nvarchar(max) NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Status] bit NOT NULL,
    [PaymentDate] datetime2 NOT NULL,
    [OrderId] int NOT NULL,
    CONSTRAINT [PK_Payments] PRIMARY KEY ([PaymentId]),
    CONSTRAINT [FK_Payments_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([OrderId]) ON DELETE CASCADE
);
GO

CREATE TABLE [ReturnNotes] (
    [ReturnNoteId] int NOT NULL IDENTITY,
    [ReturnDate] datetime2 NOT NULL,
    [Reason] nvarchar(max) NOT NULL,
    [Status] bit NOT NULL,
    [TotalRefund] decimal(18,2) NOT NULL,
    [OrderId] int NOT NULL,
    CONSTRAINT [PK_ReturnNotes] PRIMARY KEY ([ReturnNoteId]),
    CONSTRAINT [FK_ReturnNotes_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([OrderId]) ON DELETE CASCADE
);
GO

CREATE TABLE [CartItems] (
    [CartItemId] int NOT NULL IDENTITY,
    [Quantity] int NOT NULL,
    [Price] decimal(18,2) NOT NULL,
    [ProductVariantId] int NOT NULL,
    [CartId] int NOT NULL,
    CONSTRAINT [PK_CartItems] PRIMARY KEY ([CartItemId]),
    CONSTRAINT [FK_CartItems_Carts_CartId] FOREIGN KEY ([CartId]) REFERENCES [Carts] ([CartId]) ON DELETE CASCADE,
    CONSTRAINT [FK_CartItems_ProductVariants_ProductVariantId] FOREIGN KEY ([ProductVariantId]) REFERENCES [ProductVariants] ([ProductVariantId]) ON DELETE CASCADE
);
GO

CREATE TABLE [OrderItems] (
    [OrderItemId] int NOT NULL IDENTITY,
    [Quantity] int NOT NULL,
    [DiscountAmount] decimal(18,2) NOT NULL,
    [ProductVariantId] int NOT NULL,
    [OrderId] int NOT NULL,
    [PromotionId] int NULL,
    CONSTRAINT [PK_OrderItems] PRIMARY KEY ([OrderItemId]),
    CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([OrderId]) ON DELETE CASCADE,
    CONSTRAINT [FK_OrderItems_ProductVariants_ProductVariantId] FOREIGN KEY ([ProductVariantId]) REFERENCES [ProductVariants] ([ProductVariantId]) ON DELETE CASCADE,
    CONSTRAINT [FK_OrderItems_Promotions_PromotionId] FOREIGN KEY ([PromotionId]) REFERENCES [Promotions] ([PromotionId])
);
GO

CREATE TABLE [ReturnItems] (
    [ReturnItemId] int NOT NULL IDENTITY,
    [Quantity] int NOT NULL,
    [ReasonDetail] nvarchar(max) NOT NULL,
    [ProductVariantId] int NOT NULL,
    [ReturnNoteId] int NOT NULL,
    CONSTRAINT [PK_ReturnItems] PRIMARY KEY ([ReturnItemId]),
    CONSTRAINT [FK_ReturnItems_ProductVariants_ProductVariantId] FOREIGN KEY ([ProductVariantId]) REFERENCES [ProductVariants] ([ProductVariantId]) ON DELETE CASCADE,
    CONSTRAINT [FK_ReturnItems_ReturnNotes_ReturnNoteId] FOREIGN KEY ([ReturnNoteId]) REFERENCES [ReturnNotes] ([ReturnNoteId]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_CartItems_CartId] ON [CartItems] ([CartId]);
GO

CREATE INDEX [IX_CartItems_ProductVariantId] ON [CartItems] ([ProductVariantId]);
GO

CREATE INDEX [IX_Carts_UserId] ON [Carts] ([UserId]);
GO

CREATE INDEX [IX_OrderItems_OrderId] ON [OrderItems] ([OrderId]);
GO

CREATE INDEX [IX_OrderItems_ProductVariantId] ON [OrderItems] ([ProductVariantId]);
GO

CREATE INDEX [IX_OrderItems_PromotionId] ON [OrderItems] ([PromotionId]);
GO

CREATE INDEX [IX_OrderPromotions_OrderId] ON [OrderPromotions] ([OrderId]);
GO

CREATE INDEX [IX_OrderPromotions_PromotionId] ON [OrderPromotions] ([PromotionId]);
GO

CREATE INDEX [IX_Orders_UserId] ON [Orders] ([UserId]);
GO

CREATE INDEX [IX_Payments_OrderId] ON [Payments] ([OrderId]);
GO

CREATE INDEX [IX_ProductImages_ProductId] ON [ProductImages] ([ProductId]);
GO

CREATE INDEX [IX_Products_CategoryId] ON [Products] ([CategoryId]);
GO

CREATE INDEX [IX_Products_GenderId] ON [Products] ([GenderId]);
GO

CREATE INDEX [IX_Products_MaterialId] ON [Products] ([MaterialId]);
GO

CREATE INDEX [IX_Products_OriginId] ON [Products] ([OriginId]);
GO

CREATE INDEX [IX_Products_StyleId] ON [Products] ([StyleId]);
GO

CREATE INDEX [IX_ProductVariants_ColorId] ON [ProductVariants] ([ColorId]);
GO

CREATE INDEX [IX_ProductVariants_ProductId] ON [ProductVariants] ([ProductId]);
GO

CREATE INDEX [IX_ProductVariants_SizeId] ON [ProductVariants] ([SizeId]);
GO

CREATE INDEX [IX_ReturnItems_ProductVariantId] ON [ReturnItems] ([ProductVariantId]);
GO

CREATE INDEX [IX_ReturnItems_ReturnNoteId] ON [ReturnItems] ([ReturnNoteId]);
GO

CREATE INDEX [IX_ReturnNotes_OrderId] ON [ReturnNotes] ([OrderId]);
GO

CREATE INDEX [IX_UserAddresses_UserId] ON [UserAddresses] ([UserId]);
GO

CREATE INDEX [IX_UserRoles_RoleId] ON [UserRoles] ([RoleId]);
GO

CREATE INDEX [IX_UserRoles_UserId] ON [UserRoles] ([UserId]);
GO

CREATE INDEX [IX_Users_RoleId] ON [Users] ([RoleId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251014155712_NumberOne', N'8.0.0');
GO

COMMIT;
GO

