import React, { useState } from 'react';
import { Button, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "../../hooks/use-auth";
import PrivateRoute from "../../components/PrivateRoute";
import UploadComponent from '../../components/exams/UploadCsv';

const ExamBulkCreate: React.FC = () => {
  const [progress, setProgress] = useState<string>("");
  const navigate = useNavigate();
  const auth = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  // const sleep = (sec: number) => new Promise(resolve =>
  //   setTimeout(resolve, sec * 1000));

  // フォームの送信処理
  const post = async (data: string[]): Promise<boolean> => {
    console.log(data[4]);
    await axios
      .post(`${apiUrl}/exams/`, {
          examType: data[0],
          round: data[1],
          subject: data[2],
          questionNumber: data[3],
          questionText: data[4],
          choices: [data[5], data[6], data[7], data[8], data[9]],
          answer: data[10],
          explanation: data[11],
          difficultyLevel: data[12],
          createdBy: auth.userId,
          updatedBy: auth.userId,
        }, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        return true;
      })
      .catch((e) => {
        console.log(e.message);
      });
    return false;
  };

  // キャンセル処理
  const handleBack = () => {
    navigate(-1);
  };

  // CSVデータの処理
  const handleUpload = async (data: any[]) => {
    const dataCount = data.length - 1;
    let i: number = 0;

    for (const row of data) {
      setProgress(`${i}/${dataCount} 登録完了！`);

      i += 1;
      // 1行目はスキップ
      if (i === 1) continue;

      // 行ごとにバックエンドへPOST
      await post(row);
      // await sleep(1);
    }
    // navigate(-1);
  };

  return (
    <PrivateRoute>
      <Container maxWidth="xs">
        <Box mb={2}>
          <UploadComponent onUpload={handleUpload} />
          {progress}
        </Box>
        <Button type="button" variant="outlined" onClick={handleBack}>戻る</Button>
      </Container>
    </PrivateRoute>
  );
};

export default ExamBulkCreate;
