package com.pestcontrol.backend.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class InboxTest
{
    @Test
    @DisplayName("Verify Inbox default values")
    void testInboxDefaults()
	{
        Inbox inbox = new Inbox();
        assertFalse(inbox.getIsRead(), "New inbox notification should default isRead to false");
        assertNull(inbox.getNotifId());
        assertNull(inbox.getCreatedAt());
    }

    @Test
    @DisplayName("Verify Inbox getters and setters")
    void testInboxGettersAndSetters()
	{
        Inbox inbox = new Inbox();
        UUID notifId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        inbox.setNotifId(notifId);
        inbox.setUserId(userId);
        inbox.setNotifTitle("Issue Assigned");
        inbox.setNotifDesc("You were assigned to bug #101");
        inbox.setIsRead(true);
        inbox.setCreatedAt(now);

        assertEquals(notifId, inbox.getNotifId());
        assertEquals(userId, inbox.getUserId());
        assertEquals("Issue Assigned", inbox.getNotifTitle());
        assertEquals("You were assigned to bug #101", inbox.getNotifDesc());
        assertTrue(inbox.getIsRead());
        assertEquals(now, inbox.getCreatedAt());
    }
}