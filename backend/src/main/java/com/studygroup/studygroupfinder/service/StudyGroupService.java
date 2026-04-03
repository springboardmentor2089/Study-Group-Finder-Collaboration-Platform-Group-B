package com.studygroup.studygroupfinder.service;

import com.studygroup.studygroupfinder.dto.CreateGroupRequest;
import com.studygroup.studygroupfinder.model.GroupMember;
import com.studygroup.studygroupfinder.model.StudyGroup;
import com.studygroup.studygroupfinder.model.User;
import com.studygroup.studygroupfinder.repository.GroupMemberRepository;
import com.studygroup.studygroupfinder.repository.StudyGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudyGroupService {

    @Autowired
    private StudyGroupRepository studyGroupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private NotificationService notificationService;

    public StudyGroup createGroup(CreateGroupRequest request, User owner) {
        StudyGroup group = new StudyGroup();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setCourseName(request.getCourseName());
        group.setMaxMembers(request.getMaxMembers());
        group.setVisibility(StudyGroup.Visibility.valueOf(request.getVisibility()));
        group.setOwnerEmail(owner.getEmail());
        group.setOwnerName(owner.getFullName());

        // Save the group first
        StudyGroup savedGroup = studyGroupRepository.save(group);

        // Add owner as a member
        GroupMember ownerMember = new GroupMember(savedGroup, owner.getEmail(), owner.getFullName(), GroupMember.Role.Owner);
        groupMemberRepository.save(ownerMember);

        return savedGroup;
    }

    public List<StudyGroup> getAllGroups() {
        return studyGroupRepository.findAll();
    }

    public List<StudyGroup> getGroupsByOwner(String ownerEmail) {
        return studyGroupRepository.findByOwnerEmail(ownerEmail);
    }

    public List<StudyGroup> getGroupsByMember(String userEmail) {
        return studyGroupRepository.findGroupsByMember(userEmail);
    }

    public Optional<StudyGroup> getGroupById(Long id) {
        return studyGroupRepository.findById(id);
    }

    public void deleteGroup(Long id, String userEmail) {
        StudyGroup group = studyGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getOwnerEmail().equals(userEmail)) {
            throw new RuntimeException("Only group owner can delete the group");
        }

        studyGroupRepository.delete(group);
    }

    public void requestToJoinGroup(Long groupId, User user) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if user is already a member
        Optional<GroupMember> existingMember = groupMemberRepository.findByGroup_IdAndUserEmail(groupId, user.getEmail());
        if (existingMember.isPresent()) {
            throw new RuntimeException("User is already a member of this group");
        }

        // Check if group is full
        Long memberCount = groupMemberRepository.countMembersByGroupId(groupId);
        if (memberCount >= group.getMaxMembers()) {
            throw new RuntimeException("Group is full");
        }

        // Create join request notification
        notificationService.createJoinRequestNotification(user, group);
    }

    public void acceptJoinRequest(Long groupId, String requesterEmail, User owner) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getOwnerEmail().equals(owner.getEmail())) {
            throw new RuntimeException("Only group owner can accept requests");
        }

        // Check if group is full
        Long memberCount = groupMemberRepository.countMembersByGroupId(groupId);
        if (memberCount >= group.getMaxMembers()) {
            throw new RuntimeException("Group is full");
        }

        // Add user to group
        User requester = authService.getUserByEmail(requesterEmail);
        GroupMember newMember = new GroupMember(group, requesterEmail, requester.getFullName());
        groupMemberRepository.save(newMember);

        // Send acceptance notification
        notificationService.createAcceptanceNotification(owner, group, requesterEmail);
    }

    public void rejectJoinRequest(Long groupId, String requesterEmail, User owner) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getOwnerEmail().equals(owner.getEmail())) {
            throw new RuntimeException("Only group owner can reject requests");
        }

        // Send rejection notification
        notificationService.createRejectionNotification(owner, group, requesterEmail);
    }

    @Autowired
    private AuthService authService;
}
