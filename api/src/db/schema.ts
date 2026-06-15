import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";


export const users = sqliteTable("users", {
  id: text("id").primaryKey(),

  email: text("email").notNull().unique(),

  name: text("name"),

  avatarUrl: text("avatar_url"),

  createdAt: integer("created_at", {
    mode: "timestamp",
  }).notNull(),
});


export const surveys = sqliteTable("surveys", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  theme: text("theme").notNull(),
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  publishedAt: integer("published_at", {
    mode: "timestamp",
  }),
  createdAt: integer("created_at", {
    mode: "timestamp",
  }).notNull(),
});



export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),

  surveyId: text("survey_id")
    .notNull()
    .references(() => surveys.id, {
      onDelete: "cascade",
    }),

  title: text("title").notNull(),

  type: text("type").notNull(),

  required: integer("required", {
    mode: "boolean",
  })
    .notNull()
    .default(false),

  position: integer("position").notNull(),

  options: text("options"),

  createdAt: integer("created_at", {
    mode: "timestamp",
  }).notNull(),

  updatedAt: integer("updated_at", {
    mode: "timestamp",
  }).notNull(),
});

export const responses = sqliteTable("responses", {
  id: text("id").primaryKey(),

  surveyId: text("survey_id")
    .notNull()
    .references(() => surveys.id, {
      onDelete: "cascade",
    }),

  submittedAt: integer("submitted_at", {
    mode: "timestamp",
  }).notNull(),
});

export const answers = sqliteTable("answers", {
  id: text("id").primaryKey(),

  responseId: text("response_id")
    .notNull()
    .references(() => responses.id, {
      onDelete: "cascade",
    }),

  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, {
      onDelete: "cascade",
    }),

  value: text("value").notNull(),

  createdAt: integer("created_at", {
    mode: "timestamp",
  }).notNull()
});