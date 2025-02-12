namespace FingerPrintApplication.Models
{
    public record VerificationResult
    {
        public bool IsMatch { get; set; }
        public int Score { get; set; }
        public string Message { get; set; }
    }
}
