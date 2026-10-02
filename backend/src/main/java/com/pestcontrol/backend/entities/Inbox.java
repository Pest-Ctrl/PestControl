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
@Table(name = "inbox")
public class Inbox {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "notifid")
    private UUID notifId;

    @Column(name = "userid", nullable = false)
    private UUID userId;

    @Column(name = "notiftitle", nullable = false)
    private String notifTitle;

    @Column(name = "notifdesc", nullable = false, columnDefinition="TEXT")
    private String notifDesc;

    @Column(name = "isread")
    private boolean isRead = false;

    @Column(name = "createdat", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Getters and Setters
    public UUID getNotifId() { return notifId; }
    public void setNotifId(UUID notifId) { this.notifId = notifId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getNotifTitle() { return notifTitle; }
    public void setNotifTitle(String notifTitle) { this.notifTitle = notifTitle; }

    public String getNotifDesc() { return notifDesc; }
    public void setNotifDesc(String notifDesc) { this.notifDesc = notifDesc; }

    public boolean getIsRead() { return isRead; }
    public void setIsRead(boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
