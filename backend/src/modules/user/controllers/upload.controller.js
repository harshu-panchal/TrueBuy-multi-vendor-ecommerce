import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { uploadLocalFileToCloudinaryAndCleanup } from '../../../services/upload.service.js';

export const uploadImages = asyncHandler(async (req, res) => {
    const files = req.files || req.file;
    if (!files || files.length === 0) {
        return res.status(400).json(new ApiResponse(400, null, 'No image files provided'));
    }

    const fileArray = Array.isArray(files) ? files : [files];
    const folder = `users/${req.user.id}/returns`;

    const settledUploads = await Promise.allSettled(
        fileArray.map((file) => uploadLocalFileToCloudinaryAndCleanup(file.path, folder))
    );

    const successfulUploads = settledUploads
        .filter((result) => result.status === 'fulfilled' && result.value)
        .map((result) => ({
            url: result.value.url,
            publicId: result.value.publicId,
        }));

    if (successfulUploads.length === 0) {
        return res.status(500).json(new ApiResponse(500, null, 'Failed to upload images to Cloudinary'));
    }

    res.status(201).json(
        new ApiResponse(201, successfulUploads, `Successfully uploaded ${successfulUploads.length} image(s)`)
    );
});
