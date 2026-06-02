import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class.ts";
import * as Prisma from "./internal/prismaNamespace.ts";
export * as $Enums from './enums.ts';
export * from "./enums.ts";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Todos
 * const todos = await prisma.todo.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model Todo
 *
 */
export type Todo = Prisma.TodoModel;
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model Subject
 *
 */
export type Subject = Prisma.SubjectModel;
/**
 * Model Lesson
 *
 */
export type Lesson = Prisma.LessonModel;
/**
 * Model GradeColumn
 *
 */
export type GradeColumn = Prisma.GradeColumnModel;
/**
 * Model Grade
 *
 */
export type Grade = Prisma.GradeModel;
/**
 * Model Class
 *
 */
export type Class = Prisma.ClassModel;
/**
 * Model TimeTable
 *
 */
export type TimeTable = Prisma.TimeTableModel;
/**
 * Model Event
 *
 */
export type Event = Prisma.EventModel;
//# sourceMappingURL=client.d.ts.map