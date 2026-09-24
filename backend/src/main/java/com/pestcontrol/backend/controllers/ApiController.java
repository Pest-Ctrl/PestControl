package com.pestcontrol.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pestcontrol.backend.entities.*;
import com.pestcontrol.backend.repositories.*;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ApiController {

    @Autowired private UserRepository userRepository;
    @Autowired private RepoRepository repoRepository;
    @Autowired private IssueRepository issueRepository;
    @Autowired private CommitRepository commitRepository;
    @Autowired private SpaceRepository spaceRepository;
    @Autowired private AuditLogRepository auditLogRepository;

    @GetMapping("/repos")
    public List<Repo> getRepos() {
        return repoRepository.findAllByOrderByImportedAtDesc();
    }

    @PostMapping("/repos")
    public Repo createRepo(@RequestBody Repo repo) {
        return repoRepository.save(repo);
    }

    @GetMapping("/commits")
    public List<Commit> getCommits() {
        return commitRepository.findAll();
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @GetMapping("/issues")
    public List<Issue> getIssues() {
        return issueRepository.findAll();
    }

    @PostMapping("/issues")
    public Issue createIssue(@RequestBody Issue issue) {
        return issueRepository.save(issue);
    }

    @GetMapping("/issues/{id}")
    public Issue getIssue(@PathVariable UUID id) {
        return issueRepository.findById(id).orElse(null);
    }

    @PutMapping("/issues/{id}")
    public Issue updateIssue(@PathVariable UUID id, @RequestBody Issue issueDetails) {
        Issue issue = issueRepository.findById(id).orElse(null);
        if (issue != null) {
            issue.setStatus(issueDetails.getStatus());
            // Update other fields as necessary
            return issueRepository.save(issue);
        }
        return null;
    }

    @GetMapping("/audit")
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAll();
    }
}
