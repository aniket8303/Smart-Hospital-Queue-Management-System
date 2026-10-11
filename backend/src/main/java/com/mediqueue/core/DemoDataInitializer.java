package com.mediqueue.core;

import com.mediqueue.core.entity.Department;
import com.mediqueue.core.entity.Doctor;
import com.mediqueue.core.repository.DepartmentRepository;
import com.mediqueue.core.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Demo data initializer — seeds Diksha Hospital departments and doctors on startup.
 * Only runs if no data exists (idempotent).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DemoDataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public void run(String... args) {
        if (departmentRepository.count() > 0) {
            log.info("Demo data already initialized — skipping.");
            return;
        }

        log.info("Initializing Diksha Hospital demo data...");

        // Departments
        Department genMed = departmentRepository.save(Department.builder()
                .name("General Medicine")
                .code("GM")
                .description("Comprehensive primary health care, diagnostic consultations, and routine exams.")
                .iconName("Stethoscope")
                .activeDoctors(4)
                .build());

        Department cardio = departmentRepository.save(Department.builder()
                .name("Cardiology")
                .code("CAR")
                .description("Cardiac evaluations, ECG, echocardiography, and preventive heart care.")
                .iconName("HeartPulse")
                .activeDoctors(3)
                .build());

        Department ortho = departmentRepository.save(Department.builder()
                .name("Orthopedics")
                .code("ORT")
                .description("Bone, joint, spinal issues, sports injuries, and trauma rehabilitation.")
                .iconName("Bone")
                .activeDoctors(3)
                .build());

        Department pedia = departmentRepository.save(Department.builder()
                .name("Pediatrics")
                .code("PED")
                .description("Compassionate pediatric medicine, vaccinations, and growth monitoring.")
                .iconName("Baby")
                .activeDoctors(2)
                .build());

        Department derma = departmentRepository.save(Department.builder()
                .name("Dermatology")
                .code("DRM")
                .description("Advanced skin treatments, allergies, diagnostics, and cosmetic wellness.")
                .iconName("Sparkles")
                .activeDoctors(2)
                .build());

        // Doctors — Diksha Hospital
        doctorRepository.save(Doctor.builder()
                .name("Dr. Priya Sharma")
                .specialization("Senior Physician & Internal Medicine Specialist")
                .departmentId(genMed.getId())
                .departmentName(genMed.getName())
                .roomNumber("Room 102")
                .isAvailable(true)
                .averageConsultationTimeMin(5)
                .consultationFee(300.0)
                .build());

        doctorRepository.save(Doctor.builder()
                .name("Dr. Rahul Mehta")
                .specialization("Consultant Interventional Cardiologist")
                .departmentId(cardio.getId())
                .departmentName(cardio.getName())
                .roomNumber("Room 204")
                .isAvailable(true)
                .averageConsultationTimeMin(8)
                .consultationFee(500.0)
                .build());

        doctorRepository.save(Doctor.builder()
                .name("Dr. Neha Kulkarni")
                .specialization("Orthopedic Surgeon & Joint Replacement Specialist")
                .departmentId(ortho.getId())
                .departmentName(ortho.getName())
                .roomNumber("Room 108")
                .isAvailable(true)
                .averageConsultationTimeMin(7)
                .consultationFee(450.0)
                .build());

        doctorRepository.save(Doctor.builder()
                .name("Dr. Rajesh Verma")
                .specialization("Pediatrician & Neonatologist")
                .departmentId(pedia.getId())
                .departmentName(pedia.getName())
                .roomNumber("Room 301")
                .isAvailable(true)
                .averageConsultationTimeMin(6)
                .consultationFee(350.0)
                .build());

        doctorRepository.save(Doctor.builder()
                .name("Dr. Sunita Agarwal")
                .specialization("Dermatologist & Cosmetologist")
                .departmentId(derma.getId())
                .departmentName(derma.getName())
                .roomNumber("Room 205")
                .isAvailable(true)
                .averageConsultationTimeMin(6)
                .consultationFee(400.0)
                .build());

        log.info("Demo data initialized: {} departments, {} doctors",
                departmentRepository.count(), doctorRepository.count());
    }
}
