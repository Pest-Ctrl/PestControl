package com.pestcontrol.backend.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "space")
public class Space {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "spaceid")
    private UUID spaceId;

    @Column(name = "ownerid", nullable = false)
    private UUID ownerId;

    @Column(name = "spacename", nullable = false)
    private String spaceName;

    @Column(name = "createdat", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Getters and Setters
}