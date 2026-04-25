package com.quizbattle.backend.controller;

import com.quizbattle.backend.entity.QuizSession;
import com.quizbattle.backend.service.QuizSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class QuizSessionController {

    private final QuizSessionService quizSessionService;

    @PostMapping("/start/{quizId}")
    public ResponseEntity<QuizSession> start(@PathVariable Long quizId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizSessionService.startSession(quizId));
    }

    @PostMapping("/join/{roomCode}")
    public ResponseEntity<QuizSession> join(@PathVariable String roomCode) {
        return ResponseEntity.ok(quizSessionService.joinSession(roomCode));
    }

    @PostMapping("/end/{sessionId}")
    public ResponseEntity<QuizSession> end(@PathVariable Long sessionId) {
        return ResponseEntity.ok(quizSessionService.endSession(sessionId));
    }
}