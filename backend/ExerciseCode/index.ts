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

const privileges = {
  "USER": 1,
  "TEACHER": 5,
  "ADMIN": 10
};


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
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction, permissionLevel: number) {

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  // Fetch user role from database
  const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  const userRole = (user.role || 'user') as keyof typeof privileges;
  if (roleAuthority(userRole) < permissionLevel) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  next(); // ✅ they're logged in, let them through

}

function roleAuthority(requiredRole: keyof typeof privileges) {
  return privileges[requiredRole] ?? 0; // default to 0 if role not found
}

//LOGIN
async function login(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { username, password } = req.body;
  const user = await prisma.user.findFirst({ where: { username } });  
  if (user && user.password === password) {
    req.session.userId = user.id; // store user ID in session
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    // Timeout to prevent brute-force attacks
    setTimeout(() => {logout(req, res, next);}, 1000);
  }
}
app.post('/api/login', async (req, res) => {
  await login(req, res, next);
})


//REGISTER
async function register(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { firstName, lastName, birthday, username, password, email, phone, adress } = req.body;
  const newUser = await prisma.user.create({
      data: { password, firstName, lastName, birthday, username, email, phone, adress, role: 'USER' }
    });

  if (!newUser) { return res.status(400).json({ success: false, message: 'User creation failed' }); }
  res.status(201).json({ success: true, user: newUser });
  //await login(req, res, next);
}
app.post('/api/register', async (req, res) => {
  await register(req, res, next);
})



//LOGOUT
async function logout(req: express.Request, res: express.Response, next: express.NextFunction) {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to logout' });
    }
    //res.json({ success: true, message: 'Logged out successfully' });
  });
}
app.post('/api/logout', async (req, res) => {
  await logout(req, res, next);
});


//////////////


//GET
app.get('/api/users', async (req, res) => {
  requireAuth(req, res, next(), 10);
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

function next(): express.NextFunction {
  throw new Error('Function not implemented.');
}

