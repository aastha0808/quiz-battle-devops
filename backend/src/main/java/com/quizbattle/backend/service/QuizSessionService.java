package com.quizbattle.backend.service;

import com.quizbattle.backend.entity.Quiz;
import com.quizbattle.backend.entity.QuizSession;
import com.quizbattle.backend.entity.QuizStatus;
import com.quizbattle.backend.entity.SessionStatus;
import com.quizbattle.backend.exception.BadRequestException;
import com.quizbattle.backend.exception.ResourceNotFoundException;
import com.quizbattle.backend.repository.QuizRepository;
import com.quizbattle.backend.repository.QuizSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizSessionService {

    private final QuizSessionRepository quizSessionRepository;
    private final QuizRepository quizRepository;

    public QuizSession startSession(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));
        if (quiz.getStatus() == QuizStatus.ENDED) {
            throw new BadRequestException("Cannot start a session for an already ended quiz.");
        }
        String roomCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        QuizSession session = new QuizSession();
        session.setQuiz(quiz);
        session.setSessionCode(roomCode);
        session.setStatus(SessionStatus.ACTIVE);
        session.setStartedAt(LocalDateTime.now());
        quiz.setStatus(QuizStatus.STARTED);
        quizRepository.save(quiz);
        return quizSessionRepository.save(session);
    }

    public QuizSession joinSession(String roomCode) {
        QuizSession session = quizSessionRepository.findBySessionCode(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("No session found with room code: " + roomCode));
        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new BadRequestException("Session is not active. Current status: " + session.getStatus());
        }
        return session;
    }

    public QuizSession endSession(Long sessionId) {
        QuizSession session = quizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));
        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new BadRequestException("Session is already completed.");
        }
        session.setStatus(SessionStatus.COMPLETED);
        session.setEndedAt(LocalDateTime.now());
        Quiz quiz = session.getQuiz();
        quiz.setStatus(QuizStatus.ENDED);
        quizRepository.save(quiz);
        return quizSessionRepository.save(session);
    }

    // Reusable by PlayerAnswerService
    public QuizSession getSessionEntityById(Long sessionId) {
        return quizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));
    }
}