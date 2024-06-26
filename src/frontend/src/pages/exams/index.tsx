import React, { useEffect, useState } from 'react';
import { Container, Button, Grid, TextField, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AddCircle } from '@mui/icons-material';
import { debounce } from 'lodash';
import { ExamDetails } from '../../components/exams/ExamDetails';
import { DeleteDialog } from '../../components/exams/DeleteDialog';
import { ExamList } from '../../components/exams/ExamList';
import { useExams } from '../../hooks/use-exams';
import PrivateRoute from "../../components/PrivateRoute";

export function Exams() {
  const [keyword, setKeyword] = useState<string>("");
  const navigate = useNavigate();

  const {
    hitCount,
    exams,
    open,
    selectedExamId,
    selectedExamTitle,
    hasMore,
    setOpen,
    setSelectedExamId,
    setSelectedExamTitle,
    handleGetExams,
    handleDelete,
  } = useExams(keyword);

  useEffect(() => {
    const debouncedGetExams = debounce(() => {
      handleGetExams(1);
    }, 500); // 500ms の遅延
    debouncedGetExams();

    // クリーンアップ関数で debounce をキャンセル
    return () => {
      debouncedGetExams.cancel();
    };
  }, [keyword, handleGetExams]);

  const handleCreate = () => {
    navigate({ pathname: '/exams/create' });
  };

  const handleBulkCreate = () => {
    navigate({ pathname: '/exams/bulkcreate' });
  };

  const handleUpdate = (id: string) => {
    navigate(`/exams/update`, {
      state: { examId: id }
    });
  };

  const handleCardClick = (id: string) => {
    setSelectedExamId(id);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setSelectedExamId(id);
    setSelectedExamTitle(title);
    setOpen(true);
  };

  return (
    <PrivateRoute>
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid
            item
            xs={selectedExamId ? 6 : 12}
            sx={{ maxHeight: '90vh', overflowY: 'auto', borderRight: selectedExamId ? '1px solid #ddd' : 'none', paddingRight: 2 }}
          >
            <h1>過去問一覧</h1>
            <Box display="flex" flexDirection="row" gap={2}>
              <Button variant="contained" onClick={handleCreate}>
                <AddCircle /> 新規作成
              </Button>
              <Button variant="contained" onClick={handleBulkCreate}>
                <AddCircle /> CSV一括登録
              </Button>
            </Box>
            <Grid item xs={12} sx={{ marginTop: 1 }}>
              <TextField
                label="キーワード"
                variant="outlined"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Grid>
            <p>{hitCount} 件ヒットしました</p>
            <Box sx={{ maxHeight: '60vh', overflowY: 'auto', border: '1px solid #ddd', padding: 1 }}>
              {exams.length > 0 ? (
                <ExamList
                  exams={exams}
                  handleCardClick={handleCardClick}
                  handleUpdate={handleUpdate}
                  handleDeleteClick={handleDeleteClick}
                  handleGetExams={handleGetExams}
                  hasMore={hasMore}
                />
              ) : (
                <></>
              )}
            </Box>

            {/* 確認用のダイアログ */}
            <DeleteDialog
              open={open}
              onClose={() => setOpen(false)}
              onConfirm={() => handleDelete(selectedExamId)}
              title={selectedExamTitle}
            />
          </Grid>
          {selectedExamId && (
            <Grid item xs={6} sx={{ maxHeight: '90vh', overflowY: 'auto', borderLeft: '1px solid #ddd', paddingLeft: 2 }}>
              <ExamDetails examId={selectedExamId} />
            </Grid>
          )}
        </Grid>
      </Container>
    </PrivateRoute>
  );
}
