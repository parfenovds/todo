package com.parfenov.todo.http.REST;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.parfenov.todo.dto.TaskCreateEditDto;
import com.parfenov.todo.dto.TaskReadDto;
import com.parfenov.todo.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
@RequiredArgsConstructor
@Controller
@RequestMapping("/tasks/api")
public class TaskRestController {
    private final TaskService taskService;
    @PostMapping
    @ResponseBody
    public Long create(@RequestBody TaskCreateEditDto task) {
        return taskService.create(task).getId();
    }
    @DeleteMapping("/{id}")
    @ResponseBody
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
        return taskService.getJson(map.get("questId"));
    }
}
