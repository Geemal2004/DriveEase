package com.driveease.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ContractDocumentUploadResponse {
    private String fileUrl;
    private String fileName;
}
