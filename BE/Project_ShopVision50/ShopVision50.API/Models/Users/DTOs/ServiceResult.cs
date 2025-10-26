// Models/Users/DTOs/ServiceResult.cs
namespace ShopVision50.API.Models.Users.DTOs
{
    public class ServiceResult<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }

        public static ServiceResult<T> Ok(T? data, string msg = "OK")
            => new() { Success = true, Message = msg, Data = data };

        public static ServiceResult<T> Fail(string msg)
            => new() { Success = false, Message = msg };
    }
}
