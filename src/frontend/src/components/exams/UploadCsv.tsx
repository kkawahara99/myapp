import React, { useState } from 'react';
import { Paper } from '@mui/material';
import { styled } from '@mui/system';

// スタイルをカスタマイズ
const UploadContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px',
  border: '2px dashed #aaa',
  borderRadius: '8px',
  cursor: 'pointer',
});

interface UploadProps {
  onUpload: (data: any[]) => void;
}

const UploadComponent: React.FC<UploadProps> = ({ onUpload }) => {
  const [dragging, setDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFileContents(file);
    }
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // ファイルが選択された場合の処理
      readFileContents(file);
    }
  };

  const readFileContents = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target) {
        const contents = e.target.result as string;
        const lines = contents.split(/\r?\n/); // 改行で分割 (\rはオプション)
        const data = lines.map(line => line.split(',')); // CSVの各行を分割
        const processedData = data.map(row => row.map(cell => cell.replace(/\\n/g, '\n')));
        onUpload(processedData); // 親コンポーネントにデータを渡す
      }
    };
    reader.readAsText(file);
  };

  return (
    <Paper elevation={3}>
      <label htmlFor="upload-csv">
        <UploadContainer
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ borderColor: dragging ? '#2196f3' : '#aaa' }}
        >
          <input
            id="upload-csv"
            type="file"
            accept=".csv"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          {dragging ? 'ここにドラッグ&ドロップ' : 'CSVをドラッグ&ドロップするか、ここをクリックしてファイルを選択してください'}
        </UploadContainer>
      </label>
    </Paper>
  );
};

export default UploadComponent;
