package com.parfenov.todo.dto;

import com.parfenov.todo.entity.NodeType;
import lombok.Builder;
import lombok.Value;

import java.util.Set;
@Value
@Builder
public class TaskReadDto {
    Long nodeId;
    Long userId;
    Long parentId;
    String name;
    String text;
    String type;
    Boolean done;
}
