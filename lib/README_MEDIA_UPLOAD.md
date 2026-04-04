# Media Upload Service Documentation

## Overview

The `mediaUploadService.js` provides a modular service for uploading images and videos to a PHP server. It handles unique ID generation, URL formatting, and progress tracking.

## URL Structure

Media files are uploaded with the following URL structure:
- **Upload Endpoint**: `https://example.com/upload`
- **View URL Format**: `https://example.com/viewMedia/{uniqueId}/{filename}`

Example:
- File: `image.png`
- Unique ID: `joseph14`
- Final URL: `https://example.com/viewMedia/joseph14/image.png`

## Usage

### Basic File Upload

```javascript
import { uploadFile, generateUniqueId } from '@/lib/services/mediaUploadService';

const uniqueId = generateUniqueId('joseph');
const result = await uploadFile(file, uniqueId, 'bedroom', 'image');

if (result.success) {
  console.log('File URL:', result.url);
}
```

### Upload Multiple Files

```javascript
import { uploadFiles } from '@/lib/services/mediaUploadService';

const results = await uploadFiles(
  filesArray,
  uniqueId,
  'bedroom',
  'image',
  (fileIndex, progress) => {
    console.log(`File ${fileIndex}: ${progress}%`);
  }
);
```

### Upload Property Media (Complete)

```javascript
import { uploadPropertyMedia, generateUniqueId } from '@/lib/services/mediaUploadService';

const uniqueId = generateUniqueId(caretakerName);
const result = await uploadPropertyMedia(
  mediaData,
  uniqueId,
  (category, progress, message) => {
    console.log(`${category}: ${progress}% - ${message}`);
  }
);

// Result structure:
// {
//   success: boolean,
//   images: [{ category: string, urls: string[], videoUrls: string[] }],
//   videoUrl?: string,
//   errors: string[]
// }
```

## PHP Server Implementation

### Upload Endpoint (`/upload`)

**Important:** The service uploads **one file per request**. Even though `uploadFiles()` handles multiple files, it calls `uploadFile()` multiple times, sending one file per HTTP request.

The PHP server should accept POST requests with:
- `file`: **Single file** to upload (not an array)
- `uniqueId`: Unique identifier for the upload session
- `category`: Category name (e.g., 'bedroom', 'parlor')
- `fileType`: 'image' or 'video'

**Expected Response:**
```json
{
  "success": true,
  "url": "https://example.com/viewMedia/joseph14/image.png",
  "fileName": "image.png"
}
```

**Example PHP Implementation:**

```php
<?php
// upload.php
// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors, but log them

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Validate required fields
    $uniqueId = $_POST['uniqueId'] ?? '';
    $category = $_POST['category'] ?? '';
    $fileType = $_POST['fileType'] ?? 'image';

    if (empty($uniqueId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing uniqueId']);
        exit;
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $errorCode = $_FILES['file']['error'] ?? 'FILE_NOT_PROVIDED';
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload',
            'FILE_NOT_PROVIDED' => 'No file provided'
        ];
        
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $errorMessages[$errorCode] ?? 'File upload error: ' . $errorCode
        ]);
        exit;
    }

    $file = $_FILES['file'];
    
    // Validate file size (e.g., 100MB max for videos, 10MB for images)
    $maxSize = ($fileType === 'video') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'File size exceeds maximum allowed size'
        ]);
        exit;
    }

    // Validate file type
    $allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
    $allowedTypes = ($fileType === 'video') ? $allowedVideoTypes : $allowedImageTypes;
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid file type. Allowed: ' . implode(', ', $allowedTypes)
        ]);
        exit;
    }

    // Sanitize filename
    $originalFileName = basename($file['name']);
    $fileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalFileName);
    $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
    
    // Generate unique filename to prevent overwrites
    $uniqueFileName = uniqid() . '_' . time() . '.' . $fileExtension;
    
    // Create upload directory structure: uploads/{uniqueId}/
    $baseUploadDir = __DIR__ . '/uploads/';
    $uploadDir = $baseUploadDir . $uniqueId . '/';
    
    // First, ensure the base uploads directory exists
    if (!is_dir($baseUploadDir)) {
        if (!mkdir($baseUploadDir, 0755, true)) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to create base uploads directory. Check permissions on: ' . $baseUploadDir
            ]);
            exit;
        }
    }
    
    // Check if base directory is writable
    if (!is_writable($baseUploadDir)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Base uploads directory is not writable. Path: ' . $baseUploadDir
        ]);
        exit;
    }
    
    // Create the uniqueId subdirectory if it doesn't exist
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            $lastError = error_get_last();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to create upload directory: ' . $uploadDir . 
                          (isset($lastError['message']) ? ' - ' . $lastError['message'] : '')
            ]);
            exit;
        }
    }
    
    // Verify the directory is writable
    if (!is_writable($uploadDir)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Upload directory is not writable: ' . $uploadDir
        ]);
        exit;
    }

    $targetPath = $uploadDir . $uniqueFileName;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to move uploaded file'
        ]);
        exit;
    }

    // Construct the URL (adjust base URL as needed)
    $baseUrl = 'http://192.168.1.151/tests/viewMedia';
    $url = $baseUrl . '/' . $uniqueId . '/' . $uniqueFileName;
    
    // Return success response
    echo json_encode([
        'success' => true,
        'url' => $url,
        'fileName' => $uniqueFileName,
        'originalFileName' => $originalFileName,
        'size' => $file['size'],
        'type' => $mimeType
    ]);

} catch (Exception $e) {
    // Log error (in production, log to file instead of exposing details)
    error_log('Upload error: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error occurred while processing upload'
    ]);
}
?>
```

### Delete Endpoint (`/delete`)

The PHP server should accept DELETE requests with:
- `uniqueId`: Unique identifier
- `fileName`: Name of the file to delete

**Expected Response:**
```json
{
  "success": true
}
```

**Example PHP Implementation:**

```php
<?php
// delete.php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$uniqueId = $data['uniqueId'] ?? '';
$fileName = $data['fileName'] ?? '';

if (empty($uniqueId) || empty($fileName)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$filePath = __DIR__ . '/uploads/' . $uniqueId . '/' . $fileName;

if (file_exists($filePath) && unlink($filePath)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'File not found']);
}
?>
```

### View Media Endpoint (`/viewMedia/{uniqueId}/{filename}`)

This endpoint should serve the media files. Example using Apache `.htaccess`:

```apache
RewriteEngine On
RewriteRule ^viewMedia/([^/]+)/(.+)$ uploads/$1/$2 [L]
```

Or using PHP:

```php
<?php
// viewMedia.php
$uniqueId = $_GET['uniqueId'] ?? '';
$fileName = $_GET['filename'] ?? '';

$filePath = __DIR__ . '/uploads/' . $uniqueId . '/' . $fileName;

if (file_exists($filePath)) {
    $mimeType = mime_content_type($filePath);
    header('Content-Type: ' . $mimeType);
    readfile($filePath);
} else {
    http_response_code(404);
    echo 'File not found';
}
?>
```

## Integration with Unit Interface

The service formats media data to match the `Unit` interface from `types.ts`:

```typescript
images: {
  category: string
  urls: string[]
  videoUrls?: string[]
}[]
videoUrl?: string
```

## Error Handling

The service handles errors gracefully:
- Network errors
- File size validation
- Invalid file types
- Server errors

All errors are returned in the `errors` array, allowing partial success scenarios.

## Troubleshooting

### 500 Internal Server Error

If you're getting a 500 error, check:

1. **PHP Error Logs**: Check your PHP error log file (usually in `/var/log/php_errors.log` or check `php.ini` for `error_log` setting)

2. **Directory Permissions**: Ensure the `uploads/` directory is writable:
   ```bash
   chmod 755 uploads/
   chmod 755 uploads/*/
   ```

3. **PHP Configuration**: Check these PHP settings in `php.ini`:
   ```ini
   upload_max_filesize = 100M
   post_max_size = 100M
   max_execution_time = 300
   memory_limit = 256M
   ```

4. **File Extension**: Ensure `finfo` extension is enabled:
   ```bash
   php -m | grep fileinfo
   ```

5. **Test the PHP Script Directly**: 
   ```bash
   php upload.php
   ```
   Or test with curl:
   ```bash
   curl -X POST -F "file=@test.jpg" -F "uniqueId=test123" -F "category=test" -F "fileType=image" http://192.168.1.151/tests/upload.php
   ```

6. **Enable Error Display** (temporarily for debugging):
   ```php
   ini_set('display_errors', 1);
   error_reporting(E_ALL);
   ```

### Common Issues

- **CORS Errors**: Make sure CORS headers are set in PHP
- **File Size Too Large**: Check `upload_max_filesize` and `post_max_size` in `php.ini`
- **Directory Not Writable**: Check folder permissions
- **Missing PHP Extensions**: Ensure `fileinfo` extension is installed

## Security Considerations

1. **File Validation**: Validate file types and sizes on the server
2. **Authentication**: Add authentication tokens to upload requests
3. **Rate Limiting**: Implement rate limiting on the server
4. **File Size Limits**: Enforce maximum file sizes
5. **Unique ID Validation**: Validate unique IDs to prevent directory traversal
6. **Sanitize Filenames**: Always sanitize filenames to prevent path traversal attacks

## Testing

To test with placeholder URLs, the service currently simulates uploads. Replace the placeholder code in `uploadFile()` with actual fetch calls when the PHP server is ready.

