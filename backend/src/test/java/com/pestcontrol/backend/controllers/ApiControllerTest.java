package com.pestcontrol.backend.controllers;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.pestcontrol.backend.entities.AuditLog;
import com.pestcontrol.backend.entities.Commit;
import com.pestcontrol.backend.entities.Inbox;
import com.pestcontrol.backend.entities.Issue;
import com.pestcontrol.backend.entities.Repo;
import com.pestcontrol.backend.entities.Space;
import com.pestcontrol.backend.entities.User;
import com.pestcontrol.backend.repositories.AuditLogRepository;
import com.pestcontrol.backend.repositories.CommitRepository;
import com.pestcontrol.backend.repositories.InboxRepository;
import com.pestcontrol.backend.repositories.IssueRepository;
import com.pestcontrol.backend.repositories.RepoRepository;
import com.pestcontrol.backend.repositories.SpaceRepository;
import com.pestcontrol.backend.repositories.UserRepository;
import com.pestcontrol.backend.services.AuditLogService;

@ExtendWith(MockitoExtension.class)
class ApiControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RepoRepository repoRepository;

    @Mock
    private IssueRepository issueRepository;

    @Mock
    private CommitRepository commitRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private InboxRepository inboxRepository;

    @Mock
    private SpaceRepository spaceRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ApiController apiController;

    private final UUID testSpaceId = UUID.randomUUID();
    private final UUID testRepoId = UUID.randomUUID();
    private final UUID testIssueId = UUID.randomUUID();

    @Test
    @DisplayName("Compliance: GET /api/repos returns list of repositories")
    void testGetReposReturnsList() {
        Repo repo1 = new Repo();
        repo1.setRepoId(testRepoId);
        repo1.setGhName("Repo-A");
        repo1.setGhOwner("octocat");

        when(repoRepository.findAllByOrderByImportedAtDesc()).thenReturn(List.of(repo1));

        List<Repo> result = apiController.getRepos();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Repo-A", result.get(0).getGhName());
        verify(repoRepository, times(1)).findAllByOrderByImportedAtDesc();
    }

    @Test
    @DisplayName("Compliance: GET /api/commits with repoId returns commits sorted descending")
    void testGetCommitsFilteredByRepoId() {
        Commit commit = new Commit();
        commit.setCommitId("c-123456");
        commit.setRepoId(testRepoId);
        commit.setMessage("Initial commit");

        when(commitRepository.findByRepoIdOrderByCommittedAtDesc(testRepoId)).thenReturn(List.of(commit));

        List<Commit> result = apiController.getCommits(testRepoId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("c-123456", result.get(0).getCommitId());
        verify(commitRepository, times(1)).findByRepoIdOrderByCommittedAtDesc(testRepoId);
    }

    @Test
    @DisplayName("Compliance: POST /api/commits/batch saves new commits and ignores duplicates")
    void testCreateCommitsBatchDeduplication() {
        String existingSha = "sha-existing";
        String newSha = "sha-new";

        Map<String, Object> existingCommitMap = new HashMap<>();
        existingCommitMap.put("commitId", existingSha);
        existingCommitMap.put("repoId", testRepoId.toString());
        existingCommitMap.put("message", "Already imported");

        Map<String, Object> newCommitMap = new HashMap<>();
        newCommitMap.put("commitId", newSha);
        newCommitMap.put("repoId", testRepoId.toString());
        newCommitMap.put("message", "New incoming commit");

        when(commitRepository.existsById(existingSha)).thenReturn(true);
        when(commitRepository.existsById(newSha)).thenReturn(false);

        ResponseEntity<?> response = apiController.createCommitsBatch(List.of(existingCommitMap, newCommitMap));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
        assertNotNull(responseBody);
        assertEquals(1, responseBody.get("saved"));
        assertEquals(2, responseBody.get("total"));

        verify(commitRepository, times(1)).save(any(Commit.class));
    }

    @Test
    @DisplayName("Compliance: POST /api/issues creates issue, logs audit trail and sends notification")
    void testCreateIssueCompliance() {
        UUID reporterId = UUID.randomUUID();
        UUID assigneeId = UUID.randomUUID();

        Issue issue = new Issue();
        issue.setTitle("Null pointer exception in login");
        issue.setReporterId(reporterId);
        issue.setAssigneeId(assigneeId);
        issue.setSpaceId(testSpaceId);
        issue.setSeverity(Issue.SeverityStatus.High);
        issue.setStatus(Issue.IssueStatus.Open);

        Issue savedIssue = new Issue();
        savedIssue.setIssueId(testIssueId);
        savedIssue.setTitle("Null pointer exception in login");
        savedIssue.setReporterId(reporterId);
        savedIssue.setAssigneeId(assigneeId);
        savedIssue.setSpaceId(testSpaceId);

        when(issueRepository.save(any(Issue.class))).thenReturn(savedIssue);

        ResponseEntity<?> response = apiController.createIssue(issue);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(issueRepository, times(1)).save(issue);
        verify(auditLogService, times(1)).logIssueCreated(reporterId, testSpaceId, testIssueId, "Null pointer exception in login");
        verify(inboxRepository, times(1)).save(any(Inbox.class));
    }

    @Test
    @DisplayName("Compliance: PUT /api/issues/{id} status change records audit log and alerts assignee")
    void testUpdateIssueStatusCompliance() {
        UUID reporterId = UUID.randomUUID();
        UUID assigneeId = UUID.randomUUID();

        Issue existingIssue = new Issue();
        existingIssue.setIssueId(testIssueId);
        existingIssue.setTitle("Fix auth header bug");
        existingIssue.setReporterId(reporterId);
        existingIssue.setAssigneeId(assigneeId);
        existingIssue.setSpaceId(testSpaceId);
        existingIssue.setStatus(Issue.IssueStatus.Open);

        when(issueRepository.findById(testIssueId)).thenReturn(Optional.of(existingIssue));
        when(issueRepository.save(any(Issue.class))).thenAnswer(i -> i.getArgument(0));

        Map<String, Object> updateBody = new HashMap<>();
        updateBody.put("status", "Resolved");
        updateBody.put("userId", reporterId.toString());

        ResponseEntity<?> response = apiController.updateIssue(testIssueId, updateBody);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Issue.IssueStatus.Resolved, existingIssue.getStatus());

        verify(auditLogService, times(1)).logStatusChanged(
                reporterId, testSpaceId, testIssueId, "Open", "Resolved"
        );
        verify(inboxRepository, times(1)).save(any(Inbox.class));
    }

    @Test
    @DisplayName("Compliance: POST /api/users rejects missing mandatory credentials")
    void testRegisterUserMissingFieldsCompliance() {
        Map<String, String> invalidUser = new HashMap<>();
        invalidUser.put("username", "testuser");
        // missing email and password/ghOAuth

        ResponseEntity<?> response = apiController.registerUser(invalidUser);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Missing required fields", response.getBody());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Compliance: DELETE /api/spaces/{id} cascades deletion of issues, audit logs, and repos")
    void testDeleteSpaceCascadesDeletion() {
        when(spaceRepository.existsById(testSpaceId)).thenReturn(true);

        Issue issue = new Issue();
        issue.setIssueId(testIssueId);
        when(issueRepository.findBySpaceIdOrderByCreatedAtDesc(testSpaceId)).thenReturn(List.of(issue));

        AuditLog log = new AuditLog();
        when(auditLogRepository.findBySpaceIdOrderByAuditTimeDesc(testSpaceId)).thenReturn(List.of(log));

        Repo repo = new Repo();
        repo.setRepoId(testRepoId);
        repo.setSpaceId(testSpaceId);
        when(repoRepository.findAll()).thenReturn(List.of(repo));

        Commit commit = new Commit();
        commit.setCommitId("c-1");
        when(commitRepository.findByRepoIdOrderByCommittedAtDesc(testRepoId)).thenReturn(List.of(commit));

        ResponseEntity<?> response = apiController.deleteSpace(testSpaceId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(issueRepository, times(1)).deleteAll(List.of(issue));
        verify(auditLogRepository, times(1)).deleteAll(List.of(log));
        verify(commitRepository, times(1)).deleteAll(List.of(commit));
        verify(repoRepository, times(1)).delete(repo);
        verify(spaceRepository, times(1)).deleteById(testSpaceId);
    }

    @Test
    @DisplayName("GET /api/inbox and PATCH /api/inbox/{id} fetch and mark notifications read")
    void testInboxEndpoints() {
        UUID userId = UUID.randomUUID();
        UUID notifId = UUID.randomUUID();
        Inbox inbox = new Inbox();
        inbox.setNotifId(notifId);
        inbox.setUserId(userId);
        inbox.setIsRead(false);

        when(inboxRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(inbox));
        when(inboxRepository.findById(notifId)).thenReturn(Optional.of(inbox));
        when(inboxRepository.save(any(Inbox.class))).thenAnswer(i -> i.getArgument(0));

        List<Inbox> inboxList = apiController.getInbox(userId);
        Inbox updated = apiController.markInboxRead(notifId);
        Inbox missing = apiController.markInboxRead(UUID.randomUUID());

        assertEquals(1, inboxList.size());
        assertNotNull(updated);
        assertTrue(updated.getIsRead());
        assertNull(missing);
    }

    @Test
    @DisplayName("POST /api/repos saves repository and logs Repo Imported audit event")
    void testCreateRepoLogsAudit() {
        UUID importerId = UUID.randomUUID();
        Repo repo = new Repo();
        repo.setRepoId(testRepoId);
        repo.setSpaceId(testSpaceId);
        repo.setGhOwner("Pest-Ctrl");
        repo.setGhName("PestControl");
        repo.setImportedBy(importerId);

        when(repoRepository.save(repo)).thenReturn(repo);

        ResponseEntity<?> response = apiController.createRepo(repo);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(repo, response.getBody());
        verify(auditLogService, times(1)).logRepoImported(importerId, testSpaceId, "Pest-Ctrl", "PestControl");
    }

    @Test
    @DisplayName("GET /api/commits without repoId returns all commits and DELETE /api/commits clears repo commits")
    void testGetAllCommitsAndClearCommits() {
        Commit commit = new Commit();
        commit.setCommitId("sha-1");
        commit.setRepoId(testRepoId);

        when(commitRepository.findAll()).thenReturn(List.of(commit));
        when(commitRepository.findByRepoIdOrderByCommittedAtDesc(testRepoId)).thenReturn(List.of(commit));

        List<Commit> all = apiController.getCommits(null);
        ResponseEntity<?> cleared = apiController.clearCommits(testRepoId);

        assertEquals(1, all.size());
        assertEquals(HttpStatus.OK, cleared.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) cleared.getBody();
        assertEquals(1, body.get("cleared"));
        verify(commitRepository, times(1)).deleteAll(List.of(commit));
    }

    @Test
    @DisplayName("User management endpoints support listing, role update, profile update, and 404")
    void testUserManagementEndpoints() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setUserId(userId);
        user.setUsername("Dev");
        user.setEmail("dev@gmail.com");
        user.setGhOAuth("ghu_old");

        when(userRepository.findAll()).thenReturn(List.of(user));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        assertEquals(1, apiController.getUsers().size());

        User roleUpdated = apiController.updateUserRole(userId, Map.of("role", "QAEngineer"));
        assertEquals(User.UserRole.QAEngineer, roleUpdated.getRole());

        Map<String, Object> profilePatch = new HashMap<>();
        profilePatch.put("username", "Updated Dev");
        profilePatch.put("passHash", "$2a$10$newhash");
        profilePatch.put("ghOAuth", "");
        ResponseEntity<?> updatedRes = apiController.updateUser(userId, profilePatch);
        assertEquals(HttpStatus.OK, updatedRes.getStatusCode());
        assertEquals("Updated Dev", user.getUsername());
        assertEquals("$2a$10$newhash", user.getPassHash());
        assertNull(user.getGhOAuth());

        ResponseEntity<?> missingRes = apiController.updateUser(UUID.randomUUID(), Map.of("username", "X"));
        assertEquals(HttpStatus.NOT_FOUND, missingRes.getStatusCode());
    }

    @Test
    @DisplayName("POST /api/users registers password user, accepts GHOAuth user, rejects invalid role and duplicate email")
    void testRegisterUserVariants() {
        when(userRepository.existsByEmailIgnoreCase("newdev@gmail.com")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("ghdev@gmail.com")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("dup@gmail.com")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        ResponseEntity<?> created = apiController.registerUser(Map.of(
                "username", " New Dev ",
                "email", " NewDev@Gmail.com ",
                "passHash", "$2a$10$hash",
                "role", "Developer"));
        assertEquals(HttpStatus.CREATED, created.getStatusCode());
        User saved = (User) created.getBody();
        assertNotNull(saved);
        assertEquals("newdev@gmail.com", saved.getEmail());
        assertEquals("New Dev", saved.getUsername());

        ResponseEntity<?> createdGh = apiController.registerUser(Map.of(
                "username", "GH Dev",
                "email", "ghdev@gmail.com",
                "ghOAuth", "ghu_token123"));
        assertEquals(HttpStatus.CREATED, createdGh.getStatusCode());

        ResponseEntity<?> invalidRole = apiController.registerUser(Map.of(
                "username", "Bad",
                "email", "bad@gmail.com",
                "passHash", "hash",
                "role", "NotARole"));
        assertEquals(HttpStatus.BAD_REQUEST, invalidRole.getStatusCode());

        ResponseEntity<?> conflict = apiController.registerUser(Map.of(
                "username", "Dup",
                "email", "dup@gmail.com",
                "passHash", "hash"));
        assertEquals(HttpStatus.CONFLICT, conflict.getStatusCode());
    }

    @Test
    @DisplayName("Issue query and update endpoints handle severity, deadline, assignee, and 404")
    void testIssueQueryAndUpdateVariants() {
        UUID reporterId = UUID.randomUUID();
        UUID assigneeId = UUID.randomUUID();
        Issue issue = new Issue();
        issue.setIssueId(testIssueId);
        issue.setSpaceId(testSpaceId);
        issue.setReporterId(reporterId);
        issue.setTitle("Bug");
        issue.setSeverity(Issue.SeverityStatus.Low);

        when(issueRepository.findAll()).thenReturn(List.of(issue));
        when(issueRepository.findById(testIssueId)).thenReturn(Optional.of(issue));
        when(issueRepository.save(any(Issue.class))).thenAnswer(i -> i.getArgument(0));

        assertEquals(1, apiController.getIssues().size());
        assertEquals(issue, apiController.getIssue(testIssueId));

        Map<String, Object> patch = new HashMap<>();
        patch.put("userId", reporterId.toString());
        patch.put("severity", "Critical");
        patch.put("deadline", "2026-12-01T12:00:00");
        patch.put("assigneeId", assigneeId.toString());

        ResponseEntity<?> res = apiController.updateIssue(testIssueId, patch);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(Issue.SeverityStatus.Critical, issue.getSeverity());
        assertEquals(LocalDateTime.of(2026, 12, 1, 12, 0), issue.getDeadline());
        assertEquals(assigneeId, issue.getAssigneeId());

        verify(auditLogService).logSeverityChanged(reporterId, testSpaceId, testIssueId, "Low", "Critical");
        verify(auditLogService).logDueDateChanged(reporterId, testSpaceId, testIssueId, null, "2026-12-01T12:00");
        verify(auditLogService).logIssueReassigned(reporterId, testSpaceId, testIssueId, "Issue reassigned");
        verify(inboxRepository).save(any(Inbox.class));

        assertEquals(HttpStatus.NOT_FOUND, apiController.updateIssue(UUID.randomUUID(), Map.of()).getStatusCode());
    }

    @Test
    @DisplayName("Audit and Space endpoints handle filtering, validation, CRUD, and 404")
    void testAuditAndSpaceEndpoints() {
        UUID userId = UUID.randomUUID();
        AuditLog log = new AuditLog();
        log.setAuditTitle("Title");

        when(auditLogRepository.findByIssueIdOrderByAuditTimeDesc(testIssueId)).thenReturn(List.of(log));
        when(auditLogRepository.findBySpaceIdOrderByAuditTimeDesc(testSpaceId)).thenReturn(List.of(log));
        when(auditLogRepository.findAll()).thenReturn(List.of(log));
        when(auditLogService.createEntry(userId, testSpaceId, testIssueId, "Manual", "Desc")).thenReturn(log);

        assertEquals(1, apiController.getAuditLogs(null, testIssueId).size());
        assertEquals(1, apiController.getAuditLogs(testSpaceId, null).size());
        assertEquals(1, apiController.getAuditLogs(null, null).size());

        ResponseEntity<?> badAudit = apiController.createAuditLog(Map.of("userId", userId.toString()));
        assertEquals(HttpStatus.BAD_REQUEST, badAudit.getStatusCode());

        ResponseEntity<?> createdAudit = apiController.createAuditLog(Map.of(
                "userId", userId.toString(),
                "spaceId", testSpaceId.toString(),
                "issueId", testIssueId.toString(),
                "auditTitle", "Manual",
                "auditDesc", "Desc"));
        assertEquals(HttpStatus.CREATED, createdAudit.getStatusCode());

        Space space = new Space();
        space.setSpaceId(testSpaceId);
        space.setSpaceName("Alpha");
        when(spaceRepository.findAll()).thenReturn(List.of(space));
        when(spaceRepository.save(any(Space.class))).thenAnswer(i -> i.getArgument(0));
        when(spaceRepository.findById(testSpaceId)).thenReturn(Optional.of(space));
        when(spaceRepository.existsById(UUID.fromString("00000000-0000-0000-0000-000000000000"))).thenReturn(false);

        assertEquals(1, apiController.getSpaces().size());
        assertEquals("Alpha", apiController.createSpace(space).getSpaceName());
        ResponseEntity<?> spaceUpdated = apiController.updateSpace(testSpaceId, Map.of("spaceName", "Beta"));
        assertEquals(HttpStatus.OK, spaceUpdated.getStatusCode());
        assertEquals("Beta", space.getSpaceName());
        assertEquals(HttpStatus.NOT_FOUND, apiController.updateSpace(UUID.randomUUID(), Map.of()).getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND,
                apiController.deleteSpace(UUID.fromString("00000000-0000-0000-0000-000000000000")).getStatusCode());
    }
}

