package com.parfenov.todo.mapper;

import com.parfenov.todo.dto.TaskReadDto;
import com.parfenov.todo.entity.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskReadMapper implements Mapper<Task, TaskReadDto>{
    @Override
    public TaskReadDto map(Task object) {
        return TaskReadDto.builder()
                .nodeId(object.getId())
                .userId(object.getUser().getId())
                .parentId(object.getParent().getId())
                .name(object.getName())
                .text(object.getText())
                .type(object.getType().name())
                .done(object.getDone())
                .build();
    }
}
