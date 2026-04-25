package com.quizbattle.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class QuestionRequest {

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotBlank(message = "Option A is required")
    private String optionA;

    @NotBlank(message = "Option B is required")
    private String optionB;

    @NotBlank(message = "Option C is required")
    private String optionC;

    @NotBlank(message = "Option D is required")
    private String optionD;

    @NotBlank(message = "Correct option is required")
    @Pattern(regexp = "^[AaBbCcDd]$", message = "Correct option must be A, B, C, or D")
    private String correctOption;

    @NotNull(message = "Points value is required")
    @Min(value = 1, message = "Points must be at least 1")
    private Integer points;
}