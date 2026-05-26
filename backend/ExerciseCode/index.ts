import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'cisco', // put this in a .env file!
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
}));

////////////////////////////////////


//AUTH
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  next(); // ✅ they're logged in, let them through
}


//LOGIN
app.post('/api/login', async (req, res) => {
  const { id, password } = req.body;
  const user = await prisma.user.findUnique({ where: { id } });
  if (user && user.password === password) {
    req.session.userId = user.id; // store user ID in session
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
})

//REGISTER
app.post('/api/register', async (req, res) => {
  const { role, password, firstName, lastName, birthday } = req.body;
  const newUser = await prisma.user.create({
      data: { password, role, firstName, lastName, birthday }
    });
    res.status(201).json({ success: true, user: newUser });
})


//////////////


//GET
app.get('/api/user', requireAuth, async (req, res) => {
  const users = await  prisma.user.findMany();
  res.json(users);
})

//GET SPECIFIC
app.get('/api/user/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  res.json(user);
});

//POST - User Creation Old
//app.post('/api/user', async (req, res) => {
//  const { role, name, surname, birthDate } = req.body;
//  const user = await prisma.user.create({
//    data: { role, lastName: surname, firstName: name, birthday: birthDate }
//  });
//  res.status(201).json(user);
//})


////////////////////////////////////

// GET /api/todos — get all todos
app.get('/api/todos', async (req, res) => {
  const todos = await prisma.todo.findMany();
  res.json(todos);
});

// POST /api/todos — create a new todo
app.post('/api/todos', async (req, res) => {
  const { title, urgency } = req.body;
  const todo = await prisma.todo.create({
    data: { title, urgency, isCompleted: false },
  });
  res.status(201).json(todo);
});

// PUT /api/todos/:id — update a todo
app.put('/api/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, urgency, isCompleted } = req.body;
  const todo = await prisma.todo.update({
    where: { id },
    data: { title, urgency, isCompleted },
  });
  res.status(201).json(todo);
});

// DELETE /api/todos/:id — delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.todo.delete({ where: { id } });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

