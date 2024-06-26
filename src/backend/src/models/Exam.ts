interface Exam {
  id: string;
  examType: string;
  round: number;
  subject: string;
  category?: string;
  questionNumber: string;
  questionText: string;
  answer: string;
  explanation: string;
  difficultyLevel?: number;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;
}

export default Exam;