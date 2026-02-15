package com.infonest.repository;

import com.infonest.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // For checking login

    List<User> findByClubId(String clubId);

    List<User> findByRole(String role); // For getting all faculty
}