import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import { Todo } from "../models/todo.model";

class TodoController {
  createTodo = async (request: FastifyRequest, reply: FastifyReply) => {
    const { title, body, category, subCategory } = request.body as {
      title?: string;
      body?: string;
      category?: string;
      subCategory?: string;
    };

    if (!title || !body || !category || !subCategory) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        msg: "Title, Body, Category, and SubCategory must be provided.",
      });
    }

    try {
      const existingTodo = await Todo.findOne({ title });
      if (existingTodo) {
        return reply.code(StatusCodes.CONFLICT).send({
          msg: "A todo with this title already exists.",
        });
      }

      const newTodo = await Todo.create({ title, body, category, subCategory });

      return reply.code(StatusCodes.CREATED).send({
        todo: newTodo,
        msg: "Todo has been created!",
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
        msg: "Error creating todo.",
      });
    }
  };

  getTodos = async (_request: FastifyRequest, reply: FastifyReply) => {
    const todos = await Todo.find({}).sort("-createdAt");

    if (todos.length === 0) {
      return reply
        .code(StatusCodes.NOT_FOUND)
        .send({ msg: "Todo list is empty!" });
    }

    return reply
      .code(StatusCodes.OK)
      .send({ todos, msg: "All Todos have been fetched!" });
  };

  getSingleTodo = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const todo = await Todo.findById({ _id: id });

    if (!todo) {
      return reply
        .code(StatusCodes.NOT_FOUND)
        .send({ msg: "Requested todo not found!" });
    }

    return reply.code(StatusCodes.OK).send({ todo, msg: "Success" });
  };

  updateTodo = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const payload = request.body as Record<string, unknown>;
    const updatedTodo = await Todo.findByIdAndUpdate({ _id: id }, payload, {
      new: true,
    });

    if (!updatedTodo) {
      return reply
        .code(StatusCodes.NOT_FOUND)
        .send({ msg: "Requested todo not found!" });
    }

    return reply
      .code(StatusCodes.OK)
      .send({ todo: updatedTodo, msg: "Todo has been updated" });
  };

  deleteTodo = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const deletedTodo = await Todo.findByIdAndDelete({ _id: id });

    if (!deletedTodo) {
      return reply
        .code(StatusCodes.NOT_FOUND)
        .send({ msg: "Requested todo not found!" });
    }

    return reply
      .code(StatusCodes.OK)
      .send({ todo: deletedTodo, msg: "Todo has been deleted" });
  };
}

export const todoController = new TodoController();
