package com.mediqueue.core.controller;

import com.mediqueue.core.entity.Department;
import com.mediqueue.core.entity.Doctor;
import com.mediqueue.core.repository.DepartmentRepository;
import com.mediqueue.core.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DepartmentDoctorController {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;

    // =====================
    // DEPARTMENTS
    // =====================

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/departments/{departmentId}")
    public ResponseEntity<Department> getDepartment(@PathVariable Long departmentId) {
        return departmentRepository.findById(departmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/departments/{departmentId}/doctors")
    public ResponseEntity<List<Doctor>> getDoctorsByDepartment(
            @PathVariable Long departmentId,
            @RequestParam(required = false, defaultValue = "false") boolean availableOnly) {
        List<Doctor> doctors = availableOnly
                ? doctorRepository.findByDepartmentIdAndIsAvailableTrue(departmentId)
                : doctorRepository.findByDepartmentId(departmentId);
        return ResponseEntity.ok(doctors);
    }

    // =====================
    // DOCTORS
    // =====================

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors(
            @RequestParam(required = false, defaultValue = "false") boolean availableOnly) {
        List<Doctor> doctors = availableOnly
                ? doctorRepository.findByIsAvailableTrue()
                : doctorRepository.findAll();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<Doctor> getDoctor(@PathVariable Long doctorId) {
        return doctorRepository.findById(doctorId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctors/{doctorId}/availability")
    public ResponseEntity<Boolean> getDoctorAvailability(@PathVariable Long doctorId) {
        return doctorRepository.findById(doctorId)
                .map(d -> ResponseEntity.ok(d.getIsAvailable()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/doctors/{doctorId}/availability")
    public ResponseEntity<Doctor> updateDoctorAvailability(
            @PathVariable Long doctorId,
            @RequestParam boolean available) {
        return doctorRepository.findById(doctorId)
                .map(doctor -> {
                    doctor.setIsAvailable(available);
                    return ResponseEntity.ok(doctorRepository.save(doctor));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
