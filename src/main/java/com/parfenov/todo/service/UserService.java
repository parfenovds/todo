package com.parfenov.todo.service;

import com.parfenov.todo.dto.UserCreateEditDto;
import com.parfenov.todo.dto.UserReadDto;
import com.parfenov.todo.mapper.UserCreateEditMapper;
import com.parfenov.todo.mapper.UserReadMapper;
import com.parfenov.todo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final UserCreateEditMapper userCreateEditMapper;
    private final UserReadMapper userReadMapper;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .map(user -> new User(
                        user.getUsername(),
                        user.getPassword(),
                        Collections.singleton(user.getRole())
                ))
                .orElseThrow(() -> new UsernameNotFoundException("Failed to retrieve user: " + username));
    }

    public UserReadDto create(UserCreateEditDto userCreateEditDto) {
        com.parfenov.todo.entity.User map = userCreateEditMapper.map(userCreateEditDto);
        return userReadMapper.map(userRepository.save(map));
    }

    @Transactional(readOnly = true)
    public UserReadDto findUserReadDtoByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(UserService::toUserReadDto)
                .orElseThrow(() -> new UsernameNotFoundException("Failed to retrieve user: " + username));
    }

    @Transactional(readOnly = true)
    public Optional<UserReadDto> findOptionalUserReadDtoByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(UserService::toUserReadDto);
    }

    @Transactional(readOnly = true)
    public List<UserReadDto> findAll() {
        return userRepository.findAll().stream()
                .map(UserService::toUserReadDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<UserReadDto> findById(Long id) {
        return userRepository.findById(id).map(UserService::toUserReadDto);
    }

    private static UserReadDto toUserReadDto(com.parfenov.todo.entity.User user) {
        return UserReadDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .build();
    }


    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}

