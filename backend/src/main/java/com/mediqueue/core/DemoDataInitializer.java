package com.mediqueue.core;

import com.mediqueue.core.entity.*;
import com.mediqueue.core.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Demo data initializer — seeds Diksha Hospital departments, doctors,
 * demo patients, appointments, and tokens on startup.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DemoDataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final QueueTokenRepository tokenRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final PatientNotificationRepository notificationRepository;

    @Override
    public void run(String... args) {
        if (departmentRepository.count() > 0) {
            log.info("Demo data already initialized — skipping.");
            return;
        }

        log.info("Initializing Diksha Hospital demo data...");

        // 1. Departments
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

        // 2. Doctors
        Doctor docPriya = doctorRepository.save(Doctor.builder()
                .name("Dr. Priya Sharma")
                .specialization("Senior Physician & Internal Medicine Specialist")
                .departmentId(genMed.getId())
                .departmentName(genMed.getName())
                .roomNumber("Room 102")
                .isAvailable(true)
                .averageConsultationTimeMin(5)
                .consultationFee(300.0)
                .build());

        Doctor docRahul = doctorRepository.save(Doctor.builder()
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

        // 3. Patients (Patient A & Patient B for strict privacy separation)
        Patient patientA = patientRepository.save(Patient.builder()
                .uhid("UHID-2026-8303")
                .fullName("Aniket Parekar")
                .phone("+91 91234 56789")
                .email("aniket@mediqueue.org")
                .gender("Male")
                .age(28)
                .bloodGroup("B+")
                .emergencyContact("+91 98765 43210")
                .address("702 Emerald Heights, Diksha Hospital Road, Pune")
                .role("ROLE_PATIENT")
                .registeredAt(LocalDateTime.now().minusDays(10))
                .build());

        Patient patientB = patientRepository.save(Patient.builder()
                .uhid("UHID-2026-9912")
                .fullName("Rahul Verma")
                .phone("+91 98888 77777")
                .email("rahul.verma@example.com")
                .gender("Male")
                .age(42)
                .bloodGroup("O+")
                .emergencyContact("+91 97777 66666")
                .address("403 Silver Oak Residency, Pune")
                .role("ROLE_PATIENT")
                .registeredAt(LocalDateTime.now().minusDays(5))
                .build());

        // 4. Sample Queue Tokens
        LocalDate today = LocalDate.now();

        // Token GM-042 for Patient A
        QueueToken tokenA = tokenRepository.save(QueueToken.builder()
                .tokenNumber("GM-042")
                .patientId(patientA.getId())
                .patientName(patientA.getFullName())
                .patientPhone(patientA.getPhone())
                .patientGender(patientA.getGender())
                .patientAge(patientA.getAge())
                .doctorId(docPriya.getId())
                .doctorName(docPriya.getName())
                .departmentId(genMed.getId())
                .departmentName(genMed.getName())
                .roomNumber("Room 102")
                .queueDay(today)
                .position(8)
                .status(QueueToken.QueueStatus.WAITING)
                .priority(QueueToken.Priority.NORMAL)
                .source(QueueToken.TokenSource.MOBILE)
                .tokenType(QueueToken.TokenType.DIGITAL)
                .estimatedWaitMinutes(35)
                .consultationFee(300.0)
                .transactionId("MQ-2026-8303")
                .paymentMethod("UPI")
                .paymentStatus("SUCCESS")
                .createdAt(LocalDateTime.now().minusMinutes(25))
                .build());

        // Token CAR-015 for Patient B
        QueueToken tokenB = tokenRepository.save(QueueToken.builder()
                .tokenNumber("CAR-015")
                .patientId(patientB.getId())
                .patientName(patientB.getFullName())
                .patientPhone(patientB.getPhone())
                .patientGender(patientB.getGender())
                .patientAge(patientB.getAge())
                .doctorId(docRahul.getId())
                .doctorName(docRahul.getName())
                .departmentId(cardio.getId())
                .departmentName(cardio.getName())
                .roomNumber("Room 204")
                .queueDay(today)
                .position(3)
                .status(QueueToken.QueueStatus.WAITING)
                .priority(QueueToken.Priority.NORMAL)
                .source(QueueToken.TokenSource.RECEPTION)
                .tokenType(QueueToken.TokenType.PHYSICAL)
                .estimatedWaitMinutes(16)
                .consultationFee(500.0)
                .transactionId("MQ-2026-9912")
                .paymentMethod("CARD")
                .paymentStatus("SUCCESS")
                .createdAt(LocalDateTime.now().minusMinutes(15))
                .build());

        // 5. Appointments
        appointmentRepository.save(Appointment.builder()
                .patientId(patientA.getId())
                .patientName(patientA.getFullName())
                .doctorId(docPriya.getId())
                .doctorName(docPriya.getName())
                .departmentId(genMed.getId())
                .departmentName(genMed.getName())
                .roomNumber("Room 102")
                .scheduledTime(LocalDateTime.now().plusHours(2))
                .status(Appointment.AppointmentStatus.CONFIRMED)
                .reason("Follow-up Blood Pressure Checkup")
                .tokenNumber("GM-042")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build());

        appointmentRepository.save(Appointment.builder()
                .patientId(patientB.getId())
                .patientName(patientB.getFullName())
                .doctorId(docRahul.getId())
                .doctorName(docRahul.getName())
                .departmentId(cardio.getId())
                .departmentName(cardio.getName())
                .roomNumber("Room 204")
                .scheduledTime(LocalDateTime.now().plusHours(4))
                .status(Appointment.AppointmentStatus.CONFIRMED)
                .reason("Cardiology Evaluation & ECG Review")
                .tokenNumber("CAR-015")
                .createdAt(LocalDateTime.now().minusDays(2))
                .build());

        // 6. Payment Records
        paymentRecordRepository.save(PaymentRecord.builder()
                .transactionId("MQ-2026-8303")
                .patientId(patientA.getId())
                .patientName(patientA.getFullName())
                .tokenNumber("GM-042")
                .doctorId(docPriya.getId())
                .doctorName(docPriya.getName())
                .departmentId(genMed.getId())
                .departmentName(genMed.getName())
                .amount(300.0)
                .paymentMethod("UPI")
                .status("SUCCESS")
                .isDemo(true)
                .receiptUrl("/receipts/MQ-2026-8303.pdf")
                .paidAt(LocalDateTime.now().minusMinutes(25))
                .build());

        paymentRecordRepository.save(PaymentRecord.builder()
                .transactionId("MQ-2026-9912")
                .patientId(patientB.getId())
                .patientName(patientB.getFullName())
                .tokenNumber("CAR-015")
                .doctorId(docRahul.getId())
                .doctorName(docRahul.getName())
                .departmentId(cardio.getId())
                .departmentName(cardio.getName())
                .amount(500.0)
                .paymentMethod("CARD")
                .status("SUCCESS")
                .isDemo(true)
                .receiptUrl("/receipts/MQ-2026-9912.pdf")
                .paidAt(LocalDateTime.now().minusMinutes(15))
                .build());

        // 7. In-App Notifications for Patient A
        notificationRepository.save(PatientNotification.builder()
                .patientId(patientA.getId())
                .title("Welcome to Diksha Hospital")
                .message("Your digital pass GM-042 is active. You are #8 in queue for Dr. Priya Sharma.")
                .type("SUCCESS")
                .tokenNumber("GM-042")
                .isRead(false)
                .smsRecipient(patientA.getPhone())
                .createdAt(LocalDateTime.now().minusMinutes(25))
                .build());

        notificationRepository.save(PatientNotification.builder()
                .patientId(patientA.getId())
                .title("Payment Confirmed")
                .message("Consultation fee of ₹300 confirmed (Ref: MQ-2026-8303). Digital receipt saved.")
                .type("INFO")
                .tokenNumber("GM-042")
                .isRead(true)
                .createdAt(LocalDateTime.now().minusMinutes(24))
                .build());

        log.info("Demo data initialized successfully with patients, appointments, payments, and tokens.");
    }
}
