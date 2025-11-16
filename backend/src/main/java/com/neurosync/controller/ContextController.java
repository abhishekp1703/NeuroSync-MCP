package com.neurosync.controller;

import com.neurosync.dto.ContextDTO;
import com.neurosync.dto.MemoryRequestDTO;
import com.neurosync.entity.DeveloperContext;
import com.neurosync.service.ContextService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ContextController {

    private final ContextService contextService;

    @GetMapping("/context")
    public ResponseEntity<ContextDTO> getContext(
            @RequestParam(required = false) String branch
    ) {
        log.info("GET /api/context - branch: {}", branch);
        ContextDTO context = contextService.getAggregatedContext(branch);
        return ResponseEntity.ok(context);
    }

    @PostMapping("/memory")
    public ResponseEntity<DeveloperContext> saveMemory(@Valid @RequestBody MemoryRequestDTO request) {
        log.info("POST /api/memory - request: {}", request);
        DeveloperContext context = contextService.saveContext(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(context);
    }

    @GetMapping("/memory")
    public ResponseEntity<List<ContextDTO.ContextSnapshot>> getMemory(
            @RequestParam(required = false) String branch,
            @RequestParam(defaultValue = "24") int hours
    ) {
        log.info("GET /api/memory - branch: {}, hours: {}", branch, hours);
        List<ContextDTO.ContextSnapshot> snapshots = contextService.getContextHistory(branch, hours);
        return ResponseEntity.ok(snapshots);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}

