// A simple in-memory store for user clock-in/out times
const userTimeRecords = {
  admin: {
    clockIn: null,
    clockOut: null,
  },
};

// Function to validate if a user exists
const userExists = (username) => {
  return userTimeRecords.hasOwnProperty(username);
};

// Clock-in a user
export const clockIn = (req, res) => {
  const { username } = req.body;

  if (!userExists(username)) {
    return res.status(404).json({ message: 'User not found' });
  }

  userTimeRecords[username].clockIn = new Date();
  userTimeRecords[username].clockOut = null; // Reset clock-out time

  res.status(200).json({
    message: 'Clock-in successful',
    clockInTime: userTimeRecords[username].clockIn,
  });
};

// Clock-out a user
export const clockOut = (req, res) => {
  const { username } = req.body;

  if (!userExists(username)) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!userTimeRecords[username].clockIn) {
    return res.status(400).json({ message: 'User has not clocked in' });
  }

  userTimeRecords[username].clockOut = new Date();

  res.status(200).json({
    message: 'Clock-out successful',
    clockOutTime: userTimeRecords[username].clockOut,
  });
};
