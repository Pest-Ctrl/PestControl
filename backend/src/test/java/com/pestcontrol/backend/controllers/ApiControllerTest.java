package com.pestcontrol.backend.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.pestcontrol.backend.entities.*;
import com.pestcontrol.backend.repositories.*;
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

    private UUID testUserId;
    private UUID testSpaceId;
    private UUID testRepoId;
    private UUID testIssueId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testSpaceId = UUID.randomUUID();
        testRepoId = UUID.randomUUID();
        testIssueId = UUID.randomUUID();
    }

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
}

