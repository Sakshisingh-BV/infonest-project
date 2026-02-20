package com.infonest.repository;

import com.infonest.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // For checking login

    Optional<User> findByResetPasswordToken(String token);

    List<User> findByClubId(String clubId);

    List<User> findByRole(String role); // For getting all faculty

    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "u.role NOT IN ('STUDENT', 'OFFICE')")
    List<User> searchManageableTeachers(@Param("query") String query);
}