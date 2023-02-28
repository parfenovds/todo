package com.parfenov.todo.http.controller;

import com.parfenov.todo.dto.UserReadDto;
import com.parfenov.todo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
@RequestMapping("/tree")
public class TaskController {
    private final UserService userService;

    @GetMapping
    public String findAll(Model model) {
        User principal = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UserReadDto userReadDtoByUsername = userService.findUserReadDtoByUsername(principal.getUsername());
        model.addAttribute("user", userReadDtoByUsername);
        return "test/tree";
    }
}
