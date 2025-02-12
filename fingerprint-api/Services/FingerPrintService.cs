using FingerPrintApplication.Models;
using FingerPrintApplication.Services.Interfaces;
using SourceAFIS;

namespace FingerPrintApplication.Services
{
    public class FingerPrintService : IFingerPrintService
    {
        private readonly IImageProcessingService _imageProcessingService;
        private readonly ILogger<FingerPrintService> _logger;
        private const int MatchingThreshold = 50;

        public FingerPrintService(
            IImageProcessingService imageProcessingService,
            ILogger<FingerPrintService> logger)
        {
            _imageProcessingService = imageProcessingService;
            _logger = logger;
        }

        public async Task<VerificationResult> VerifyFingerPrints(string savedFingerUrl, string userFingerUrl)
        {
            try
            {
                var savedImageBytes = await _imageProcessingService.DownloadImageAsync(savedFingerUrl);
                var userImageBytes = await _imageProcessingService.DownloadImageAsync(userFingerUrl);

                if (savedImageBytes == null || userImageBytes == null)
                {
                    return new VerificationResult
                    {
                        IsMatch = false,
                        Message = "Failed to download fingerprint images"
                    };
                }

                var savedTemplate = _imageProcessingService.ExtractTemplate(savedImageBytes);
                var userTemplate = _imageProcessingService.ExtractTemplate(userImageBytes);

                if (savedTemplate == null || userTemplate == null)
                {
                    return new VerificationResult
                    {
                        IsMatch = false,
                        Message = "Failed to process fingerprint images"
                    };
                }

                var matcher = new FingerprintMatcher(savedTemplate);
                var score = matcher.Match(userTemplate);
                var isMatch = score >= MatchingThreshold;

                return new VerificationResult
                {
                    IsMatch = isMatch,
                    Score = (int)score,
                    Message = isMatch ? "Fingerprint matched" : "Fingerprint did not match"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during fingerprint verification");
                return new VerificationResult
                {
                    IsMatch = false,
                    Message = $"An error occurred during verification: {ex.Message}"
                };
            }
        }
    }
}
