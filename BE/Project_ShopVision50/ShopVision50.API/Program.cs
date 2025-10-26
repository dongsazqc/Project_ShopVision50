using Microsoft.EntityFrameworkCore;
using ShopVision50.API.Repositories.ProductsRepo_FD;
using ShopVision50.API.Services.ProductsService_FD;
using ShopVision50.Infrastructure;
using ShopVision50.API.Services.UserService_FD;

var builder = WebApplication.CreateBuilder(args);

// Kestrel listen all IP
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000);
});


// AppDbContext với MySQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    ));
// Add Services & Repositories
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
//------------------------------------------------------------------------------------------------------------------------------------------------

builder.Services.AddScoped<IProductsRepo, ProductsRepo>();
builder.Services.AddScoped<IProductsService, ProductsService>();



// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS (nếu FE khác LAN)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // tạm thời có thể comment khi test LAN

app.UseAuthorization();

app.MapControllers();

app.Run();
