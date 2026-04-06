package com.studygroup.studygroupfinder.repository;

import com.studygroup.studygroupfinder.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByIsCustomFalse();
    List<Course> findByIsCustomTrue();
    List<Course> findByLevel(String level);
    
    @Query("SELECT c FROM Course c WHERE c.isCustom = false OR c.createdBy = ?1")
    List<Course> findAvailableCourses(Long userId);
    
    @Query("SELECT c FROM Course c WHERE c.title LIKE %?1% OR c.description LIKE %?1%")
    List<Course> findByTitleOrDescriptionContaining(String keyword);
}
