package com.infonest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "clubs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Club {

    @Id
    @Column(name = "club_id")
    private String clubId;

    @Column(name = "club_name", nullable = false)
    private String clubName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}