package com.studygroup.studygroupfinder.repository;

import com.studygroup.studygroupfinder.model.StudySession;
import com.studygroup.studygroupfinder.model.StudyGroup;
import com.studygroup.studygroupfinder.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByGroupOrderBySessionDateAsc(StudyGroup group);

    List<StudySession> findByCreatorOrderBySessionDateAsc(User creator);

    List<StudySession> findBySessionDateAfterOrderBySessionDateAsc(LocalDateTime date);

    @Query("SELECT s FROM StudySession s WHERE s.sessionDate >= :startDate AND s.sessionDate <= :endDate ORDER BY s.sessionDate ASC")
    List<StudySession> findSessionsInDateRange(@Param("startDate") LocalDateTime startDate, 
                                               @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s FROM StudySession s JOIN s.group.members m WHERE m.user.email = :email AND s.sessionDate >= :date ORDER BY s.sessionDate ASC")
    List<StudySession> findUpcomingSessionsForUser(@Param("email") String email, @Param("date") LocalDateTime date);

    @Query("SELECT s FROM StudySession s WHERE s.group.id = :groupId AND s.sessionDate >= :date ORDER BY s.sessionDate ASC")
    List<StudySession> findUpcomingSessionsForGroup(@Param("groupId") Long groupId, @Param("date") LocalDateTime date);

    @Query("SELECT s FROM StudySession s WHERE s.reminderSent = false AND s.sessionDate <= :reminderTime")
    List<StudySession> findSessionsNeedingReminder(@Param("reminderTime") LocalDateTime reminderTime);

    @Query("SELECT s FROM StudySession s WHERE s.sessionDate BETWEEN :startOfDay AND :endOfDay ORDER BY s.sessionDate ASC")
    List<StudySession> findSessionsOnDate(@Param("startOfDay") LocalDateTime startOfDay, 
                                         @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(s) FROM StudySession s WHERE s.group.id = :groupId AND s.sessionDate >= :date")
    Long countUpcomingSessionsForGroup(@Param("groupId") Long groupId, @Param("date") LocalDateTime date);

    boolean existsByGroupAndSessionDateAndSessionTime(StudyGroup group, LocalDateTime sessionDate, String sessionTime);

    @Query("SELECT DISTINCT s FROM StudySession s JOIN s.group.members m WHERE m.user.email = :email AND s.sessionDate >= :startDate AND s.sessionDate <= :endDate ORDER BY s.sessionDate ASC")
    List<StudySession> findUserSessionsInDateRange(@Param("email") String email, 
                                                   @Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate);
}
