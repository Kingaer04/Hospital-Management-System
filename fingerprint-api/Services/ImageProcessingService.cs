using FingerPrintApplication.Services.Interfaces;
using SourceAFIS;
using System.Drawing;

namespace FingerPrintApplication.Services
{
    public class ImageProcessingService : IImageProcessingService
    {
        private readonly ILogger<ImageProcessingService> _logger;
        private readonly HttpClient _httpClient;

        public ImageProcessingService(ILogger<ImageProcessingService> logger, HttpClient httpClient)
        {
            _logger = logger;
            _httpClient = httpClient;
        }

        public async Task<byte[]> DownloadImageAsync(string imageUrl)
        {
            try
            {
                var response = await _httpClient.GetAsync(imageUrl);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsByteArrayAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading image from {Url}", imageUrl);
                return null;
            }
        }

        public FingerprintTemplate ExtractTemplate(byte[] imageBytes)
        {
            try
            {
                using var ms = new MemoryStream(imageBytes);
                var image = Image.FromStream(ms);
                var bitmap = new Bitmap(image);
                var fingerprintImage = new FingerprintImage(bitmap.Width, bitmap.Height, GetPixels(bitmap));
                return new FingerprintTemplate(fingerprintImage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting fingerprint template");
                return null;
            }
        }

        public byte[] GetPixels(Bitmap bitmap)
        {
            var width = bitmap.Width;
            var height = bitmap.Height;
            var pixels = new byte[width * height];

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    var color = bitmap.GetPixel(x, y);
                    pixels[y * width + x] = (byte)(0.299 * color.R + 0.587 * color.G + 0.114 * color.B);
                }
            }

            return pixels;
        }
    }
}
