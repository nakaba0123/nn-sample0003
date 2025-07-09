require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// MySQL コネクションプール設定
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// POST /attendance → 勤怠登録
app.post('/attendance', (req, res) => {
  const { name, date, status } = req.body;
  const query = 'INSERT INTO attendance (name, date, status) VALUES (?, ?, ?)';
  pool.query(query, [name, date, status], (err, results) => {
    if (err) {
      console.error('DB挿入エラー:', err);
      return res.status(500).json({ message: 'データ保存に失敗しました' });
    }
    res.json({ message: '出勤記録を受け取り、保存しました' });
  });
});

// GET /group-homes → グループホーム一覧取得
app.get('/group-homes', (req, res) => {
  const query = 'SELECT * FROM group_homes';
  pool.query(query, (err, results) => {
    if (err) {
      console.error('DB読み取りエラー:', err);
      return res.status(500).json({ message: 'データ取得に失敗しました' });
    }
    res.json(results);
  });
});

// POST /group-homes → グループホーム登録
app.post('/group-homes', (req, res) => {
  const {
    propertyName,
    unitName,
    postalCode,
    address,
    phoneNumber,
    commonRoom,
    residentRooms,
    openingDate
  } = req.body;

  const query = `
    INSERT INTO group_homes
    (property_name, unit_name, postal_code, address, phone_number, common_room, resident_rooms, opening_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const values = [
    propertyName,
    unitName,
    postalCode,
    address,
    phoneNumber,
    commonRoom,
    JSON.stringify(residentRooms), // JSON → TEXTに格納
    openingDate
  ];

  pool.query(query, values, (err, results) => {
    if (err) {
      console.error('DB挿入エラー:', err);
      return res.status(500).json({ message: 'データ保存に失敗しました' });
    }
    res.json({ message: 'グループホーム情報を保存しました' });
  });
});

app.get('/', (req, res) => {
  res.send('API Server is running');
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動中！`);
});

