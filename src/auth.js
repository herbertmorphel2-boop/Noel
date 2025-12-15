import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key'; // In a real app, this should be an environment variable

export const login = (username, password) => {
  // For demonstration, we'll use a hardcoded user.
  // In a real application, you'd look up the user in a database.
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return { token };
  } else {
    return { error: 'Invalid username or password' };
  }
};
