package com.driveease.controller;

import com.driveease.dto.ContractDocumentUploadResponse;
import com.driveease.dto.ImageUploadResponse;
import com.driveease.service.CloudinaryImageService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "http://localhost:5173")
public class ImageUploadController {

    private final CloudinaryImageService cloudinaryImageService;

    public ImageUploadController(CloudinaryImageService cloudinaryImageService) {
        this.cloudinaryImageService = cloudinaryImageService;
    }

    @PostMapping("/vehicle-image")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ImageUploadResponse uploadVehicleImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = cloudinaryImageService.uploadVehicleImage(file);
        return new ImageUploadResponse(imageUrl);
    }

    @PostMapping("/contract-document")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ContractDocumentUploadResponse uploadContractDocument(@RequestParam("file") MultipartFile file) {
        CloudinaryImageService.ContractFileUploadResult uploadResult =
                cloudinaryImageService.uploadContractDocument(file);

        return new ContractDocumentUploadResponse(uploadResult.fileUrl(), uploadResult.fileName());
    }
}
