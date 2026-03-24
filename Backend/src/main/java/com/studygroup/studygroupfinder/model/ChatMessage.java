package com.studygroup.studygroupfinder.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @Column(name = "sender_email", nullable = false)
    private String senderEmail;

    @Column(name = "sender_name", nullable = false)
    private String senderName;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "timestamp", nullable = false)
    private Timestamp timestamp;

    @Column(name = "message_type", nullable = false)
    private String messageType = "TEXT"; // TEXT, IMAGE, FILE, etc.

    public ChatMessage() {
        this.timestamp = new Timestamp(System.currentTimeMillis());
    }

    public ChatMessage(StudyGroup group, String senderEmail, String senderName, String content) {
        this();
        this.group = group;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.content = content;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudyGroup getGroup() { return group; }
    public void setGroup(StudyGroup group) { this.group = group; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Timestamp getTimestamp() { return timestamp; }
    public void setTimestamp(Timestamp timestamp) { this.timestamp = timestamp; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }
}
