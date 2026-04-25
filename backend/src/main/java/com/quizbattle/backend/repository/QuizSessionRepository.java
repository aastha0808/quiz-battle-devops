package com.quizbattle.backend.repository;

import com.quizbattle.backend.entity.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {

    // Use this if your field in QuizSession is named "sessionCode"
    Optional<QuizSession> findBySessionCode(String sessionCode);

    // Use this instead if you rename the field to "roomCode" in QuizSession
    // Optional<QuizSession> findByRoomCode(String roomCode);
}