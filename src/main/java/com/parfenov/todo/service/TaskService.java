package com.parfenov.todo.service;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.parfenov.todo.dto.TaskCreateEditDto;
import com.parfenov.todo.dto.TaskReadDto;
import com.parfenov.todo.entity.Task;
import com.parfenov.todo.mapper.TaskMapper;
import com.parfenov.todo.mapper.TaskReadMapper;
import com.parfenov.todo.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final TaskReadMapper taskReadMapper;

    @Transactional(readOnly = true)
    public ObjectNode getTreeOfAllTasksOfUser(Long id) {
        JsonNodeFactory factory = new JsonNodeFactory(false);
        List<Task> tasks = taskRepository.getAllTasksByUserId(id);
        ListIterator<Task> iterator = tasks.listIterator();
        return DFS(factory, iterator, iterator.next());
    }

    private ObjectNode DFS(JsonNodeFactory factory, ListIterator<Task> iterator, Task task) {
        ArrayNode children = factory.arrayNode();
        ObjectNode jsonNode = factory.objectNode();
        nodeInfill(task, jsonNode);
        while (iterator.hasNext()) {
            Task nextTask = iterator.next();
            if (nextTask.getParent().getId().equals(task.getId())) {
                children.add(DFS(factory, iterator, nextTask));
            } else {
                iterator.previous();
                break;
            }
        }
        jsonNode.set("children", children);
        return jsonNode;
    }

    private static void nodeInfill(Task task, ObjectNode jsonNode) {
        Long parentId = (task.getParent() == null) ? 0L : task.getParent().getId();
        jsonNode
                .put("nodeId", String.valueOf(task.getId()))
                .put("userId", task.getUser().getId())
                .put("parentId", String.valueOf(parentId))
                .put("name", task.getName())
                .put("text", task.getText())
                .put("type", task.getType().name())
                .put("done", task.getDone())
                .put("changed", false);
    }

    @Transactional
    public Task create(TaskCreateEditDto task) {
        return taskRepository.save(taskMapper.map(task));
    }

    @Transactional
    public void delete(Long id) {
        taskRepository.deleteById(id);
    }

    @Transactional
    public TaskReadDto partialUpdate(TaskCreateEditDto taskCreateEditDto, Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Somehow element is not here!"));
        Optional.ofNullable(taskCreateEditDto.getName()).ifPresent(task::setName);
        Optional.ofNullable(taskCreateEditDto.getDone()).ifPresent(task::setDone);
        Optional.ofNullable(taskCreateEditDto.getText()).ifPresent(task::setText);
        Optional.ofNullable(taskCreateEditDto.getType()).ifPresent(task::setType);
        return taskReadMapper.map(taskRepository.save(task));
    }
}
