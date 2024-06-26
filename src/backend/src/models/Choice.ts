interface Choice {
  id: string;
  examId: string;
  choiceText: string;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;
}

export default Choice;