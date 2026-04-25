package com.quizbattle.backend.service;

import com.quizbattle.backend.dto.QuestionRequest;
import com.quizbattle.backend.entity.Question;
import com.quizbattle.backend.entity.Quiz;
import com.quizbattle.backend.exception.ResourceNotFoundException;
import com.quizbattle.backend.repository.QuestionRepository;
import com.quizbattle.backend.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    public Question addQuestionToQuiz(Long quizId, QuestionRequest req) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));
        Question q = new Question();
        q.setQuiz(quiz);
        q.setQuestionText(req.getQuestionText());
        q.setOptionA(req.getOptionA());
        q.setOptionB(req.getOptionB());
        q.setOptionC(req.getOptionC());
        q.setOptionD(req.getOptionD());
        q.setCorrectOption(req.getCorrectOption().toUpperCase());
        q.setPoints(req.getPoints());
        return questionRepository.save(q);
    }

    public List<Question> getQuestionsByQuiz(Long quizId) {
        if (!quizRepository.existsById(quizId)) {
            throw new ResourceNotFoundException("Quiz not found with id: " + quizId);
        }
        return questionRepository.findByQuizId(quizId);
    }
}