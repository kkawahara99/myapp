import { useState, useCallback, useEffect } from 'react';
import { getExams, deleteExam } from '../api/exam';

type ExamType = {
  id: string;
  exam_type: string;
  round: number;
  subject: string;
  question_number: string;
  question_text: string;
}

export const useExams = (keyword: string) => {
  const [hitCount, setHitCount] = useState<number>(0);
  const [exams, setExams] = useState<ExamType[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedExamTitle, setSelectedExamTitle] = useState<string>("");
  // const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // const sleep = (sec: number) => new Promise(resolve =>
  //   setTimeout(resolve, sec * 1000));

  const handleGetExams = useCallback(async (page: number) => {
    if (!hasMore) return;
    // await sleep(1.0)

    getExams(keyword, page)
      .then((response) => {
        setHitCount(response.body.count);
        const newExams = response.body.exams;
        // console.log(newExams);
        // setExams((prevExams) => [...prevExams, ...newExams]);
        // 重複アイテムを除外する
        setExams((prevExams) => {
          const existingItemIds = new Set(prevExams.map(item => item.id));
          const filteredItems = newExams.filter((item: ExamType) => !existingItemIds.has(item.id));
          return [...prevExams, ...filteredItems];
        });
        // setPage((prevPage) => prevPage + 1);
        setHasMore(newExams.length >= 10);
      })
      .catch((e) => {
        console.log(e.message);
      });
  }, [hasMore, keyword]);

  useEffect(() => {
      setHasMore(true);
      setExams([]);
      // setPage(1);
  }, [keyword]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteExam(id)
      .then(() => {
        setOpen(false);
      })
      .catch((e) => {
        console.log(e.message);
      });
    setHasMore(true);
    setExams([]);
    handleGetExams(1);
    setSelectedExamId("");
    setSelectedExamTitle("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
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
  };
};
