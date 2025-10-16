using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Reflection;
using Shop_Db.Models;

namespace ShopVision50.Infrastructure
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<UserRole> UserRoles { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Material> Materials { get; set; } = null!;
        public DbSet<Style> Styles { get; set; } = null!;
        public DbSet<Gender> Genders { get; set; } = null!;
        public DbSet<Origin> Origins { get; set; } = null!;
        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<ProductVariant> ProductVariants { get; set; } = null!;
        public DbSet<ProductSize> Sizes { get; set; } = null!;
        public DbSet<ProductColor> Colors { get; set; } = null!;
        public DbSet<ProductImage> ProductImages { get; set; } = null!;
        public DbSet<Cart> Carts { get; set; } = null!;
        public DbSet<CartItem> CartItems { get; set; } = null!;
        public DbSet<UserAddress> UserAddresses { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;
        public DbSet<Promotion> Promotions { get; set; } = null!;
        public DbSet<OrderPromotion> OrderPromotions { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<ReturnNote> ReturnNotes { get; set; } = null!;
        public DbSet<ReturnItem> ReturnItems { get; set; } = null!;
    }
}
