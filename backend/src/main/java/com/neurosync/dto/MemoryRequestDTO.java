package com.neurosync.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MemoryRequestDTO {

    private Integer issueNumber;
    private String commitHash;
    private String branch;
    private String summary;
    private Map<String, Object> metadata;
}

