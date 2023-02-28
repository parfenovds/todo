package com.parfenov.todo.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@ToString
@EqualsAndHashCode(of = "username")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User implements BaseEntity<Long>{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String username;
    private String password;
//    @OneToMany(mappedBy = "user", orphanRemoval = true)
//    private Set<Task> tasks = new HashSet<>();
    @Enumerated(EnumType.STRING)
    private Role role;
}
