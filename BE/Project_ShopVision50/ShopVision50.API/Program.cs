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
    using ShopVision50.API.Services.StyleService_FD;
    using ShopVision50.API.Repositories.StyleRepo_FD;
    using Microsoft.AspNetCore.Authentication.JwtBearer;
    using Microsoft.IdentityModel.Tokens;
    using System.Text;
    using ShopVision50.API.Services.Login_FD;
    using ShopVision50.API.Repositories.MaterialRepo_FD;
    using ShopVision50.API.Services.MaterialService_FD;
    using ShopVision50.API.Repositories.GenderRepository_FD;
    using ShopVision50.API.Services.GenderService_FD;
    using ShopVision50.API.Repositories.OriginRepo_FD;
    using ShopVision50.API.Services.OriginService_FD;
    using ShopVision50.API.Repositories.ProductImageRepo_FD;
    using ShopVision50.API.Services.ProductImageService_FD;
    using ShopVision50.API.Repositories.TopCustomersRepo_FD;
    using ShopVision50.API.Services.TopCustomersService_FD;
    using ShopVision50.API.Repositories.ProductColorRepo_FD;
    using ShopVision50.API.Services.ProductColorService_FD;
    using ShopVision50.API.Repositories.ProductSizeRepo_FD;
    using ShopVision50.API.Services.ProductSizeService_FD;
    using Microsoft.Extensions.FileProviders;
    using ShopVision50.API.Services.RevenueService_FD;
    using ShopVision50.API.Repositories.RevenueSummary_FD;
    using ShopVision50.API.Repositories.CartRepository_FD;
    using ShopVision50.API.Services.CartService_FD;
    using ShopVision50.API.Repositories.TopProductsRepo_FD;
    using ShopVision50.API.Services.TopProductsService_FD;
    using ShopVision50.API.Services;
    using ShopVision50.API.Repositories.OrderItemRepository_FD;
    using ShopVision50.API.Services.OrderItemService_FD;
    using ShopVision50.API.Services.CartItemService;
    using ShopVision50.API.Repositories.CartItemRepository;
using ShopVision50.API.Services.OrderService_FD;
using ShopVision50.API.LlamaAiService;
using ShopVision50.API.Services.ChatAiService_FD;
using ShopVision50.API.Repositories.ChatAiRepository_FD;

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

    builder.Services.AddScoped<IProductVariantsRepo, ProductVariantRepository>();
    builder.Services.AddScoped<IProductVariantService,ProductVariantService>();

    builder.Services.AddScoped<ILoginService, LoginService>();

    builder.Services.AddScoped<IStyleRepo, StyleRepo>();
    builder.Services.AddScoped<IStyleService,StyleService >();

    builder.Services.AddScoped<IMaterialRepository, MaterialRepository>();
    builder.Services.AddScoped<IMaterialService, MaterialService>();

    builder.Services.AddScoped<IGenderRepository, GenderRepository>();
    builder.Services.AddScoped<IGenderService, GenderService>();

    builder.Services.AddScoped<IOriginRepository, OriginRepository>();
    builder.Services.AddScoped<IOriginService, OriginService>();

    builder.Services.AddScoped<IProductImageRepository,ProductImageRepository >();
    builder.Services.AddScoped<IProductImageService,ProductImageService>();

    builder.Services.AddScoped<ITopCustomersRepository, TopCustomersRepository>();
    builder.Services.AddScoped<ITopCustomersService, TopCustomersService>();

    builder.Services.AddScoped<IProductColorRepository, ProductColorRepository>();
    builder.Services.AddScoped<IProductColorService, ProductColorService>();

    builder.Services.AddScoped<IProductSizeRepository, ProductSizeRepository>();
    builder.Services.AddScoped<IProductSizeService, ProductSizeService>();

    builder.Services.AddScoped<IRevenueSummaryRepo, RevenueRepository>();
    builder.Services.AddScoped<IRevenueService, RevenueService>();

    builder.Services.AddScoped<ICartRepository, CartRepository>();
    builder.Services.AddScoped<ICartService, CartService>();

    builder.Services.AddScoped<ITopProductsRepository, TopProductsRepository>();
    builder.Services.AddScoped<ITopProductsService, TopProductsService>();

    builder.Services.AddMemoryCache();
    builder.Services.AddScoped<IEmailService, EmailService>();
    builder.Services.AddScoped<IUserService, UserService>();    

    builder.Services.AddScoped<IOrderItemRepository, OrderItemRepository>();
    builder.Services.AddScoped<IOrderItemService, OrderItemService>();

    builder.Services.AddScoped<ICartItemRepository, CartItemRepository>();
    builder.Services.AddScoped<ICartItemService, CartItemService>();

    
    builder.Services.AddScoped<IChatAiService, ChatAiService>();
    builder.Services.AddScoped<IChatAiRepository, ChatAiRepository>();



    builder.Services.AddSingleton(new LlamaAiService(
    "/home/dong/Desktop/Project_ShopVision50/BE/Project_ShopVision50/ShopVision50.AgentPy/llama.cpp/build/bin/llama-cli",
    "/home/dong/Desktop/Project_ShopVision50/BE/Project_ShopVision50/ShopVision50.AgentPy/llama.cpp/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf"
));







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
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });


    // Swagger
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // Đăng ký authorization
    builder.Services.AddAuthorization();

    var app = builder.Build();

    app.UseCors("AllowAll");


    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine(Directory.GetCurrentDirectory(), "images")
        ),
        RequestPath = "/images"
    });


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
