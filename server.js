require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MySQL 接続設定
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL接続エラー:', err);
  } else {
    console.log('MySQLに接続成功！');
  }
});

// POST /group_home 登録用エンドポイント
app.post('/group_home', (req, res) => {
  const {
    id,
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
    INSERT INTO group_homes (
      id,
      propertyName,
      unitName,
      postalCode,
      address,
      phoneNumber,
      commonRoom,
      residentRooms,
      openingDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [
      id,
      propertyName,
      unitName,
      postalCode,
      address,
      phoneNumber,
      commonRoom,
      JSON.stringify(residentRooms), // JSON配列を文字列化して保存
      openingDate
    ],
    (err, results) => {
      if (err) {
        console.error('DB挿入エラー:', err);
        return res.status(500).json({ message: 'データ保存に失敗しました' });
      }

      res.json({ message: 'グループホーム情報を保存しました！' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動中！`);
});

// ✅ createConnection → createPool に変える
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 使用時は pool.query()
pool.query('SELECT * FROM group_homes', (err, results) => {
  if (err) {
    console.error('DB読み取りエラー:', err);
    res.status(500).json({ message: 'データ取得に失敗しました' });
  } else {
    res.json(results);
  }
});

