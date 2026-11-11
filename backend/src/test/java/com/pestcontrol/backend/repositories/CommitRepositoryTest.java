package com.pestcontrol.backend.repositories;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.repository.query.parser.PartTree;

import com.pestcontrol.backend.entities.Commit;

@ExtendWith(MockitoExtension.class)
class CommitRepositoryTest {

    @Mock
    private CommitRepository commitRepository;

    @Test
    @DisplayName("CommitRepository extends JpaRepository<Commit, String> and maps commit table")
    void testRepositoryContractAndEntityMapping() {
        RepositoryTestSupport.assertJpaRepositoryContract(CommitRepository.class, Commit.class, String.class);
        RepositoryTestSupport.assertEntityTableAndId(Commit.class, "commit", "commitId");
        assertEquals("repoid", RepositoryTestSupport.getColumnName(Commit.class, "repoId"));
        assertEquals("committedat", RepositoryTestSupport.getColumnName(Commit.class, "committedAt"));
    }

    @Test
    @DisplayName("findByRepoIdOrderByCommittedAtDesc parses repoId predicate and descending sort")
    void testDerivedQueryParsesCorrectly() {
        PartTree tree = RepositoryTestSupport.assertDerivedQueryMethod(
                CommitRepository.class, Commit.class,
                "findByRepoIdOrderByCommittedAtDesc", new Class<?>[]{UUID.class},
                List.class, Commit.class);
        assertEquals(List.of("repoId"), RepositoryTestSupport.getPropertyPaths(tree));
        RepositoryTestSupport.assertSortedDesc(tree, "committedAt");
    }

    @Test
    @DisplayName("findByRepoIdOrderByCommittedAtDesc and existsById handle repo commits and deduplication")
    void testCommitLookupAndExistence() {
        UUID repoId = UUID.randomUUID();
        Commit commit = new Commit();
        commit.setCommitId("abc123sha");
        commit.setRepoId(repoId);
        commit.setMessage("Fix login");

        when(commitRepository.findByRepoIdOrderByCommittedAtDesc(repoId)).thenReturn(List.of(commit));
        when(commitRepository.existsById("abc123sha")).thenReturn(true);
        when(commitRepository.existsById("missing-sha")).thenReturn(false);

        List<Commit> commits = commitRepository.findByRepoIdOrderByCommittedAtDesc(repoId);

        assertEquals(1, commits.size());
        assertEquals("abc123sha", commits.get(0).getCommitId());
        assertTrue(commitRepository.existsById("abc123sha"));
        assertFalse(commitRepository.existsById("missing-sha"));
        verify(commitRepository).findByRepoIdOrderByCommittedAtDesc(repoId);
    }
}

