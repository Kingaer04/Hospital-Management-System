using FingerPrintApplication.Models;

namespace FingerPrintApplication.Services.Interfaces
{
    public interface IFingerPrintService
    {
        Task<VerificationResult> VerifyFingerPrints(string savedFingerUrl, string userFingerUrl);
    }
}
