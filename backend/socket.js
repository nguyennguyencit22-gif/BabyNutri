const { Server } = require('socket.io');
const db = require('./db');

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join Q&A chat room for a specific question
    socket.on('join_qna_room', ({ questionId }) => {
      const room = `qna_${questionId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Leave Q&A chat room
    socket.on('leave_qna_room', ({ questionId }) => {
      const room = `qna_${questionId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });

    // Realtime message sent via Socket
    socket.on('send_qna_message', async (data) => {
      try {
        const { questionId, senderId, senderRole, content, senderName } = data;
        if (!questionId || !senderId || !content || !content.trim()) return;

        const [result] = await db.query(
          `INSERT INTO qna_messages (question_id, sender_id, sender_role, content) VALUES (?, ?, ?, ?)`,
          [questionId, senderId, senderRole || 'parent', content.trim()]
        );

        // Update question status to 'Answered' if expert replied
        if (senderRole === 'expert') {
          await db.query(`UPDATE questions SET status = 'Answered' WHERE id = ?`, [questionId]);
        }

        const newMessage = {
          id: result.insertId,
          questionId,
          senderId,
          senderName: senderName || (senderRole === 'expert' ? 'Nutrition Expert' : 'Parent'),
          senderRole: senderRole || 'parent',
          content: content.trim(),
          createdAt: new Date().toISOString(),
        };

        // Broadcast realtime message to everyone in the room
        io.to(`qna_${questionId}`).emit('receive_qna_message', newMessage);
      } catch (err) {
        console.error('Socket send_qna_message error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = { initSocket, getIo };
