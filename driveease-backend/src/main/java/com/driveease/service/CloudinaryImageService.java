package com.driveease.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryImageService {

    private final Cloudinary cloudinary;

    public CloudinaryImageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadVehicleImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Image file is required.");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "driveease/vehicles",
                            "resource_type", "image"
                    )
            );
            Object secureUrl = uploadResult.get("secure_url");

            if (secureUrl == null) {
                throw new RuntimeException("Cloudinary upload succeeded but no secure URL was returned.");
            }

            return secureUrl.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to upload image to Cloudinary.", ex);
        }
    }

    public ContractFileUploadResult uploadContractDocument(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Document file is required.");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "driveease/contracts",
                            "resource_type", "auto"
                    )
            );

            Object secureUrl = uploadResult.get("secure_url");
            Object originalFilename = uploadResult.get("original_filename");
            Object format = uploadResult.get("format");
            Object publicId = uploadResult.get("public_id");

            if (secureUrl == null) {
                throw new RuntimeException("Cloudinary upload succeeded but no secure URL was returned.");
            }

            String clientFileName = file.getOriginalFilename() != null
                    ? file.getOriginalFilename().trim()
                    : "";

            String cloudinaryName = originalFilename != null
                    ? originalFilename.toString().trim()
                    : "";

            String cloudinaryPublicId = publicId != null
                    ? publicId.toString().trim()
                    : "";

            String cloudinaryFormat = format != null
                    ? format.toString().trim()
                    : "";

            String fallbackFromCloudinary = cloudinaryName;
            if (fallbackFromCloudinary.isEmpty() && !cloudinaryPublicId.isEmpty()) {
                int slashIndex = cloudinaryPublicId.lastIndexOf('/');
                String baseName = slashIndex >= 0
                        ? cloudinaryPublicId.substring(slashIndex + 1)
                        : cloudinaryPublicId;
                fallbackFromCloudinary = !cloudinaryFormat.isEmpty()
                        ? baseName + "." + cloudinaryFormat
                        : baseName;
            }

            String resolvedFileName = !clientFileName.isEmpty()
                    ? clientFileName
                    : fallbackFromCloudinary;

            if (resolvedFileName == null || resolvedFileName.isEmpty()) {
                resolvedFileName = "contract-document";
            }

            return new ContractFileUploadResult(secureUrl.toString(), resolvedFileName);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to upload contract document to Cloudinary.", ex);
        }
    }

    public record ContractFileUploadResult(String fileUrl, String fileName) {}
}
