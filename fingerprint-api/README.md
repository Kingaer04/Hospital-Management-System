# Fingerprint Verification API

A .NET Core Web API that provides fingerprint verification capabilities using the SourceAFIS library. This API allows you to compare two fingerprint images and determine if they match.

## Features

- Fingerprint template extraction
- Fingerprint matching with configurable threshold
- Support for image URLs
- Grayscale conversion for optimal processing
- Error handling and detailed response messages

## Prerequisites

- .NET Core 8 or later
- SourceAFIS library
- System.Drawing.Common package
- HttpClient

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/sim-codes/fingerprint-verification-api.git

   cd fingerprint-verification-api
   ```
2. Install the required NuGet packages:
   ```bash
   dotnet add package SourceAFIS
   dotnet add package System.Drawing.Common
   ```
3. Build the project:
   ```bash
   dotnet build
   ```
4. Run the application:
   ```bash
   dotnet run
   ```

## API Endpoints

### Verify Fingerprint

**Endpoint:** `POST /api/verify`

Compares two fingerprint images and returns a matching result.

**Request Body:**
```json
{
    "savedFingerUrl": "url-to-stored-fingerprint-image",
    "userFingerUrl": "url-to-user-fingerprint-image"
}
```

**Response:**
```json
{
    "isMatch": true|false,
    "score": 75,
    "message": "Fingerprint matched"
}
```

## Configuration

The matching threshold can be configured in the `VerifyFingerPrint` method. The default threshold is set to 50:

```csharp
const int threshold = 50; // Adjust this value based on your requirements
```

## Error Handling

The API includes comprehensive error handling for various scenarios:

- Invalid or empty URLs
- Failed image downloads
- Image processing errors
- General system exceptions

All errors return appropriate HTTP status codes and descriptive messages.

## Technical Details

### Image Processing

1. Images are downloaded from provided URLs
2. Converted to grayscale using the luminance formula:
   ```
   grayscale = 0.299R + 0.587G + 0.114B
   ```
3. Processed into SourceAFIS templates
4. Compared using the SourceAFIS matcher

### Performance Considerations

- Images are processed in memory
- Asynchronous operations for HTTP requests
- Efficient pixel-by-pixel processing

## Usage Example

```csharp
using var httpClient = new HttpClient();
var request = new FingerDto
{
    SavedFingerUrl = "https://example.com/stored-fingerprint.jpg",
    UserFingerUrl = "https://example.com/user-fingerprint.jpg"
};

var response = await httpClient.PostAsJsonAsync("/api/verify", request);
var result = await response.Content.ReadFromJsonAsync<VerificationResult>();
```

## Security Considerations

- Implement appropriate authentication and authorization
- Use HTTPS for all API calls
- Validate and sanitize input URLs
- Consider rate limiting for production use
- Implement logging for security auditing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license information here]