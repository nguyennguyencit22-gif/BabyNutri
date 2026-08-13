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
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join Q&A chat room for a specific question
    socket.on('join_qna_room', ({ questionId }) => {
      if (!questionId) return;
      const room = `qna_${questionId}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined Q&A room: ${room}`);
    });

    // Leave Q&A chat room
    socket.on('leave_qna_room', ({ questionId }) => {
      if (!questionId) return;
      const room = `qna_${questionId}`;
      socket.leave(room);
      console.log(`[Socket.io] Socket ${socket.id} left Q&A room: ${room}`);
    });

    // Join FAQ real-time updates channel
    socket.on('join_faq_channel', () => {
      socket.join('faq_channel');
      console.log(`[Socket.io] Socket ${socket.id} joined faq_channel`);
    });

    socket.on('leave_faq_channel', () => {
      socket.leave('faq_channel');
      console.log(`[Socket.io] Socket ${socket.id} left faq_channel`);
    });

    // Realtime message sent via Socket in Q&A chat
    socket.on('send_qna_message', async (data, callback) => {
      try {
        const { questionId, senderId, senderRole, content, senderName } = data;
        if (!questionId || !senderId || !content || !content.trim()) return;

        let finalSenderName = senderName;
        if (!finalSenderName) {
          try {
            const [uRows] = await db.query(`SELECT full_name FROM users WHERE id = ?`, [senderId]);
            if (uRows.length > 0) finalSenderName = uRows[0].full_name;
          } catch (dbErr) {
            console.warn('DB lookup for sender name failed:', dbErr);
          }
        }

        const [result] = await db.query(
          `INSERT INTO qna_messages (question_id, sender_id, sender_role, content) VALUES (?, ?, ?, ?)`,
          [questionId, senderId, senderRole || 'parent', content.trim()]
        );

        const isExpert = (senderRole || '').toLowerCase() === 'expert';
        if (isExpert) {
          await db.query(`UPDATE questions SET status = 'Answered' WHERE id = ?`, [questionId]);
        }

        const newMessage = {
          id: result.insertId,
          questionId: Number(questionId),
          senderId: Number(senderId),
          senderName: finalSenderName || (isExpert ? 'Nutrition Expert' : 'Parent'),
          senderRole: senderRole || 'parent',
          content: content.trim(),
          createdAt: new Date().toISOString(),
        };

        // Broadcast realtime message to everyone in the room
        io.to(`qna_${questionId}`).emit('receive_qna_message', newMessage);

        // Broadcast update to FAQ screen listeners
        io.emit('question_updated', {
          questionId: String(questionId),
          status: isExpert ? 'Answered' : undefined,
          lastMessage: newMessage,
        });

        if (typeof callback === 'function') {
          callback({ success: true, message: newMessage });
        }
      } catch (err) {
        console.error('Socket send_qna_message error:', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    });

    // Realtime question creation via Socket
    socket.on('create_question_socket', async (data, callback) => {
      try {
        const { parentId, expertId, title, content, category } = data;
        if (!title || !title.trim() || !content || !content.trim()) return;

        const [result] = await db.query(
          `INSERT INTO questions (parent_id, expert_id, title, content, status) VALUES (?, ?, ?, ?, 'Pending')`,
          [parentId || null, expertId ? Number(expertId) : null, title.trim(), content.trim()]
        );

        let parentName = 'Parent';
        if (parentId) {
          const [pRows] = await db.query(`SELECT full_name FROM users WHERE id = ?`, [parentId]);
          if (pRows.length > 0) parentName = pRows[0].full_name;
        }

        let targetExpertName = null;
        if (expertId) {
          const [eRows] = await db.query(`SELECT full_name FROM users WHERE id = ?`, [expertId]);
          if (eRows.length > 0) targetExpertName = eRows[0].full_name;
        }

        const newQuestion = {
          id: result.insertId.toString(),
          title: title.trim(),
          content: content.trim(),
          category: category || 'General',
          status: 'Pending',
          createdAt: new Date().toISOString(),
          parentId: parentId ? String(parentId) : null,
          parentName,
          targetExpertId: expertId ? String(expertId) : null,
          targetExpertName,
          answer: null,
        };

        // Broadcast new question to all connected clients (FAQ screens)
        io.emit('question_created', newQuestion);

        if (typeof callback === 'function') {
          callback({ success: true, question: newQuestion });
        }
      } catch (err) {
        console.error('Socket create_question_socket error:', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
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
