package com.mediqueue.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/facilities")
@CrossOrigin(origins = "*")
public class HospitalFacilityController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHospitalFacilities() {
        Map<String, Object> data = new LinkedHashMap<>();

        // Hospital Profile
        data.put("hospitalName", "Diksha Hospital");
        data.put("tagline", "Smart Healthcare & Intelligent Queue Management");
        data.put("address", "Sector 4, Central Health Boulevard, Pune, Maharashtra 411045");
        data.put("receptionPhone", "+91 20 2567 8900");
        data.put("helpdeskEmail", "support@dikshahospital.org");

        // Emergency Notice
        Map<String, Object> emergencyInfo = new LinkedHashMap<>();
        emergencyInfo.put("phone", "108 / +91 20 2567 8999");
        emergencyInfo.put("availability", "24 Hours / 7 Days a week");
        emergencyInfo.put("location", "Ground Floor, Red Wing, Gate 1");
        emergencyInfo.put("protocol", "CRITICAL NOTICE: For acute trauma, chest pain, stroke symptoms, or severe respiratory distress, report directly to the 24/7 Emergency Wing. Emergency cases are prioritized immediately and NEVER wait in standard OPD queues.");
        data.put("emergency", emergencyInfo);

        // OPD Hours
        List<Map<String, String>> opdTimings = new ArrayList<>();
        opdTimings.add(Map.of("days", "Monday – Friday", "morning", "08:30 AM – 01:30 PM", "evening", "04:30 PM – 08:30 PM"));
        opdTimings.add(Map.of("days", "Saturday", "morning", "09:00 AM – 02:00 PM", "evening", "05:00 PM – 07:30 PM"));
        opdTimings.add(Map.of("days", "Sunday & Public Holidays", "morning", "Emergency & Urgent Care Only (24/7)", "evening", "Closed for Routine OPD"));
        data.put("opdTimings", opdTimings);

        // Key Facilities
        List<Map<String, Object>> facilities = new ArrayList<>();
        facilities.add(Map.of(
                "name", "24/7 Automated Pharmacy",
                "wing", "Ground Floor, Wing A",
                "description", "Prescription dispension linked directly to doctor electronic notes.",
                "status", "Operational"
        ));
        facilities.add(Map.of(
                "name", "Digital Pathology & Clinical Laboratory",
                "wing", "1st Floor, Wing B",
                "description", "Biochemistry, hematology, and rapid blood diagnostics with automated report generation.",
                "status", "Operational"
        ));
        facilities.add(Map.of(
                "name", "Advanced Imaging & Radiology",
                "wing", "Basement 1, Wing C",
                "description", "Low-radiation digital X-ray, multi-slice CT, ultrasound, and echocardiography.",
                "status", "Operational"
        ));
        facilities.add(Map.of(
                "name", "Wheelchair & Mobility Assistance",
                "wing", "All Hospital Entrances (Gate 1 & Gate 2)",
                "description", "Complimentary wheelchair assistance and dedicated elevators for all mobility-impaired patients.",
                "status", "Available on Request"
        ));
        facilities.add(Map.of(
                "name", "Self-Service Check-in Kiosks",
                "wing", "OPD Central Reception Foyer",
                "description", "Touchscreen multilingual check-in terminals for quick physical paper token printing.",
                "status", "Active"
        ));
        data.put("facilities", facilities);

        // Pricing Guide
        List<Map<String, Object>> feeStructure = new ArrayList<>();
        feeStructure.add(Map.of("department", "General Medicine", "fee", "₹300", "followup", "Complimentary within 7 days"));
        feeStructure.add(Map.of("department", "Cardiology", "fee", "₹500", "followup", "Complimentary within 7 days"));
        feeStructure.add(Map.of("department", "Orthopedics", "fee", "₹450", "followup", "Complimentary within 7 days"));
        feeStructure.add(Map.of("department", "Pediatrics", "fee", "₹350", "followup", "Complimentary within 7 days"));
        feeStructure.add(Map.of("department", "Dermatology", "fee", "₹400", "followup", "Complimentary within 7 days"));
        data.put("feeStructure", feeStructure);

        return ResponseEntity.ok(data);
    }
}
