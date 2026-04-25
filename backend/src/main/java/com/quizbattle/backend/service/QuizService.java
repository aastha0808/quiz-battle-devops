package com.quizbattle.backend.service;

import com.quizbattle.backend.dto.QuizRequest;
import com.quizbattle.backend.dto.QuizResponse;
import com.quizbattle.backend.entity.Quiz;
import com.quizbattle.backend.entity.QuizStatus;
import com.quizbattle.backend.entity.User;
import com.quizbattle.backend.exception.ResourceNotFoundException;
import com.quizbattle.backend.repository.QuizRepository;
import com.quizbattle.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final UserRepository userRepository;

    public QuizResponse createQuiz(QuizRequest req) {
        User creator = userRepository.findById(req.getCreatedById())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + req.getCreatedById()));
        Quiz quiz = new Quiz();
        quiz.setTitle(req.getTitle());
        quiz.setDescription(req.getDescription());
        quiz.setStatus(QuizStatus.CREATED);
        quiz.setCreatedBy(creator);
        return toResponse(quizRepository.save(quiz));
    }

    public List<QuizResponse> getQuizzesByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return quizRepository.findByCreatedById(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Reusable by QuizSessionService
    public Quiz getQuizEntityById(Long quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));
    }

    private QuizResponse toResponse(Quiz quiz) {
        return new QuizResponse(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getStatus(),
                quiz.getCreatedBy().getUsername()
        );
    }
}