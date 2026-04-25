package com.quizbattle.backend.service;

import com.quizbattle.backend.dto.AnswerRequest;
import com.quizbattle.backend.dto.LeaderboardResponse;
import com.quizbattle.backend.entity.*;
import com.quizbattle.backend.exception.BadRequestException;
import com.quizbattle.backend.exception.ResourceNotFoundException;
import com.quizbattle.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlayerAnswerService {

    private final PlayerAnswerRepository playerAnswerRepository;
    private final UserRepository userRepository;
    private final QuizSessionRepository quizSessionRepository;
    private final QuestionRepository questionRepository;

    public PlayerAnswer submitAnswer(AnswerRequest req) {
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + req.getUserId()));

        QuizSession session = quizSessionRepository.findById(req.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + req.getSessionId()));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new BadRequestException("Cannot submit answer. Session is not active.");
        }

        Question question = questionRepository.findById(req.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + req.getQuestionId()));

        boolean alreadyAnswered = playerAnswerRepository
                .findByUserIdAndSessionId(req.getUserId(), req.getSessionId())
                .stream()
                .anyMatch(a -> a.getQuestion().getId().equals(req.getQuestionId()));

        if (alreadyAnswered) {
            throw new BadRequestException("User has already answered this question in the session.");
        }

        boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(req.getSelectedOption());
        int points = isCorrect ? question.getPoints() : 0;

        PlayerAnswer answer = new PlayerAnswer();
        answer.setUser(user);
        answer.setSession(session);
        answer.setQuestion(question);
        answer.setChosenOption(req.getSelectedOption().toUpperCase());
        answer.setIsCorrect(isCorrect);
        answer.setPointsAwarded(points);
        answer.setAnsweredAt(LocalDateTime.now());

        return playerAnswerRepository.save(answer);
    }

    public int calculateScore(Long sessionId) {
        if (!quizSessionRepository.existsById(sessionId)) {
            throw new ResourceNotFoundException("Session not found with id: " + sessionId);
        }
        return playerAnswerRepository.findBySessionId(sessionId)
                .stream()
                .mapToInt(PlayerAnswer::getPointsAwarded)
                .sum();
    }

    public List<LeaderboardResponse> getLeaderboard(Long sessionId) {
        if (!quizSessionRepository.existsById(sessionId)) {
            throw new ResourceNotFoundException("Session not found with id: " + sessionId);
        }
        List<PlayerAnswer> answers = playerAnswerRepository.findBySessionId(sessionId);

        // Group by user, sum points, sort descending
        Map<User, Integer> scoreMap = new LinkedHashMap<>();
        for (PlayerAnswer a : answers) {
            scoreMap.merge(a.getUser(), a.getPointsAwarded(), Integer::sum);
        }

        return scoreMap.entrySet().stream()
                .sorted(Map.Entry.<User, Integer>comparingByValue().reversed())
                .map(e -> new LeaderboardResponse(
                        e.getKey().getId(),
                        e.getKey().getUsername(),
                        e.getValue()
                ))
                .collect(Collectors.toList());
    }
}