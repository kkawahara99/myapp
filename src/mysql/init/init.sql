USE mydb;
GRANT ALL PRIVILEGES ON mydb.* TO 'admin'@'%';
FLUSH PRIVILEGES;

-- 過去問テーブル
CREATE TABLE IF NOT EXISTS exam (
  id CHAR(36) NOT NULL,
  exam_type VARCHAR(10) NOT NULL, -- 試験形式（国試、CBTなど）
  round INT NOT NULL, -- ラウンド（第1回など）
  subject VARCHAR(10) NOT NULL, -- 科目（物理、化学など）
  category VARCHAR(10), -- カテゴリ（必須、実践など）
  question_number VARCHAR(20) NOT NULL, -- 問題番号（連問あり17-18など）
  question_text TEXT NOT NULL, -- 問題文
  answer VARCHAR(10) NOT NULL, -- 正答（複数の場合カンマ区切り）
  explanation TEXT NOT NULL, -- 解説文
  difficulty_level INT,
  created_by CHAR(36) NOT NULL,
  created_at datetime NOT NULL,
  updated_by CHAR(36) NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_question (exam_type, round, subject, question_number) -- 一意性制約
);

-- 選択肢テーブル
CREATE TABLE IF NOT EXISTS choice (
  id CHAR(36) NOT NULL,
  exam_id CHAR(36) NOT NULL,
  choice_text TEXT NOT NULL,
  created_by CHAR(36) NOT NULL,
  created_at datetime NOT NULL,
  updated_by CHAR(36) NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (exam_id) REFERENCES exam(id)
);
