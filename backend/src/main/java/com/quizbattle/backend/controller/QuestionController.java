package com.quizbattle.backend.controller;

import com.quizbattle.backend.dto.QuestionRequest;
import com.quizbattle.backend.entity.Question;
import com.quizbattle.backend.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping("/{quizId}")
    public ResponseEntity<Question> add(@PathVariable Long quizId,
                                        @Valid @RequestBody QuestionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(questionService.addQuestionToQuiz(quizId, req));
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<List<Question>> getAll(@PathVariable Long quizId) {
        return ResponseEntity.ok(questionService.getQuestionsByQuiz(quizId));
    }
}