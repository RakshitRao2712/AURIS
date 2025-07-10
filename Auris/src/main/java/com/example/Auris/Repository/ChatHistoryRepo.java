package com.example.Auris.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Auris.Model.ChatHistory;
import com.example.Auris.Model.User;

import java.util.List;


public interface ChatHistoryRepo extends JpaRepository<ChatHistory, Long>{
 List<ChatHistory> findByUser(User user);   
}
