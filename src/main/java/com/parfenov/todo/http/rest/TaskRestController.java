package com.parfenov.todo.http.rest;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.parfenov.todo.dto.TaskCreateEditDto;
import com.parfenov.todo.dto.TaskReadDto;
import com.parfenov.todo.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.Map;

@RequiredArgsConstructor
@Controller
@RequestMapping("/tasks/api")
public class TaskRestController {
    private final TaskService taskService;

    @PostMapping
    @ResponseBody
    @ResponseStatus(HttpStatus.CREATED)
    public Long create(@RequestBody TaskCreateEditDto task) {
        return taskService.create(task).getId();
    }

    @DeleteMapping("/{id}")
    @ResponseBody
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        taskService.delete(id);
    }

    @PatchMapping("/{id}")
    @ResponseBody
    public TaskReadDto partialUpdate(@RequestBody Map<String, Object> updates, @PathVariable Long id) {
        return taskService.partialUpdate(updates, id);
    }

    @PostMapping("/json")
    @ResponseBody
    public ObjectNode sendData(@RequestBody Map<String, Long> map) {
        return taskService.getTreeOfAllTasksOfUser(map.get("questId"));
    }
}
