package com.quizbattle.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "player_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chosen_option", nullable = false, length = 1)
    private String chosenOption;    // "A", "B", "C", or "D"

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "points_awarded", nullable = false)
    private Integer pointsAwarded = 0;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private QuizSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
}