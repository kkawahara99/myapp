import React, { useState } from 'react';
import { Typography, FormControlLabel, Button, Container, Grid, TextField, Radio, RadioGroup, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "../../hooks/use-auth";
import PrivateRoute from "../../components/PrivateRoute";

const ExamCreate: React.FC = () => {
  // フォーム入力の状態を管理するための state
  const [examType, setExamType] = useState<string>('');
  const [round, setRound] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [questionNumber, setQuestionNumber] = useState<string>('');
  const [questionText, setQuestionText] = useState<string>('');
  const [choices, setChoices] = useState<string[]>(['', '', '', '', '']);
  const [answer, setAnswer] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [difficultyLevel, setDifficultyLevel] = useState<string>('');
  const [isMulti, setIsMulti] = useState<boolean>(false);

  const navigate = useNavigate();
  const auth = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  // フォームの送信処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await axios
      .post(`${apiUrl}/exams/`, {
          examType: examType,
          round: round,
          subject: subject,
          questionNumber: questionNumber,
          questionText: questionText,
          choices: choices,
          answer: answer,
          explanation: explanation,
          difficultyLevel: difficultyLevel,
          createdBy: auth.userId,
          updatedBy: auth.userId,
        }, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
      })
      .catch((e) => {
        console.log(e.message);
      });
    navigate({ pathname: '/exams' });
  };

  // キャンセル処理
  const handleCancel = () => {
    navigate({ pathname: '/exams' });
  };

  // 1-99までの数列（roundや問題番号の選択に使用）
  const numbers = Array.from({ length: 99 }, (_, i) => i + 1);

  // 科目のリスト
  const subjectlist = ["物理", "化学", "生物", ];

  // 難易度リスト
  const difficultyLevels = Array.from({ length: 3 }, (_, i) => i + 1);
  
  // 選択肢設定
  const handleChoises = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChoices = [...choices];
    newChoices[index] = e.target.value;
    setChoices(newChoices);
  };

  return (
    <PrivateRoute>
      <Container maxWidth="xs">
        <Grid sx={{ marginTop: 8, marginBottom: 8 }}>
          <Typography variant="h5" align="center" gutterBottom>
            過去問作成
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography>試験形式</Typography>
                <RadioGroup
                  aria-label="examType"
                  name="examType"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  row
                  sx={{ marginLeft: 2 }}
                >
                  <FormControlLabel value="国試" control={<Radio />} label="国試" />
                  <FormControlLabel value="CBT" control={<Radio />} label="CBT" />
                  <FormControlLabel value="全統" control={<Radio />} label="全統" />
                </RadioGroup>
              </Grid>
              <Grid item xs={12}>
                第
                <Select
                  label="開催No"
                  labelId="number-select-label"
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                >
                  {numbers.map((number: number) => (
                    <MenuItem key={number} value={number}>
                      {number}
                    </MenuItem>
                  ))}
                </Select>
                回
              </Grid>
              <Grid item xs={12}>
                <Typography>科目</Typography>
                <Select
                  label="科目"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  sx={{ marginLeft: 2 }}
                >
                  {subjectlist.map((item: string) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <Typography>問題形式</Typography>
                <RadioGroup
                  aria-label="isMulti"
                  name="isMulti"
                  value={isMulti}
                  onChange={(e) => setIsMulti(e.target.value === 'true')}
                  row
                  sx={{ marginLeft: 2 }}
                >
                  <FormControlLabel value="false" control={<Radio />} label="単問" />
                  <FormControlLabel value="true" control={<Radio />} label="連問" />
                </RadioGroup>
              </Grid>
              <Grid item xs={12} sx={{ marginLeft: 2 }}>
                <Grid item xs={12} sx={{ marginBottom: 2 }}>
                  <TextField
                    fullWidth
                    label={isMulti ? "問題番号（連問の場合はハイフン'-'で表す）": "問題番号"}
                    variant="outlined"
                    value={questionNumber}
                    onChange={(e) => setQuestionNumber(e.target.value)}
                  />
                </Grid>
                <TextField
                  fullWidth
                  label="問題文"
                  variant="outlined"
                  value={questionText}
                  multiline
                  placeholder=''
                  minRows={3}
                  maxRows={20}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
              </Grid>
              {
                // 連問の場合は選択肢非表示、単問のときのみ表示
                isMulti ?
                  <></>
                :
                <>
                  <Grid item xs={12} sx={{ marginLeft: 2 }}>
                    <TextField
                      fullWidth
                      label="選択肢1"
                      variant="outlined"
                      value={choices[0]}
                      onChange={handleChoises(0)}
                    />
                    <TextField
                      fullWidth
                      label="選択肢2"
                      variant="outlined"
                      value={choices[1]}
                      onChange={handleChoises(1)}
                    />
                    <TextField
                      fullWidth
                      label="選択肢3"
                      variant="outlined"
                      value={choices[2]}
                      onChange={handleChoises(2)}
                    />
                    <TextField
                      fullWidth
                      label="選択肢4"
                      variant="outlined"
                      value={choices[3]}
                      onChange={handleChoises(3)}
                    />
                    <TextField
                      fullWidth
                      label="選択肢5"
                      variant="outlined"
                      value={choices[4]}
                      onChange={handleChoises(4)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>解答・解説</Typography>
                    <TextField
                      fullWidth
                      label="解答（複数の場合はカンマ','区切り）"
                      variant="outlined"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      sx={{ marginLeft: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="解説文"
                      variant="outlined"
                      value={explanation}
                      multiline
                      placeholder=''
                      minRows={3}
                      maxRows={20}
                      onChange={(e) => setExplanation(e.target.value)}
                      sx={{ marginLeft: 2, marginTop: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>難易度</Typography>
                    <Select
                      label="難易度"
                      value={difficultyLevel}
                      onChange={(e) => setDifficultyLevel(e.target.value)}
                      sx={{ marginLeft: 2 }}
                    >
                      {difficultyLevels.map((difficulty: number) => (
                        <MenuItem key={difficulty} value={difficulty}>
                          {difficulty}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                </>
              }
            </Grid>
            <div style={{ marginTop: '16px' }}>
              <Button type="submit" variant="contained" sx={{ marginRight: '8px' }}>登録</Button>
              <Button type="button" variant="outlined" onClick={handleCancel}>キャンセル</Button>
            </div>
          </form>
        </Grid>
      </Container>
    </PrivateRoute>
  );
};

export default ExamCreate;
