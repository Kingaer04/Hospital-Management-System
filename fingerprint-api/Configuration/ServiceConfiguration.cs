using FingerPrintApplication.Services;
using FingerPrintApplication.Services.Interfaces;

namespace FingerPrintApplication.Configuration
{
    public static class ServiceConfiguration
    {
        public static IServiceCollection AddFingerPrintServices(this IServiceCollection services)
        {
            services.AddHttpClient();
            services.AddScoped<IImageProcessingService, ImageProcessingService>();
            services.AddScoped<IFingerPrintService, FingerPrintService>();

            return services;
        }
    }
}
