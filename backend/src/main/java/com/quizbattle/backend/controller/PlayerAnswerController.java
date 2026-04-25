package com.quizbattle.backend.controller;

import com.quizbattle.backend.dto.AnswerRequest;
import com.quizbattle.backend.dto.LeaderboardResponse;
import com.quizbattle.backend.entity.PlayerAnswer;
import com.quizbattle.backend.service.PlayerAnswerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
public class PlayerAnswerController {

    private final PlayerAnswerService playerAnswerService;

    @PostMapping("/submit")
    public ResponseEntity<PlayerAnswer> submit(@Valid @RequestBody AnswerRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(playerAnswerService.submitAnswer(req));
    }

    @GetMapping("/score/{sessionId}")
    public ResponseEntity<Integer> score(@PathVariable Long sessionId) {
        return ResponseEntity.ok(playerAnswerService.calculateScore(sessionId));
    }

    @GetMapping("/leaderboard/{sessionId}")
    public ResponseEntity<List<LeaderboardResponse>> leaderboard(@PathVariable Long sessionId) {
        return ResponseEntity.ok(playerAnswerService.getLeaderboard(sessionId));
    }
}