using FingerPrintApplication.Models;
using FingerPrintApplication.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FingerPrintApplication.Controllers
{
    [ApiController]
    [Route("fingerprint-api")]
    public class FingerPrintVerificationController : ControllerBase
    {
        private readonly IFingerPrintService _fingerPrintService;

        public FingerPrintVerificationController(IFingerPrintService fingerPrintService)
        {
            _fingerPrintService = fingerPrintService;
        }

        /// <summary>
        /// Verifies if two fingerprint images match
        /// </summary>
        /// <param name="fingerDto">The fingerprint URLs to compare</param>
        /// <returns>Verification result indicating if the fingerprints match</returns>
        /// <response code="200">Returns the verification result</response>
        /// <response code="400">If the fingerprint URLs are empty or invalid</response>
        /// <response code="500">If there was an internal server error during verification</response>
        [HttpPost("verify", Name = "VerifyFingerprints")]
        [ProducesResponseType(typeof(VerificationResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> VerifyFingerPrint([FromBody] FingerDto fingerDto)
        {
            if (string.IsNullOrEmpty(fingerDto.SavedFingerUrl) || string.IsNullOrEmpty(fingerDto.UserFingerUrl))
            {
                return BadRequest(new VerificationResult
                {
                    IsMatch = false,
                    Message = "Fingerprint URL cannot be empty"
                });
            }

            var result = await _fingerPrintService.VerifyFingerPrints(
                fingerDto.SavedFingerUrl,
                fingerDto.UserFingerUrl);

            return Ok(result);
        }
    }
}
