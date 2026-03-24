package com.studygroup.studygroupfinder.service;

import com.studygroup.studygroupfinder.model.ChatMessage;
import com.studygroup.studygroupfinder.model.GroupMember;
import com.studygroup.studygroupfinder.model.StudyGroup;
import com.studygroup.studygroupfinder.model.User;
import com.studygroup.studygroupfinder.repository.ChatMessageRepository;
import com.studygroup.studygroupfinder.repository.GroupMemberRepository;
import com.studygroup.studygroupfinder.repository.StudyGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private StudyGroupRepository studyGroupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public ChatMessage sendMessage(Long groupId, String senderEmail, String senderName, String content) {
        // Verify group exists
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Verify user is a member of the group
        GroupMember membership = groupMemberRepository.findByGroup_IdAndUserEmail(groupId, senderEmail)
                .orElseThrow(() -> new RuntimeException("User is not a member of this group"));

        // Create and save message
        ChatMessage message = new ChatMessage(group, senderEmail, senderName, content);
        message = chatMessageRepository.save(message);

        // Send message to all group members via WebSocket
        messagingTemplate.convertAndSend("/topic/group/" + groupId, message);

        return message;
    }

    public List<ChatMessage> getChatHistory(Long groupId, String userEmail) {
        // Verify group exists
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Verify user is a member of the group
        groupMemberRepository.findByGroup_IdAndUserEmail(groupId, userEmail)
                .orElseThrow(() -> new RuntimeException("User is not a member of this group"));

        return chatMessageRepository.findByGroupIdOrderByTimestampAsc(groupId);
    }

    public List<ChatMessage> getRecentMessages(Long groupId, Timestamp since) {
        return chatMessageRepository.findByGroupIdAndTimestampAfterOrderByTimestampAsc(groupId, since);
    }

    public Long getMessageCount(Long groupId) {
        return chatMessageRepository.countMessagesByGroupId(groupId);
    }
}
