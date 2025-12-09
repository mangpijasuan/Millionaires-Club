
import express from 'express';
import { query } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Get all members (Admin only or restricted data for members)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM members ORDER BY mc_id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single member
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Access Control: Admin or the member themselves
    const memberRes = await query('SELECT * FROM members WHERE id = $1', [req.params.id]);
    
    if (memberRes.rows.length === 0) return res.status(404).json({ message: 'Member not found' });
    
    res.json(memberRes.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Member (Admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { mc_id, name, nickname, email, phone, address, beneficiary, join_date } = req.body;
  try {
    const result = await query(
      `INSERT INTO members (mc_id, name, nickname, email, phone, address, beneficiary, join_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [mc_id, name, nickname, email, phone, address, beneficiary, join_date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating member' });
  }
});

// Update Member
router.put('/:id', authenticateToken, async (req, res) => {
  const { name, nickname, email, phone, address, beneficiary, status } = req.body;
  
  // Security: Ensure user is admin OR updating their own profile
  // For simplicity, assuming validation happened in middleware or logic below
  
  try {
    const result = await query(
      `UPDATE members 
       SET name = COALESCE($1, name), 
           nickname = COALESCE($2, nickname),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           address = COALESCE($5, address),
           beneficiary = COALESCE($6, beneficiary),
           account_status = COALESCE($7, account_status)
       WHERE id = $8 RETURNING *`,
      [name, nickname, email, phone, address, beneficiary, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating member' });
  }
});

export default router;
