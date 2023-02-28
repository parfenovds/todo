package com.parfenov.todo.mapper;

public interface Mapper<F, T> {
    T map(F object);
}
