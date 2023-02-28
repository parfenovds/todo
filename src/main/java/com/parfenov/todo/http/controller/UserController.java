package com.parfenov.todo.http.controller;

import com.parfenov.todo.dto.TaskCreateEditDto;
import com.parfenov.todo.dto.UserCreateEditDto;
import com.parfenov.todo.dto.UserReadDto;
import com.parfenov.todo.entity.NodeType;
import com.parfenov.todo.entity.Role;
import com.parfenov.todo.service.TaskService;
import com.parfenov.todo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final TaskService taskService;

    @GetMapping("/registration")
    public String registration(Model model, @ModelAttribute("user") UserCreateEditDto user) {
        model.addAttribute("user", user);
        model.addAttribute("roles", Role.values());
        return "user/registration";
    }

    @PostMapping
    public String create(@ModelAttribute @Validated UserCreateEditDto user,
                         BindingResult bindingResult,
                         RedirectAttributes redirectAttributes) {
        checkForUsernameIsUnique(user, bindingResult);
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("user", user);
            redirectAttributes.addFlashAttribute("errors", bindingResult.getAllErrors());
            return "redirect:/users/registration";
        }
        createInitTaskForNewUser(userService.create(user));
        return "redirect:/login";
    }

    private void createInitTaskForNewUser(UserReadDto userReadDto) {
        taskService.create(TaskCreateEditDto.builder()
                .nodeId(0L)
                .userId(userReadDto.getId())
                .name("STARTING NODE")
                .text("put your text here")
                .type(NodeType.DIR)
                .done(false)
                .build());
    }

    private void checkForUsernameIsUnique(UserCreateEditDto user, BindingResult bindingResult) {
        if (userService.findOptionalUserReadDtoByUsername(user.getUsername()).isPresent()) {
            bindingResult.addError(new ObjectError("Username is not unique",
                    "Username is not unique!"));
        }
    }
}
