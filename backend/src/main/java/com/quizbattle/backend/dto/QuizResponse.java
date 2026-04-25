package com.quizbattle.backend.dto;

import com.quizbattle.backend.entity.QuizStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QuizResponse {
    private Long id;
    private String title;
    private String description;
    private QuizStatus status;
    private String createdByUsername;
}