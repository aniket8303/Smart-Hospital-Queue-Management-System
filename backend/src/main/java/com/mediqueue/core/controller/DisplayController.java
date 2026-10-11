package com.mediqueue.core.controller;

import com.mediqueue.core.entity.QueueToken;
import com.mediqueue.core.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/display")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DisplayController {

    private final QueueService queueService;

    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> getPublicDisplayFeed(
            @RequestParam(required = false) Long departmentId) {

        List<QueueToken> active = queueService.getActiveQueue(LocalDate.now());

        if (departmentId != null) {
            active = active.stream()
                    .filter(t -> t.getDepartmentId().equals(departmentId))
                    .toList();
        }

        // Find Now Serving
        QueueToken nowServingToken = active.stream()
                .filter(t -> t.getStatus() == QueueToken.QueueStatus.IN_CONSULTATION)
                .findFirst()
                .orElse(active.isEmpty() ? null : active.get(0));

        // Find Next in Line
        QueueToken nextToken = active.stream()
                .filter(t -> t.getStatus() == QueueToken.QueueStatus.NEXT)
                .findFirst()
                .orElse(active.size() > 1 ? active.get(1) : null);

        // Upcoming Standby (strictly tokenNumber and estimatedWaitMinutes only - NO PATIENT NAMES)
        List<Map<String, Object>> upcoming = active.stream()
                .filter(t -> (nowServingToken == null || !t.getId().equals(nowServingToken.getId()))
                          && (nextToken == null || !t.getId().equals(nextToken.getId())))
                .limit(5)
                .map(t -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("tokenNumber", t.getTokenNumber());
                    item.put("departmentName", t.getDepartmentName());
                    item.put("estimatedWaitMinutes", t.getEstimatedWaitMinutes());
                    return item;
                })
                .toList();

        Map<String, Object> feed = new HashMap<>();
        feed.put("hospitalName", "Diksha Hospital");
        feed.put("opdWing", "OPD Wing A");
        feed.put("timestamp", new Date().toString());

        if (nowServingToken != null) {
            Map<String, Object> servingData = new HashMap<>();
            servingData.put("tokenNumber", nowServingToken.getTokenNumber());
            servingData.put("departmentName", nowServingToken.getDepartmentName());
            servingData.put("doctorName", nowServingToken.getDoctorName());
            servingData.put("roomNumber", nowServingToken.getRoomNumber());
            feed.put("nowServing", servingData);
        } else {
            feed.put("nowServing", null);
        }

        if (nextToken != null) {
            Map<String, Object> nextData = new HashMap<>();
            nextData.put("tokenNumber", nextToken.getTokenNumber());
            nextData.put("departmentName", nextToken.getDepartmentName());
            nextData.put("roomNumber", nextToken.getRoomNumber());
            feed.put("nextInLine", nextData);
        } else {
            feed.put("nextInLine", null);
        }

        feed.put("upcomingTokens", upcoming);
        feed.put("privacyPreserved", true);

        return ResponseEntity.ok(feed);
    }
}
