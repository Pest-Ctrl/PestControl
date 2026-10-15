package com.pestcontrol.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pestcontrol.backend.entities.*;
import com.pestcontrol.backend.repositories.*;
import com.pestcontrol.backend.services.AuditLogService;

import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;
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
    public List<Commit> getCommits(@RequestParam(value = "repoId", required = false) UUID repoId) {
        if (repoId != null) {
            return commitRepository.findByRepoIdOrderByCommittedAtDesc(repoId);
        }
        return commitRepository.findAll();
    }

    @PostMapping("/commits")
    public Commit createCommit(@RequestBody Commit commit) {
        return commitRepository.save(commit);
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    // The createUser method was removed to avoid duplicate POST /users mapping

    @PutMapping("/users/{id}/role")
    public User updateUserRole(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null && body.containsKey("role")) {
            user.setRole(User.fromString(body.get("role")));
            return userRepository.save(user);
        }
        return null;
    }

    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            if (body.containsKey("ghOAuth")) {
                Object ghVal = body.get("ghOAuth");
                user.setGhOAuth(ghVal != null && !ghVal.toString().isBlank() ? ghVal.toString() : null);
            }
            if (body.containsKey("username")) {
                Object uVal = body.get("username");
                if (uVal != null && !uVal.toString().isBlank()) {
                    user.setUsername(uVal.toString());
                }
            }
            if (body.containsKey("passHash")) {
                Object pVal = body.get("passHash");
                if (pVal != null && !pVal.toString().isBlank()) {
                    user.setPassHash(pVal.toString());
                }
            }
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

        createNotification(savedIssue.getAssigneeId(), savedIssue.getReporterId(), 
                "New Issue Assigned", 
                "You have been assigned to a new issue: " + savedIssue.getTitle());

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
                        
                createNotification(issue.getAssigneeId(), actorId, 
                        "Issue Status Changed", 
                        "Status changed to " + newStatus.name() + " for issue: " + issue.getTitle());
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
            
            UUID oldAssigneeId = issue.getAssigneeId();
            if (newAssigneeId == null || !newAssigneeId.equals(oldAssigneeId)) {
                issue.setAssigneeId(newAssigneeId);
                auditLogService.logIssueReassigned(
                        actorId, issue.getSpaceId(), issue.getIssueId(),
                        newAssigneeId == null ? "Issue unassigned" : "Issue reassigned");
                        
                if (newAssigneeId != null) {
                    createNotification(newAssigneeId, actorId, 
                            "Issue Assigned", 
                            "You have been assigned to issue: " + issue.getTitle());
                }
            }
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

    @PutMapping("/spaces/{id}")
    public ResponseEntity<?> updateSpace(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Space space = spaceRepository.findById(id).orElse(null);
        if (space == null) {
            return ResponseEntity.notFound().build();
        }
        if (body.containsKey("spaceName") && body.get("spaceName") != null) {
            space.setSpaceName(body.get("spaceName").toString());
        }
        return ResponseEntity.ok(spaceRepository.save(space));
    }

    @DeleteMapping("/spaces/{id}")
    @Transactional
    public ResponseEntity<?> deleteSpace(@PathVariable UUID id) {
        if (!spaceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // Delete issues for this space
        List<Issue> issues = issueRepository.findBySpaceIdOrderByCreatedAtDesc(id);
        if (issues != null && !issues.isEmpty()) {
            issueRepository.deleteAll(issues);
        }
        // Delete audit logs for this space
        List<AuditLog> auditLogs = auditLogRepository.findBySpaceIdOrderByAuditTimeDesc(id);
        if (auditLogs != null && !auditLogs.isEmpty()) {
            auditLogRepository.deleteAll(auditLogs);
        }
        // Delete repos and commits belonging to this space
        List<Repo> allRepos = repoRepository.findAll();
        for (Repo r : allRepos) {
            if (id.equals(r.getSpaceId())) {
                List<Commit> commits = commitRepository.findByRepoIdOrderByCommittedAtDesc(r.getRepoId());
                if (commits != null && !commits.isEmpty()) {
                    commitRepository.deleteAll(commits);
                }
                repoRepository.delete(r);
            }
        }
        spaceRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Space deleted successfully"));
    }

    @DeleteMapping("/commits")
    @Transactional
    public ResponseEntity<?> clearCommits(@RequestParam("repoId") UUID repoId) {
        List<Commit> commits = commitRepository.findByRepoIdOrderByCommittedAtDesc(repoId);
        int count = commits != null ? commits.size() : 0;
        if (commits != null && !commits.isEmpty()) {
            commitRepository.deleteAll(commits);
        }
        return ResponseEntity.ok(Map.of("message", "Commits cleared successfully", "cleared", count));
    }

    private void createNotification(UUID targetUserId, UUID actorId, String title, String desc) {
        if (targetUserId != null && !targetUserId.equals(actorId)) {
            Inbox notif = new Inbox();
            notif.setUserId(targetUserId);
            notif.setNotifTitle(title);
            notif.setNotifDesc(desc);
            inboxRepository.save(notif);
        }
    }

    @PostMapping("/users")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.containsKey("password") ? body.get("password") : body.get("passHash");
        String role = body.get("role");

        if (username == null || email == null || password == null || role == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }
        User.UserRole userRole;
        try{
            userRole = User.fromString(role);
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body("Invalid role");
        }

        // Check if username or email already exists (case-insensitive for email)
        if(userRepository.existsByUsername(username)){
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if(userRepository.existsByEmail(email)){
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setEmail(email);
        newUser.setPassHash(password);
        newUser.setRole(userRole);

        User savedUser = userRepository.save(newUser);
        return ResponseEntity.status(201).body(savedUser);
    }
}
