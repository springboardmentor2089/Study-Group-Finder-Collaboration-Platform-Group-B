package com.studygroup.studygroupfinder.controller;

import com.studygroup.studygroupfinder.model.ChatMessage;
import com.studygroup.studygroupfinder.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatRestController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/history/{groupId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable Long groupId,
            @RequestParam String userEmail) {
        try {
            List<ChatMessage> messages = chatService.getChatHistory(groupId, userEmail);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessageRequest request) {
        try {
            ChatMessage message = chatService.sendMessage(
                    request.getGroupId(),
                    request.getSenderEmail(),
                    request.getSenderName(),
                    request.getContent()
            );
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/count/{groupId}")
    public ResponseEntity<Long> getMessageCount(@PathVariable Long groupId) {
        try {
            Long count = chatService.getMessageCount(groupId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    public static class ChatMessageRequest {
        private Long groupId;
        private String senderEmail;
        private String senderName;
        private String content;

        // Getters and Setters
        public Long getGroupId() { return groupId; }
        public void setGroupId(Long groupId) { this.groupId = groupId; }

        public String getSenderEmail() { return senderEmail; }
        public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
