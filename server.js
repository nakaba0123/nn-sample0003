require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MySQL接続設定
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// MySQL接続確認してからサーバー起動
connection.connect((err) => {
  if (err) {
    console.error('MySQL接続エラー:', err);
    process.exit(1); // エラーなら終了
  } else {
    console.log('MySQLに接続成功！');

    // サーバー起動
    app.listen(PORT, () => {
      console.log(`サーバーがポート ${PORT} で起動中！`);
    });
  }
});

// 出勤記録登録用API
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

// 勤怠データ一覧取得API
app.get('/attendance', (req, res) => {
  const query = 'SELECT * FROM attendance ORDER BY date DESC';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('DB取得エラー:', err);
      return res.status(500).json({ message: 'データ取得に失敗しました' });
    }

    res.json(results);
  });
});

app.post('/group-home', (req, res) => {
  const { propertyName, unitName, postalCode, address, phoneNumber, commonRoom, residentRooms, openingDate } = req.body;

  const query = 'INSERT INTO group_homes (property_name, unit_name, postal_code, address, phone_number, common_room, resident_rooms, opening_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  const residentRoomsString = residentRooms.join(','); // 配列を文字列にする

  connection.query(
    query,
    [propertyName, unitName, postalCode, address, phoneNumber, commonRoom, residentRoomsString, openingDate],
    (err, results) => {
      if (err) {
        console.error('DB挿入エラー:', err);
        return res.status(500).json({ message: 'データ保存に失敗しました' });
      }

      res.json({ message: 'グループホームの情報を保存しました' });
    }
  );
});

