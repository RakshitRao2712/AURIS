package com.example.Auris.Repository;




import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Auris.Model.User;



public interface UserRepository extends JpaRepository<User, Long> {
     Optional<User> findByEmail(String email);
}
