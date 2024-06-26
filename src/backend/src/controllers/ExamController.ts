import { Request, Response } from 'express';
import ExamService from '../services/ExamService';
import { v4 as uuidv4 } from "uuid";

const examService = new ExamService();

export const getExams = async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword as string;
    const pageStr = req.query.page as string;
    const page = parseInt(pageStr);

    const count = await examService.getExamCount(keyword);
    const exams = await examService.getExams(keyword, page);
    const result = {
      count: count,
      exams: exams,
    }
    res.status(200).json(result);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};

export const getExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const exam = await examService.getExam(id);
    const choices = await examService.getChoices(id);
    const result = {
      exam,
      choices: choices
    }
    
    res.status(200).json(result);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};

export const createExam = async (req: Request, res: Response) => {
  try {
    const { examType, round, subject, questionNumber, questionText, 
      choices, answer, explanation, difficultyLevel, createdBy,
      updatedBy } = req.body;
    const exam_id = uuidv4();
    const newExam = {
      id: exam_id,
      examType,
      round,
      subject,
      questionNumber,
      questionText,
      answer,
      explanation,
      difficultyLevel: difficultyLevel === '' ? null : difficultyLevel,
      createdBy,
      updatedBy,
    }
    let newChoices = [];
    for (const choice of choices) {
      newChoices.push({
        id: uuidv4(),
        examId: exam_id,
        choiceText: choice,
        createdBy,
        updatedBy,
      });
    }

    const exams = await examService.createExam(newExam, newChoices);
    res.status(200).json(exams);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};

// export const updateExam = async (req: Request, res: Response) => {
//   try {
//     const { id, examType, round, subject, questionNumber, questionText, 
//       choice1, choice2, choice3, choice4, choice5, answer, explanation, 
//       difficultyLevel, updatedBy } = req.body;
//       const newExam = {
//         id,
//         examType,
//         round,
//         subject,
//         questionNumber,
//         questionText,
//         choice1,
//         choice2,
//         choice3,
//         choice4,
//         choice5,
//         answer,
//         explanation,
//         difficultyLevel,
//         updatedBy,
//       }

//     const result = await examService.updateExam(newExam);
//     res.status(200).json(result);
//   } catch (e) {
//     if (e instanceof Error) {
//       res.status(500).json({ message: e.message });
//     }
//   }
// };

export const updateExam = async (req: Request, res: Response) => {
  try {
    const { id, examType, round, subject, questionNumber, questionText, 
      choices, answer, explanation, difficultyLevel, updatedBy } = req.body;
    const newExam = {
      id: id,
      examType,
      round,
      subject,
      questionNumber,
      questionText,
      answer,
      explanation,
      difficultyLevel,
      updatedBy,
    }
    let newChoices = [];
    for (const choice of choices) {
      newChoices.push({
        id: choice.id,
        examId: id,
        choiceText: choice.choice_text,
        updatedBy,
      });
    }

    const exams = await examService.updateExam(newExam, newChoices);
    res.status(200).json(exams);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};

export const deleteExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const articles = await examService.deleteExam(id);
    res.status(200).json(articles);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};
