import React from 'react';
import { Container, Grid } from '@mui/material';
import axios from "axios";
import { useEffect, useState } from "react";

type ExamDetailsType = {
  id: string;
  exam_type: string;
  round: number;
  subject: string;
  question_number: number;
  question_text: string;
  choices: string[];
  answer: string;
  explanation: string;
  difficulty_level: number;
}

interface ExamDetailsProps {
  examId: string;
}

export const ExamDetails: React.FC<ExamDetailsProps> = ({ examId }) => {
  const [exam, setExam] = useState<ExamDetailsType>();
  const [choices, setChoices] = useState<string[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleGetExam = () => {
    axios
      .get(`${apiUrl}/exams/${examId}`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      .then((response) => {
        setExam(response.data.exam[0]);
        setChoices(response.data.choices.map((item: { choice_text: string; }) => item.choice_text));
      })
      .catch((e) => {
        console.log(e.message);
      });
  };

  // 改行文字を<br>タグに変換する関数
  const convertNewlinesToBreaks = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  useEffect(() => {
    handleGetExam();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);


  if (!exam) {
    return <div>記事を読み込んでいます...</div>;
  } else {
    return (
      <Container maxWidth="xs">
        <Grid sx={{ marginTop: 8, marginBottom: 8 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              試験形式: {exam.exam_type}
            </Grid>
            <Grid item xs={12}>
              第 {exam.round} 回
            </Grid>
            <Grid item xs={12}>
              科目: {exam.subject}
            </Grid>
            <Grid item xs={12}>
              問 {exam.question_number}
            </Grid>
            <Grid item xs={12} sx={{ marginLeft: 2 }}>
              <p>{convertNewlinesToBreaks(exam.question_text)}</p>
            </Grid>
            <Grid item xs={12} sx={{ marginLeft: 2 }}>
              <div>1 {choices[0]}</div>
              <div>2 {choices[1]}</div>
              <div>3 {choices[2]}</div>
              <div>4 {choices[3]}</div>
              <div>5 {choices[4]}</div>
            </Grid>
            <Grid item xs={12}>
              <div>解答: {exam.answer}</div>
              <div>解説: 
                <Grid item xs={12} sx={{ marginLeft: 2 }}>
                  <p>{convertNewlinesToBreaks(exam.explanation)}</p>
                </Grid>
              </div>
            </Grid>
            <Grid item xs={12}>
              難易度: {exam.difficulty_level}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    )
  }
}