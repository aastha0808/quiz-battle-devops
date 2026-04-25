package com.quizbattle.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AnswerRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotBlank(message = "Selected option is required")
    @Pattern(regexp = "^[AaBbCcDd]$", message = "Selected option must be A, B, C, or D")
    private String selectedOption;
}