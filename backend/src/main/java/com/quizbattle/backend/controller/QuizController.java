package com.quizbattle.backend.controller;

import com.quizbattle.backend.dto.QuizRequest;
import com.quizbattle.backend.dto.QuizResponse;
import com.quizbattle.backend.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping
    public ResponseEntity<QuizResponse> create(@Valid @RequestBody QuizRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.createQuiz(req));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizResponse>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(quizService.getQuizzesByUser(userId));
    }
}