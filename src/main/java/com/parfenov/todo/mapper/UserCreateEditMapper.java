package com.parfenov.todo.mapper;

import com.parfenov.todo.dto.UserCreateEditDto;
import com.parfenov.todo.entity.Role;
import com.parfenov.todo.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Optional;

@RequiredArgsConstructor
@Component
public class UserCreateEditMapper implements Mapper<UserCreateEditDto, User> {
    private final PasswordEncoder passwordEncoder;

    @Override
    public User map(UserCreateEditDto object) {
        User user = User.builder()
                .username(object.getUsername())
                .role(Role.valueOf(object.getRole()))
                .build();
        Optional.ofNullable(object.getRawPassword())
                .filter(StringUtils::hasText)
                .map(passwordEncoder::encode)
                .ifPresent(user::setPassword);
        return user;
    }
}

