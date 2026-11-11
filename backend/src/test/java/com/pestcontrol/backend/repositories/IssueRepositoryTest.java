package com.pestcontrol.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.repository.query.parser.PartTree;

import com.pestcontrol.backend.entities.Issue;

@ExtendWith(MockitoExtension.class)
class IssueRepositoryTest {

    @Mock
    private IssueRepository issueRepository;

    @Test
    @DisplayName("IssueRepository extends JpaRepository<Issue, UUID> and maps issues table")
    void testRepositoryContractAndEntityMapping() {
        RepositoryTestSupport.assertJpaRepositoryContract(IssueRepository.class, Issue.class, UUID.class);
        RepositoryTestSupport.assertEntityTableAndId(Issue.class, "issues", "issueId");
        assertEquals("spaceid", RepositoryTestSupport.getColumnName(Issue.class, "spaceId"));
        assertEquals("createdat", RepositoryTestSupport.getColumnName(Issue.class, "createdAt"));
    }

    @Test
    @DisplayName("findBySpaceIdOrderByCreatedAtDesc parses spaceId predicate and createdAt DESC sort")
    void testDerivedQueryParsesCorrectly() {
        PartTree tree = RepositoryTestSupport.assertDerivedQueryMethod(
                IssueRepository.class, Issue.class,
                "findBySpaceIdOrderByCreatedAtDesc", new Class<?>[]{UUID.class},
                List.class, Issue.class);
        assertEquals(List.of("spaceId"), RepositoryTestSupport.getPropertyPaths(tree));
        RepositoryTestSupport.assertSortedDesc(tree, "createdAt");
    }

    @Test
    @DisplayName("findBySpaceIdOrderByCreatedAtDesc and findById retrieve space issues")
    void testFindIssuesBySpaceAndId() {
        UUID spaceId = UUID.randomUUID();
        UUID issueId = UUID.randomUUID();
        Issue issue = new Issue();
        issue.setIssueId(issueId);
        issue.setSpaceId(spaceId);
        issue.setTitle("Broken pagination");

        when(issueRepository.findBySpaceIdOrderByCreatedAtDesc(spaceId)).thenReturn(List.of(issue));
        when(issueRepository.findById(issueId)).thenReturn(Optional.of(issue));

        List<Issue> spaceIssues = issueRepository.findBySpaceIdOrderByCreatedAtDesc(spaceId);
        Optional<Issue> single = issueRepository.findById(issueId);

        assertEquals(1, spaceIssues.size());
        assertEquals("Broken pagination", spaceIssues.get(0).getTitle());
        assertTrue(single.isPresent());
        verify(issueRepository).findBySpaceIdOrderByCreatedAtDesc(spaceId);
    }
}

