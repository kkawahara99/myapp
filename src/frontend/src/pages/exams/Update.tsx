import React from 'react';
import { useEffect, useState } from "react";
import { Typography, FormControlLabel, Button, Container, Grid, TextField, RadioGroup, Radio, Select, MenuItem } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "../../hooks/use-auth";
import PrivateRoute from "../../components/PrivateRoute";

interface ChoiceType {
  id: string;
  choice_text: string;
}

const ExamUpdate: React.FC = () => {
  const [examType, setExamType] = useState<string>('');
  const [round, setRound] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [questionNumber, setQuestionNumber] = useState<string>('');
  const [questionText, setQuestionText] = useState<string>('');
  const [choices, setChoices] = useState<ChoiceType[]>([
    { id: '', choice_text: '' },
    { id: '', choice_text: '' },
    { id: '', choice_text: '' },
    { id: '', choice_text: '' },
    { id: '', choice_text: '' },
  ]);
  const [answer, setAnswer] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [difficultyLevel, setDifficultyLevel] = useState<string>('');

  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = location.state.examId;
    await axios
      .put(`${apiUrl}/exams/${id}`, {
        id: id,
        examType: examType,
        round: round,
        subject: subject,
        questionNumber: questionNumber,
        questionText: questionText,
        choices: choices,
        answer: answer,
        explanation: explanation,
        difficultyLevel: difficultyLevel,
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
    newChoices[index].choice_text = e.target.value;
    setChoices(newChoices);
  };

  useEffect(() => {
    const id = location.state.examId;
    axios
      .get(`${apiUrl}/exams/${id}`)
      .then(response => {
        const { exam_type, round, subject, question_number, question_text,
          answer, explanation,
          difficulty_level } = response.body.exam[0];
        console.log(response.body.choices);
        setExamType(exam_type);
        setRound(round);
        setSubject(subject);
        setQuestionNumber(question_number);
        setQuestionText(question_text);
        setChoices(response.body.choices);
        setAnswer(answer);
        setExplanation(explanation);
        setDifficultyLevel(difficulty_level);
      })
      .catch(error => {
        console.error('記事情報の取得に失敗しました:', error.message);
      });
  }, [location.state.examId, apiUrl]);

  if (!choices) {
    return <div>記事を読み込んでいます...</div>;
  } else {
    return (
      <PrivateRoute>
        <Container maxWidth="xs">
          <Grid sx={{ marginTop: 8, marginBottom: 8 }}>
            <Typography variant="h5" align="center" gutterBottom>
              過去問更新
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
                  問 
                  <Select
                    label="問題No"
                    value={questionNumber}
                    onChange={(e) => setQuestionNumber(e.target.value)}
                  >
                    {numbers.map((number: number) => (
                      <MenuItem key={number} value={number}>
                        {number}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} sx={{ marginLeft: 2 }}>
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
                <Grid item xs={12} sx={{ marginLeft: 2 }}>
                  <TextField
                    fullWidth
                    label="選択肢1"
                    variant="outlined"
                    value={choices[0].choice_text}
                    onChange={handleChoises(0)}
                  />
                  <TextField
                    fullWidth
                    label="選択肢2"
                    variant="outlined"
                    value={choices[1].choice_text}
                    onChange={handleChoises(1)}
                  />
                  <TextField
                    fullWidth
                    label="選択肢3"
                    variant="outlined"
                    value={choices[2].choice_text}
                    onChange={handleChoises(2)}
                  />
                  <TextField
                    fullWidth
                    label="選択肢4"
                    variant="outlined"
                    value={choices[3].choice_text}
                    onChange={handleChoises(3)}
                  />
                  <TextField
                    fullWidth
                    label="選択肢5"
                    variant="outlined"
                    value={choices[4].choice_text}
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
              </Grid>
              <div style={{ marginTop: '16px' }}>
                <Button type="submit" variant="contained" sx={{ marginRight: '8px' }}>更新</Button>
                <Button type="button" variant="outlined" onClick={handleCancel}>キャンセル</Button>
              </div>
            </form>
          </Grid>
        </Container>
      </PrivateRoute>
    );
  }

};

export default ExamUpdate;
