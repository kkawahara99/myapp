import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Card, Button, Grid, Typography } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { truncateText } from '../../utils/truncateText';

type ExamType = {
  id: string;
  exam_type: string;
  round: number;
  subject: string;
  question_number: string;
  question_text: string;
}

interface ExamListProps {
  exams: ExamType[];
  handleCardClick: (id: string) => void;
  handleUpdate: (id: string) => void;
  handleDeleteClick: (id: string, title: string) => void;
  handleGetExams: (page: number) => void;
  hasMore: boolean;
}

interface TruncatedTextProps {
  text: string;
  maxLength: number;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maxLength }) => {
  const truncatedText = truncateText(text, maxLength);
  return <p>{truncatedText}</p>;
};

export const ExamList: React.FC<ExamListProps> = ({ exams, handleCardClick, handleUpdate, handleDeleteClick, handleGetExams, hasMore }) => {
  return (
    <InfiniteScroll
      loadMore={(page) => handleGetExams(page)}
      loader={<progress key={0} className="progress is-success is-radiusless"></progress>}
      hasMore={hasMore}
      useWindow={false}
    >
      {exams.map((exam: ExamType) => {
        const examTitle = `${exam.exam_type}第${exam.round}回 ${exam.subject}問${exam.question_number}`;
        
        return (
          <Card sx={{ marginTop: 1, marginBottom: 1 }} key={exam.id}>
            <Button
              onClick={() => handleCardClick(exam.id)}
              color="inherit"
              fullWidth
              sx={{ display: 'block', textAlign: 'left', padding: 1 }}
            >
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>{examTitle}</Typography>
              <TruncatedText text={exam.question_text} maxLength={50} />
            </Button>
            <Grid container justifyContent="flex-end" spacing={5}>
              <Button onClick={() => handleUpdate(exam.id)}>
                <Edit />
              </Button>
              <Button
                onClick={() => handleDeleteClick(exam.id, examTitle)}
                color="error"
              >
                <Delete />
              </Button>
            </Grid>
          </Card>
        );
      })}
    </InfiniteScroll>
  );
};