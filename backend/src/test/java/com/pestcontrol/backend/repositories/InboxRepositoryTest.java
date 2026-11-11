package com.pestcontrol.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.repository.query.parser.PartTree;
import org.springframework.stereotype.Repository;

import com.pestcontrol.backend.entities.Inbox;

@ExtendWith(MockitoExtension.class)
class InboxRepositoryTest {

    @Mock
    private InboxRepository inboxRepository;

    @Test
    @DisplayName("InboxRepository has @Repository stereotype, extends JpaRepository<Inbox, UUID>, and maps inbox table")
    void testRepositoryContractAndEntityMapping() {
        assertNotNull(InboxRepository.class.getAnnotation(Repository.class));
        RepositoryTestSupport.assertJpaRepositoryContract(InboxRepository.class, Inbox.class, UUID.class);
        RepositoryTestSupport.assertEntityTableAndId(Inbox.class, "inbox", "notifId");
        assertEquals("userid", RepositoryTestSupport.getColumnName(Inbox.class, "userId"));
        assertEquals("createdat", RepositoryTestSupport.getColumnName(Inbox.class, "createdAt"));
    }

    @Test
    @DisplayName("findByUserIdOrderByCreatedAtDesc parses userId predicate and createdAt DESC sort")
    void testDerivedQueryParsesCorrectly() {
        PartTree tree = RepositoryTestSupport.assertDerivedQueryMethod(
                InboxRepository.class, Inbox.class,
                "findByUserIdOrderByCreatedAtDesc", new Class<?>[]{UUID.class},
                List.class, Inbox.class);
        assertEquals(List.of("userId"), RepositoryTestSupport.getPropertyPaths(tree));
        RepositoryTestSupport.assertSortedDesc(tree, "createdAt");
    }

    @Test
    @DisplayName("findByUserIdOrderByCreatedAtDesc and findById return user notifications")
    void testFindByUserIdAndFindById() {
        UUID userId = UUID.randomUUID();
        UUID notifId = UUID.randomUUID();
        Inbox notif = new Inbox();
        notif.setNotifId(notifId);
        notif.setUserId(userId);
        notif.setNotifTitle("New Issue Assigned");

        when(inboxRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(notif));
        when(inboxRepository.findById(notifId)).thenReturn(Optional.of(notif));

        List<Inbox> notifications = inboxRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Optional<Inbox> found = inboxRepository.findById(notifId);

        assertEquals(1, notifications.size());
        assertEquals("New Issue Assigned", notifications.get(0).getNotifTitle());
        assertTrue(found.isPresent());
        assertEquals(notifId, found.get().getNotifId());
        verify(inboxRepository).findByUserIdOrderByCreatedAtDesc(userId);
    }
}

