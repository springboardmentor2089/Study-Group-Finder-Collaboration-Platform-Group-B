package com.studygroup.studygroupfinder.repository;
import com.studygroup.studygroupfinder.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmail(String recipientEmail);
    List<Notification> findByRecipientEmailAndIsRead(String recipientEmail, Boolean isRead);
    
    @Query("SELECT n FROM Notification n WHERE n.recipientEmail = ?1 ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientEmail = ?1 AND n.isRead = false")
    Long countUnreadNotifications(String recipientEmail);
    
    @Query("SELECT n FROM Notification n WHERE n.type = 'GROUP_JOIN_REQUEST' AND n.recipientEmail = ?1 AND n.isRead = false")
    List<Notification> findUnreadJoinRequests(String recipientEmail);
    
    void deleteByRecipientEmailAndIsRead(String recipientEmail, Boolean isRead);
    
}
