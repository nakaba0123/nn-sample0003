require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// MySQL接続設定
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

// エンドポイント定義
app.post('/attendance', (req, res) => {
  const { name, date, status } = req.body;

  const query = 'INSERT INTO attendance (name, date, status) VALUES (?, ?, ?)';
  connection.query(query, [name, date, status], (err, results) => {
    if (err) {
      console.error('DB挿入エラー:', err);
      return res.status(500).json({ message: 'データ保存に失敗しました' });
    }

    res.json({ message: '出勤記録を受け取り、保存しました' });
  });
});

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動中！`);
});

