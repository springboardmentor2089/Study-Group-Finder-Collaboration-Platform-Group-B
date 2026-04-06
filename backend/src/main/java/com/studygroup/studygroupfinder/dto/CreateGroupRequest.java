package com.studygroup.studygroupfinder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateGroupRequest {
    @NotBlank(message = "Group name is required")
    @Size(min = 3, max = 100, message = "Group name must be between 3 and 100 characters")
    private String name;

    private String description;

    @NotBlank(message = "Course is required")
    private String courseName;

    private Integer maxMembers = 100;

    private String visibility = "Public";

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Integer getMaxMembers() { return maxMembers; }
    public void setMaxMembers(Integer maxMembers) { this.maxMembers = maxMembers; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
}
