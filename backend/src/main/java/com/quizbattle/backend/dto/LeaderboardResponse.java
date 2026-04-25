package com.quizbattle.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LeaderboardResponse {
    private Long userId;
    private String username;
    private int totalPoints;
}