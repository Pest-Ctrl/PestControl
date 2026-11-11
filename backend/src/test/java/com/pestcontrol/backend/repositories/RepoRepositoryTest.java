package com.pestcontrol.backend.repositories;

import java.util.List;
import java.util.Optional;
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

import com.pestcontrol.backend.entities.Repo;

@ExtendWith(MockitoExtension.class)
class RepoRepositoryTest {

    @Mock
    private RepoRepository repoRepository;

    @Test
    @DisplayName("RepoRepository extends JpaRepository<Repo, UUID> and maps repo table")
    void testRepositoryContractAndEntityMapping() {
        RepositoryTestSupport.assertJpaRepositoryContract(RepoRepository.class, Repo.class, UUID.class);
        RepositoryTestSupport.assertEntityTableAndId(Repo.class, "repo", "repoId");
        assertEquals("spaceid", RepositoryTestSupport.getColumnName(Repo.class, "spaceId"));
        assertEquals("ghowner", RepositoryTestSupport.getColumnName(Repo.class, "ghOwner"));
        assertEquals("ghname", RepositoryTestSupport.getColumnName(Repo.class, "ghName"));
        assertEquals("importedat", RepositoryTestSupport.getColumnName(Repo.class, "importedAt"));
    }

    @Test
    @DisplayName("Derived queries parse spaceId+ghOwner+ghName and findAllByOrderByImportedAtDesc")
    void testDerivedQueriesParseCorrectly() {
        PartTree lookupTree = RepositoryTestSupport.assertDerivedQueryMethod(
                RepoRepository.class, Repo.class,
                "findBySpaceIdAndGhOwnerAndGhName",
                new Class<?>[]{UUID.class, String.class, String.class},
                Optional.class, Repo.class);
        assertEquals(List.of("spaceId", "ghOwner", "ghName"), RepositoryTestSupport.getPropertyPaths(lookupTree));

        PartTree orderedAllTree = RepositoryTestSupport.assertDerivedQueryMethod(
                RepoRepository.class, Repo.class,
                "findAllByOrderByImportedAtDesc", new Class<?>[0],
                List.class, Repo.class);
        assertFalse(orderedAllTree.hasPredicate());
        RepositoryTestSupport.assertSortedDesc(orderedAllTree, "importedAt");
    }

    @Test
    @DisplayName("findBySpaceIdAndGhOwnerAndGhName and findAllByOrderByImportedAtDesc return expected results")
    void testRepoQueries() {
        UUID spaceId = UUID.randomUUID();
        Repo repo = new Repo();
        repo.setRepoId(UUID.randomUUID());
        repo.setSpaceId(spaceId);
        repo.setGhOwner("Pest-Ctrl");
        repo.setGhName("PestControl");

        when(repoRepository.findBySpaceIdAndGhOwnerAndGhName(spaceId, "Pest-Ctrl", "PestControl"))
                .thenReturn(Optional.of(repo));
        when(repoRepository.findBySpaceIdAndGhOwnerAndGhName(spaceId, "Pest-Ctrl", "Other"))
                .thenReturn(Optional.empty());
        when(repoRepository.findAllByOrderByImportedAtDesc()).thenReturn(List.of(repo));

        Optional<Repo> found = repoRepository.findBySpaceIdAndGhOwnerAndGhName(spaceId, "Pest-Ctrl", "PestControl");
        Optional<Repo> missing = repoRepository.findBySpaceIdAndGhOwnerAndGhName(spaceId, "Pest-Ctrl", "Other");
        List<Repo> all = repoRepository.findAllByOrderByImportedAtDesc();

        assertTrue(found.isPresent());
        assertEquals("PestControl", found.get().getGhName());
        assertTrue(missing.isEmpty());
        assertEquals(1, all.size());
        verify(repoRepository).findAllByOrderByImportedAtDesc();
    }
}

