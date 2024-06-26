import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export const getExams = async (keyword: string, page: number) => {
  return axios.get(`${apiUrl}/exams`, {
    headers: {
      "Cache-Control": "no-cache",
    },
    params: { keyword, page }
  });
};

export const deleteExam = async (id: string) => {
  return axios.delete(`${apiUrl}/exams/${id}`);
};
