package com.parfenov.todo.dto;

import com.parfenov.todo.entity.NodeType;
import lombok.Builder;
import lombok.Value;

import java.util.Set;
@Value
@Builder
public class TaskCreateEditDto {
    Long nodeId;
    Long userId;
    Long parentId;
    Set<TaskCreateEditDto> children;
    String name;
    String text;
    NodeType type;
    Boolean done;
    Boolean changed;
}
