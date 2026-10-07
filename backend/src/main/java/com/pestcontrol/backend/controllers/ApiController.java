package com.pestcontrol.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pestcontrol.backend.entities.*;
import com.pestcontrol.backend.repositories.*;
import com.pestcontrol.backend.services.AuditLogService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ApiController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RepoRepository repoRepository;
    @Autowired
    private IssueRepository issueRepository;
    @Autowired
    private CommitRepository commitRepository;
    @Autowired
    private AuditLogRepository auditLogRepository;
    @Autowired
    private InboxRepository inboxRepository;
    @Autowired
    private SpaceRepository spaceRepository;
    @Autowired
    private AuditLogService auditLogService;

    @GetMapping("/inbox")
    public List<Inbox> getInbox(@RequestParam("userId") UUID userId) {
        return inboxRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PatchMapping("/inbox/{id}")
    public Inbox markInboxRead(@PathVariable UUID id) {
        Inbox inbox = inboxRepository.findById(id).orElse(null);
        if (inbox != null) {
            inbox.setIsRead(true);
            return inboxRepository.save(inbox);
        }
        return null;
    }

    @GetMapping("/repos")
    public List<Repo> getRepos() {
        return repoRepository.findAllByOrderByImportedAtDesc();
    }

    @PostMapping("/repos")
    public ResponseEntity<?> createRepo(@RequestBody Repo repo) {
        Repo savedRepo = repoRepository.save(repo);

        // Audit log: repository imported
        auditLogService.logRepoImported(
                repo.getImportedBy(),
                repo.getSpaceId(),
                repo.getGhOwner(),
                repo.getGhName());

        return ResponseEntity.status(201).body(savedRepo);
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

    @PutMapping("/users/{id}/role")
    public User updateUserRole(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null && body.containsKey("role")) {
            user.setRole(User.fromString(body.get("role")));
            return userRepository.save(user);
        }
        return null;
    }

    @GetMapping("/issues")
    public List<Issue> getIssues() {
        return issueRepository.findAll();
    }

    @PostMapping("/issues")
    public ResponseEntity<?> createIssue(@RequestBody Issue issue) {
        Issue savedIssue = issueRepository.save(issue);

        // Audit log: issue created
        auditLogService.logIssueCreated(
                issue.getReporterId(),
                issue.getSpaceId(),
                savedIssue.getIssueId(),
                issue.getTitle());

        return ResponseEntity.status(201).body(savedIssue);
    }

    @GetMapping("/issues/{id}")
    public Issue getIssue(@PathVariable UUID id) {
        return issueRepository.findById(id).orElse(null);
    }

    @PutMapping("/issues/{id}")
    public ResponseEntity<?> updateIssue(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Issue issue = issueRepository.findById(id).orElse(null);
        if (issue == null) {
            return ResponseEntity.notFound().build();
        }

        UUID actorId = issue.getReporterId();
        if (body.containsKey("userId")) {
            actorId = UUID.fromString(body.get("userId").toString());
        }

        // Track severity change
        if (body.containsKey("severity")) {
            String newSeverityStr = body.get("severity").toString();
            Issue.SeverityStatus newSeverity = Issue.fromStringSeverityStatus(newSeverityStr);
            Issue.SeverityStatus oldSeverity = issue.getSeverity();
            if (!newSeverity.equals(oldSeverity)) {
                auditLogService.logSeverityChanged(
                        actorId, issue.getSpaceId(), issue.getIssueId(),
                        oldSeverity != null ? oldSeverity.name() : null, newSeverity.name());
            }
            issue.setSeverity(newSeverity);
        }

        // Track deadline change
        if (body.containsKey("deadline")) {
            Object deadlineValue = body.get("deadline");
            LocalDateTime newDeadline = null;
            if (deadlineValue != null && !deadlineValue.toString().isBlank()) {
                newDeadline = LocalDateTime.parse(deadlineValue.toString());
            }
            LocalDateTime oldDeadline = issue.getDeadline();
            boolean changed = (oldDeadline == null && newDeadline != null)
                    || (oldDeadline != null && !oldDeadline.equals(newDeadline));
            if (changed) {
                auditLogService.logDueDateChanged(
                        actorId, issue.getSpaceId(), issue.getIssueId(),
                        oldDeadline != null ? oldDeadline.toString() : null,
                        newDeadline != null ? newDeadline.toString() : null);
            }
            issue.setDeadline(newDeadline);
        }

        // Track status change
        if (body.containsKey("status")) {
            String newStatusStr = body.get("status").toString();
            Issue.IssueStatus newStatus = Issue.fromStringIssueStatus(newStatusStr);
            Issue.IssueStatus oldStatus = issue.getStatus();
            if (!newStatus.equals(oldStatus)) {
                auditLogService.logStatusChanged(
                        actorId, issue.getSpaceId(), issue.getIssueId(),
                        oldStatus != null ? oldStatus.name() : null, newStatus.name());
            }
            issue.setStatus(newStatus);
        }

        // Handle assignee change
        if (body.containsKey("assigneeId")) {
            Object assigneeValue = body.get("assigneeId");
            UUID newAssigneeId = null;
            if (assigneeValue != null && !assigneeValue.toString().isBlank()) {
                newAssigneeId = UUID.fromString(assigneeValue.toString());
            }
            issue.setAssigneeId(newAssigneeId);
            auditLogService.logIssueReassigned(
                    actorId, issue.getSpaceId(), issue.getIssueId(),
                    "Issue reassigned");
        }

        Issue savedIssue = issueRepository.save(issue);
        return ResponseEntity.ok(savedIssue);
    }

    // Audit Log endpoints

    @GetMapping("/audit")
    public List<AuditLog> getAuditLogs(
            @RequestParam(value = "spaceId", required = false) UUID spaceId,
            @RequestParam(value = "issueId", required = false) UUID issueId) {
        if (issueId != null) {
            return auditLogRepository.findByIssueIdOrderByAuditTimeDesc(issueId);
        }
        if (spaceId != null) {
            return auditLogRepository.findBySpaceIdOrderByAuditTimeDesc(spaceId);
        }
        return auditLogRepository.findAll();
    }

    @PostMapping("/audit")
    public ResponseEntity<?> createAuditLog(@RequestBody Map<String, String> body) {
        String userIdStr = body.get("userId");
        String spaceIdStr = body.get("spaceId");
        String issueIdStr = body.get("issueId");
        String auditTitle = body.get("auditTitle");
        String auditDesc = body.get("auditDesc");

        if (userIdStr == null || spaceIdStr == null || auditTitle == null || auditDesc == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "userId, spaceId, auditTitle, and auditDesc are required"));
        }

        UUID userId = UUID.fromString(userIdStr);
        UUID spaceId = UUID.fromString(spaceIdStr);
        UUID issueId = (issueIdStr != null && !issueIdStr.isBlank()) ? UUID.fromString(issueIdStr) : null;

        AuditLog log = auditLogService.createEntry(userId, spaceId, issueId, auditTitle, auditDesc);
        return ResponseEntity.status(201).body(log);
    }

    // Space / Workspace endpoints
    @GetMapping("/spaces")
    public List<Space> getSpaces() {
        return spaceRepository.findAll();
    }

    @PostMapping("/spaces")
    public Space createSpace(@RequestBody Space space) {
        return spaceRepository.save(space);
    }
}
