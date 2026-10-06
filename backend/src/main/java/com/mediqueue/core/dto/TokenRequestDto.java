package com.mediqueue.core.dto;

import com.mediqueue.core.entity.QueueToken;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRequestDto {
    private Long patientId;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String patientPhone;
    private Long departmentId;
    private String departmentName;
    private String departmentCode; // "A", "C", "O", "P", "D"
    private Long doctorId;
    private String doctorName;
    private String roomNumber;
    private QueueToken.TokenSource source; // RECEPTION, MOBILE, KIOSK
    private QueueToken.TokenType tokenType; // PHYSICAL, DIGITAL
    private Double consultationFee;
    private String paymentMethod;
    private String transactionId;
}
