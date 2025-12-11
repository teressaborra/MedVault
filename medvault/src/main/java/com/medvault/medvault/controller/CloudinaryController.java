package com.medvault.medvault.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@RestController
@RequestMapping("/api/cloudinary")
@CrossOrigin(origins = "http://localhost:3000")
public class CloudinaryController {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    /**
     * Generate signature for secure Cloudinary upload
     * @return Signature response with timestamp and signature
     */
    @PostMapping("/signature")
    public ResponseEntity<?> generateSignature(@RequestBody Map<String, Object> params) {
        try {
            // Get timestamp
            long timestamp = System.currentTimeMillis() / 1000;
            
            // Extract folder from params or use default
            String folder = params.getOrDefault("folder", "medvault/documents").toString();
            
            // Create parameters to sign (alphabetically sorted)
            Map<String, String> paramsToSign = new TreeMap<>();
            paramsToSign.put("folder", folder);
            paramsToSign.put("timestamp", String.valueOf(timestamp));
            
            // Build string to sign (alphabetically sorted key=value pairs joined by &)
            StringBuilder toSign = new StringBuilder();
            for (Map.Entry<String, String> entry : paramsToSign.entrySet()) {
                if (toSign.length() > 0) {
                    toSign.append("&");
                }
                toSign.append(entry.getKey()).append("=").append(entry.getValue());
            }
            
            // Append API secret (Cloudinary requires this for SHA-1)
            toSign.append(apiSecret);
            
            // Generate SHA-1 signature (Cloudinary uses SHA-1, NOT SHA-256)
            String signature = generateSHA1(toSign.toString());
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("signature", signature);
            response.put("timestamp", timestamp);
            response.put("apiKey", apiKey);
            response.put("cloudName", cloudName);
            response.put("folder", folder);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to generate signature: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Generate SHA-1 hash (Cloudinary requires SHA-1 for signatures)
     */
    private String generateSHA1(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] hash = md.digest(value.getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate SHA-1 hash", e);
        }
    }

    /**
     * Get Cloudinary configuration (public info only)
     */
    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("cloudName", cloudName);
        config.put("apiKey", apiKey);
        config.put("success", true);
        return ResponseEntity.ok(config);
    }
}
