package com.parfenov.todo.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "task")
public class Task implements BaseEntity<Long> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Task parent;
    private String name;
    private String text;
    @Enumerated(EnumType.STRING)
    private NodeType type;
    private Boolean done;
}
