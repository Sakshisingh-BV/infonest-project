package com.infonest.repository;

import com.infonest.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClubRepository extends JpaRepository<Club, String> {
    // Club names ko A-Z order mein lane ke liye
    List<Club> findAllByOrderByClubNameAsc();
}