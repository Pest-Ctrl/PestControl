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
import org.springframework.data.repository.query.parser.Part;
import org.springframework.data.repository.query.parser.PartTree;

import com.pestcontrol.backend.entities.User;

@ExtendWith(MockitoExtension.class)
class UserRepositoryTest {

    @Mock
    private UserRepository userRepository;

    @Test
    @DisplayName("UserRepository extends JpaRepository<User, UUID> and maps users table")
    void testRepositoryContractAndEntityMapping() {
        RepositoryTestSupport.assertJpaRepositoryContract(UserRepository.class, User.class, UUID.class);
        RepositoryTestSupport.assertEntityTableAndId(User.class, "users", "userId");
        assertEquals("email", RepositoryTestSupport.getColumnName(User.class, "email"));
        assertEquals("username", RepositoryTestSupport.getColumnName(User.class, "username"));
        assertEquals("passhash", RepositoryTestSupport.getColumnName(User.class, "passHash"));
        assertEquals("ghoauth", RepositoryTestSupport.getColumnName(User.class, "ghOAuth"));
    }

    @Test
    @DisplayName("Derived queries parse email, case-insensitive email, and username predicates")
    void testDerivedQueriesParseCorrectly() {
        PartTree findEmail = RepositoryTestSupport.assertDerivedQueryMethod(
                UserRepository.class, User.class,
                "findByEmail", new Class<?>[]{String.class},
                Optional.class, User.class);
        assertEquals(List.of("email"), RepositoryTestSupport.getPropertyPaths(findEmail));

        PartTree findEmailIgnoreCase = RepositoryTestSupport.assertDerivedQueryMethod(
                UserRepository.class, User.class,
                "findByEmailIgnoreCase", new Class<?>[]{String.class},
                Optional.class, User.class);
        assertEquals(List.of("email"), RepositoryTestSupport.getPropertyPaths(findEmailIgnoreCase));
        assertEquals(Part.IgnoreCaseType.ALWAYS, findEmailIgnoreCase.getParts().iterator().next().shouldIgnoreCase());

        PartTree existsEmail = RepositoryTestSupport.assertDerivedQueryMethod(
                UserRepository.class, User.class,
                "existsByEmail", new Class<?>[]{String.class},
                boolean.class, null);
        assertTrue(existsEmail.isExistsProjection());
        assertEquals(List.of("email"), RepositoryTestSupport.getPropertyPaths(existsEmail));

        PartTree existsEmailIgnoreCase = RepositoryTestSupport.assertDerivedQueryMethod(
                UserRepository.class, User.class,
                "existsByEmailIgnoreCase", new Class<?>[]{String.class},
                boolean.class, null);
        assertTrue(existsEmailIgnoreCase.isExistsProjection());
        assertEquals(Part.IgnoreCaseType.ALWAYS, existsEmailIgnoreCase.getParts().iterator().next().shouldIgnoreCase());

        PartTree existsUsername = RepositoryTestSupport.assertDerivedQueryMethod(
                UserRepository.class, User.class,
                "existsByUsername", new Class<?>[]{String.class},
                boolean.class, null);
        assertTrue(existsUsername.isExistsProjection());
        assertEquals(List.of("username"), RepositoryTestSupport.getPropertyPaths(existsUsername));
    }

    @Test
    @DisplayName("findByEmailIgnoreCase and existsByEmailIgnoreCase handle case-insensitive queries")
    void testUserLookupAndExistenceQueries() {
        User admin = new User();
        admin.setUserId(UUID.randomUUID());
        admin.setEmail("admin@gmail.com");
        admin.setUsername("Admin User");
        admin.setRole(User.UserRole.Admin);

        when(userRepository.findByEmail("admin@gmail.com")).thenReturn(Optional.of(admin));
        when(userRepository.findByEmailIgnoreCase("ADMIN@GMAIL.COM")).thenReturn(Optional.of(admin));
        when(userRepository.existsByEmail("admin@gmail.com")).thenReturn(true);
        when(userRepository.existsByEmailIgnoreCase("Admin@Gmail.com")).thenReturn(true);
        when(userRepository.existsByUsername("Admin User")).thenReturn(true);
        when(userRepository.existsByUsername("Unknown")).thenReturn(false);

        assertTrue(userRepository.findByEmail("admin@gmail.com").isPresent());
        Optional<User> ignoreCaseResult = userRepository.findByEmailIgnoreCase("ADMIN@GMAIL.COM");
        assertTrue(ignoreCaseResult.isPresent());
        assertEquals(User.UserRole.Admin, ignoreCaseResult.get().getRole());

        assertTrue(userRepository.existsByEmail("admin@gmail.com"));
        assertTrue(userRepository.existsByEmailIgnoreCase("Admin@Gmail.com"));
        assertTrue(userRepository.existsByUsername("Admin User"));
        assertFalse(userRepository.existsByUsername("Unknown"));
        verify(userRepository).findByEmailIgnoreCase("ADMIN@GMAIL.COM");
    }
}

