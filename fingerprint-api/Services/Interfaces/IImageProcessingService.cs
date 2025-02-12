using SourceAFIS;
using System.Drawing;

namespace FingerPrintApplication.Services.Interfaces
{
    public interface IImageProcessingService
    {
        Task<byte[]> DownloadImageAsync(string imageUrl);
        FingerprintTemplate ExtractTemplate(byte[] imageBytes);
        byte[] GetPixels(Bitmap bitmap);
    }
}
