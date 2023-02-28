package com.parfenov.todo.http.controller;

import com.parfenov.todo.dto.TaskCreateEditDto;
import com.parfenov.todo.dto.UserCreateEditDto;
import com.parfenov.todo.dto.UserReadDto;
import com.parfenov.todo.entity.NodeType;
import com.parfenov.todo.entity.Role;
import com.parfenov.todo.entity.Task;
import com.parfenov.todo.service.TaskService;
import com.parfenov.todo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final TaskService taskService;

    @GetMapping
    public String findAll(Model model) {
//        model.addAttribute("users", userService.findAll())
        return "user/users";
    }

    @GetMapping("/{id}")
    public String findById(Model model, @PathVariable("id") Long id) {
//        model.addAttribute("users", userService.findById(id))
        return "user/user";
    }

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
        if (userService.findOptionalUserReadDtoByUsername(user.getUsername()).isPresent()) {
            bindingResult.addError(new ObjectError("Username is not unique", "Username is not unique!"));
        }
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("user", user);
            redirectAttributes.addFlashAttribute("errors", bindingResult.getAllErrors());
            return "redirect:/users/registration";
        }
        UserReadDto userReadDto = userService.create(user);
        Task task = taskService.create(TaskCreateEditDto.builder()
                .nodeId(0L)
                .userId(userReadDto.getId())
                .name("STARTING NODE")
                .text("put your text here")
                .type(NodeType.DIR)
                .done(false)
                .build());
        System.out.println(task);
        return "redirect:/login";
    }

    //    @PutMapping("/{id}")
    @PostMapping("/{id}/update")
    public String update(@PathVariable("id") Long id,
                         @ModelAttribute @Validated UserCreateEditDto user) {
//        userService.update(id, user);
        return "redirect:/users/{id}";
    }

    //    @DeleteMapping("/{id}")
    @PostMapping("/{id}/delete")
    public String delete(@PathVariable("id") Long id) {
//        userService.delete(id);
        return "redirect:/users";
    }
}
