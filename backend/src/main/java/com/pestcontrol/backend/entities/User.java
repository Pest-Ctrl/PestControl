package com.pestcontrol.backend.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import com.pestcontrol.backend.exceptions.InvalidRoleException;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    public enum UserRole
    {
        Developer, QAEngineer, RepoImporter, Admin
    }

    public static UserRole fromString(String text)
    {
        for (UserRole r : UserRole.values()) 
        {
            if (r.name().equalsIgnoreCase(text))
            {
                return r;
            }
        }
        throw new InvalidRoleException("Invalid Role Mentioned!");
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "userid")
    private UUID userId;

    @Column(name = "username", unique = false, nullable = false)
    private String username;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "passhash")
    private String passHash;

    @Column(name = "ghoauth")
    private String ghOAuth;

    @Column(name = "createdat", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role = UserRole.Developer;

    // Getters and Setters
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassHash() { return passHash; }
    public void setPassHash(String passHash) { this.passHash = passHash; }

    public String getGHOAuth() { return ghOAuth; }
    public void setGHOAuth(String ghOAuth) { this.ghOAuth = ghOAuth; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
}