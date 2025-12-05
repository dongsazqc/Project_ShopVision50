using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.CartItemRepository;

namespace ShopVision50.API.Services.CartItemService
{
    public class CartItemService : ICartItemService
    {
        private readonly ICartItemRepository _cartItemRepository;

        public CartItemService(ICartItemRepository cartItemRepository)
        {
            _cartItemRepository = cartItemRepository;
        }

        public async Task<List<CartItemDto>> GetAllAsync()
        {
            var cartItems = await _cartItemRepository.GetAllAsync();

            return cartItems.Select(ci => new CartItemDto
            {
                CartItemId = ci.CartItemId,
                Quantity = ci.Quantity,
                Price = ci.Price > 0 ? ci.Price : ci.ProductVariant?.SalePrice ?? 0,
                ProductVariantId = ci.ProductVariantId,
                CartId = ci.CartId,
                ProductVariant = new ProductVariantDto
                {
                    ProductVariantId = ci.ProductVariant.ProductVariantId,
                    SalePrice = ci.ProductVariant.SalePrice,
                    Stock = ci.ProductVariant.Stock,
                    ProductId = ci.ProductVariant.ProductId,
                    Size = ci.ProductVariant.Size == null ? null : new ProductSizeDto
                    {
                        SizeId = ci.ProductVariant.Size.SizeId,
                        Name = ci.ProductVariant.Size.Name
                    },
                    Color = ci.ProductVariant.Color == null ? null : new ProductColorDto
                    {
                        ColorId = ci.ProductVariant.Color.ColorId,
                        Name = ci.ProductVariant.Color.Name
                    }
                }
            }).ToList();
        }

        public async Task<CartItemDto?> GetByIdAsync(int id)
        {
            var ci = await _cartItemRepository.GetByIdAsync(id);
            if (ci == null) return null;

            return new CartItemDto
            {
                CartItemId = ci.CartItemId,
                Quantity = ci.Quantity,
                Price = ci.Price > 0 ? ci.Price : ci.ProductVariant?.SalePrice ?? 0,
                ProductVariantId = ci.ProductVariantId,
                CartId = ci.CartId,
                ProductVariant = new ProductVariantDto
                {
                    ProductVariantId = ci.ProductVariant.ProductVariantId,
                    SalePrice = ci.ProductVariant.SalePrice,
                    Stock = ci.ProductVariant.Stock,
                    ProductId = ci.ProductVariant.ProductId,
                    Size = ci.ProductVariant.Size == null ? null : new ProductSizeDto
                    {
                        SizeId = ci.ProductVariant.Size.SizeId,
                        Name = ci.ProductVariant.Size.Name
                    },
                    Color = ci.ProductVariant.Color == null ? null : new ProductColorDto
                    {
                        ColorId = ci.ProductVariant.Color.ColorId,
                        Name = ci.ProductVariant.Color.Name
                    }
                }
            };
        }

        public async Task AddAsync(CartItem cartItem)
        {
            await _cartItemRepository.AddAsync(cartItem);
            await _cartItemRepository.SaveChangesAsync();
        }

        public async Task UpdateAsync(CartItem cartItem)
        {
            _cartItemRepository.Update(cartItem);
            await _cartItemRepository.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var cartItem = await _cartItemRepository.GetByIdAsync(id);
            if (cartItem == null) throw new Exception("CartItem not found");

            _cartItemRepository.Delete(cartItem);
            await _cartItemRepository.SaveChangesAsync();
        }
    }
}
