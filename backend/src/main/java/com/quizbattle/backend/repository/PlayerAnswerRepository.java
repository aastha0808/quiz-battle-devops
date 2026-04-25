package com.quizbattle.backend.repository;

import com.quizbattle.backend.entity.PlayerAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlayerAnswerRepository extends JpaRepository<PlayerAnswer, Long> {

    List<PlayerAnswer> findByUserIdAndSessionId(Long userId, Long sessionId);

    List<PlayerAnswer> findBySessionId(Long sessionId);
}