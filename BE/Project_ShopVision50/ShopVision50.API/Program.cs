using Microsoft.EntityFrameworkCore;
using ShopVision50.API.Repositories.ProductsRepo_FD;
using ShopVision50.API.Services.ProductsService_FD;
using ShopVision50.Infrastructure;
using ShopVision50.API.Services.UserService_FD;
using ShopVision50.API.Repositories;
using ShopVision50.API.Repositories.PromotionRepo_FD;
using ShopVision50.API.Services.PromotionService_FD;
using ShopVision50.API.Repositories.CategoriesRepo_FD;
using ShopVision50.API.Services.CategoriesService_FD;
using ShopVision50.API.Repositories.OrderRepo_FD;
using ShopVision50.API.Repositories.ProductsRepo_FD.OrderRepo;
using ShopVision50.API.Service.OrderService_FD;
using ShopVision50.API.Repositories.ProductVariantsRepo_FD;
using ShopVision50.API.Services.ProductVariantService_FD;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ShopVision50.API.Services.Login_FD;

var builder = WebApplication.CreateBuilder(args);

// Kestrel listen all IP trên port 5000
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000);
});


// Lấy JWT config từ appsettings.json
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });




// Đăng ký DbContext MySQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    ));

// Tắt filter model state mặc định (tuỳ chọn)
builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(o =>
{
    o.SuppressModelStateInvalidFilter = true;
});

// Đăng ký dịch vụ và repository
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddScoped<ICategoriesReposirory, CategoriesReposirory>();
builder.Services.AddScoped<ICategoriesService, CategoriesService>();

builder.Services.AddScoped<IProductsRepo, ProductsRepo>();
builder.Services.AddScoped<IProductsService, ProductsService>();

builder.Services.AddScoped<IPromotionRepository, PromotionRepository>();
builder.Services.AddScoped<IPromotionService, PromotionService>();

builder.Services.AddScoped<IOrderRepository,OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();

builder.Services.AddScoped<IProductVariantsRepo, ProductVariantsRepo>();
builder.Services.AddScoped<IProductVariantService,ProductVariantService>();

builder.Services.AddScoped<ILoginService, LoginService>();



// CORS - cho phép tất cả origin (FE khác host thì bật)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

// Đăng ký Controllers và JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
        options.JsonSerializerOptions.MaxDepth = 64;
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Đăng ký authorization
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // tắt tạm để test mạng LAN

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
